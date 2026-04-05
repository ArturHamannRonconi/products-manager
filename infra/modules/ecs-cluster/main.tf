# --- ECS Tasks Trust Policy ---

data "aws_iam_policy_document" "ecs_tasks_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# --- ECS Cluster ---

resource "aws_ecs_cluster" "main" {
  name = "${var.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = var.container_insights ? "enabled" : "disabled"
  }
}

# --- ECR Repositories ---

resource "aws_ecr_repository" "repos" {
  for_each = toset(var.ecr_repositories)

  name                 = "${var.name_prefix}-${each.value}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "repos" {
  for_each = toset(var.ecr_repositories)

  repository = aws_ecr_repository.repos[each.value].name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last ${var.ecr_max_image_count} images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = var.ecr_max_image_count
      }
      action = { type = "expire" }
    }]
  })
}

# --- ALB Security Group ---

resource "aws_security_group" "alb" {
  name_prefix = "${var.name_prefix}-alb-"
  vpc_id      = var.vpc_id
  description = "ALB security group"

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.name_prefix}-alb-sg" }

  lifecycle { create_before_destroy = true }
}

# --- Application Load Balancer ---

resource "aws_lb" "main" {
  name               = "${var.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  tags = { Name = "${var.name_prefix}-alb" }
}

# --- Route 53 Hosted Zone ---

resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = { Name = "${var.name_prefix}-zone" }
}

# ===========================================================================
#  Locals
# ===========================================================================

locals {
  services_map = { for svc in var.services : svc.name => svc }

  services_with_subdomain = {
    for k, svc in local.services_map : k => svc if svc.sub_domain_name != null
  }

  subdomain_service_keys = sort(keys(local.services_with_subdomain))

  # First service cert (alphabetically) is the HTTPS listener default
  default_cert_service_key = local.subdomain_service_keys[0]

  additional_cert_services = {
    for k, svc in local.services_with_subdomain : k => svc
    if k != local.default_cert_service_key
  }

  # Only create task roles for services that have policies
  services_with_task_role = {
    for k, svc in local.services_map : k => svc if length(svc.task_role_policies) > 0
  }

  # Flatten service policies into a map keyed by "service:policy-name"
  task_role_policies_flat = merge([
    for svc_name, svc in local.services_with_task_role : {
      for policy_name, policy_json in svc.task_role_policies :
      "${svc_name}:${policy_name}" => {
        service_name = svc_name
        policy_name  = policy_name
        policy_json  = policy_json
      }
    }
  ]...)
}

# ===========================================================================
#  Per-service subdomain: ACM certificates, DNS records, listener certs
# ===========================================================================

# --- ACM Certificate per subdomain service ---

resource "aws_acm_certificate" "service" {
  for_each = local.services_with_subdomain

  domain_name       = "${each.value.sub_domain_name}.${var.domain_name}"
  validation_method = "DNS"

  tags = { Name = "${var.name_prefix}-${each.key}-cert" }

  lifecycle { create_before_destroy = true }
}

# --- DNS Validation Records ---

resource "aws_route53_record" "service_cert_validation" {
  for_each = local.services_with_subdomain

  zone_id = aws_route53_zone.main.zone_id
  name    = tolist(aws_acm_certificate.service[each.key].domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.service[each.key].domain_validation_options)[0].resource_record_type
  ttl     = 60
  records = [tolist(aws_acm_certificate.service[each.key].domain_validation_options)[0].resource_record_value]

  allow_overwrite = true
}

# --- Route 53 A Records for subdomains ---

resource "aws_route53_record" "service_subdomain" {
  for_each = local.services_with_subdomain

  zone_id = aws_route53_zone.main.zone_id
  name    = "${each.value.sub_domain_name}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# --- HTTP Listener (redirect to HTTPS) ---

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# --- HTTPS Listener ---

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.service[local.default_cert_service_key].arn

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

# --- Additional Listener Certificates (SNI) ---

resource "aws_lb_listener_certificate" "service" {
  for_each = local.additional_cert_services

  listener_arn    = aws_lb_listener.https.arn
  certificate_arn = aws_acm_certificate.service[each.key].arn
}

# --- ECS Task Execution Role ---

resource "aws_iam_role" "ecs_execution" {
  name               = "${var.name_prefix}-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_trust.json
}

resource "aws_iam_role_policy_attachment" "ecs_execution_base" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_execution_extra" {
  for_each = var.execution_role_extra_policies

  name   = each.key
  role   = aws_iam_role.ecs_execution.id
  policy = each.value
}

# ===========================================================================
#  Per-service resources (created from var.services)
# ===========================================================================

# --- Service Security Groups ---

resource "aws_security_group" "service" {
  for_each = local.services_map

  name_prefix = "${var.name_prefix}-${each.key}-"
  vpc_id      = var.vpc_id
  description = "${each.key} ECS tasks"

  ingress {
    description     = "From ALB"
    from_port       = each.value.container_port
    to_port         = each.value.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.name_prefix}-${each.key}-sg" }

  lifecycle { create_before_destroy = true }
}

# --- Target Groups ---

resource "aws_lb_target_group" "service" {
  for_each = local.services_map

  name        = "${var.name_prefix}-${each.key}"
  port        = each.value.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = each.value.health_check_path
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = { Name = "${var.name_prefix}-${each.key}-tg" }
}

# --- ALB Listener Rules ---

resource "aws_lb_listener_rule" "service" {
  for_each = local.services_map

  listener_arn = aws_lb_listener.https.arn
  priority     = each.value.listener_priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.service[each.key].arn
  }

  # Host-header routing for services with sub_domain_name
  dynamic "condition" {
    for_each = each.value.sub_domain_name != null ? [1] : []
    content {
      host_header {
        values = ["${each.value.sub_domain_name}.${var.domain_name}"]
      }
    }
  }

  # Path-based routing for services without sub_domain_name
  dynamic "condition" {
    for_each = each.value.sub_domain_name == null ? [1] : []
    content {
      path_pattern {
        values = each.value.listener_paths
      }
    }
  }
}

# --- CloudWatch Log Groups ---

resource "aws_cloudwatch_log_group" "service" {
  for_each = local.services_map

  name              = "/ecs/${var.name_prefix}/${each.key}"
  retention_in_days = each.value.log_retention_days
}

# --- Task Roles ---

resource "aws_iam_role" "task" {
  for_each = local.services_with_task_role

  name               = "${var.name_prefix}-${each.key}-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_trust.json
}

resource "aws_iam_role_policy" "task" {
  for_each = local.task_role_policies_flat

  name   = each.value.policy_name
  role   = aws_iam_role.task[each.value.service_name].id
  policy = each.value.policy_json
}

# --- Task Definitions ---

resource "aws_ecs_task_definition" "service" {
  for_each = local.services_map

  family                   = "${var.name_prefix}-${each.key}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = each.value.cpu
  memory                   = each.value.memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = lookup(local.services_with_task_role, each.key, null) != null ? aws_iam_role.task[each.key].arn : null

  container_definitions = jsonencode([{
    name      = each.key
    image     = "${aws_ecr_repository.repos[each.key].repository_url}:latest"
    essential = true

    portMappings = [{
      containerPort = each.value.container_port
      protocol      = "tcp"
    }]

    environment = each.value.environment

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.service[each.key].name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = each.key
      }
    }
  }])
}

# --- ECS Services ---

resource "aws_ecs_service" "service" {
  for_each = local.services_map

  name            = "${var.name_prefix}-${each.key}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.service[each.key].arn
  desired_count   = each.value.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.service[each.key].id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.service[each.key].arn
    container_name   = each.key
    container_port   = each.value.container_port
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  depends_on = [aws_lb_listener_rule.service]
}
