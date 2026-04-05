# --- MongoDB Security Group ---

resource "aws_security_group" "mongodb" {
  name_prefix = "${var.name_prefix}-mongodb-"
  vpc_id      = var.vpc_id
  description = "MongoDB ECS task"

  ingress {
    description     = "MongoDB from allowed services"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.name_prefix}-mongodb-sg" }

  lifecycle { create_before_destroy = true }
}

# --- EFS Security Group ---

resource "aws_security_group" "efs" {
  name_prefix = "${var.name_prefix}-efs-"
  vpc_id      = var.vpc_id
  description = "EFS mount targets"

  ingress {
    description     = "NFS from MongoDB"
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.mongodb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.name_prefix}-efs-sg" }

  lifecycle { create_before_destroy = true }
}

# --- EFS ---

resource "aws_efs_file_system" "mongodb" {
  creation_token = "${var.name_prefix}-mongodb"
  encrypted      = true

  tags = { Name = "${var.name_prefix}-mongodb-efs" }
}

resource "aws_efs_mount_target" "mongodb" {
  count           = length(var.private_subnet_ids)
  file_system_id  = aws_efs_file_system.mongodb.id
  subnet_id       = var.private_subnet_ids[count.index]
  security_groups = [aws_security_group.efs.id]
}

resource "aws_efs_access_point" "mongodb" {
  file_system_id = aws_efs_file_system.mongodb.id

  posix_user {
    uid = 999
    gid = 999
  }

  root_directory {
    path = "/mongodb-data"
    creation_info {
      owner_uid   = 999
      owner_gid   = 999
      permissions = "755"
    }
  }

  tags = { Name = "${var.name_prefix}-mongodb-ap" }
}

# --- Service Discovery ---

resource "aws_service_discovery_private_dns_namespace" "main" {
  name = "${var.name_prefix}.local"
  vpc  = var.vpc_id

  tags = { Name = "${var.name_prefix}-dns-namespace" }
}

resource "aws_service_discovery_service" "mongodb" {
  name = "${var.name_prefix}-mongodb"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

# --- CloudWatch Log Group ---

resource "aws_cloudwatch_log_group" "mongodb" {
  name              = "/ecs/${var.name_prefix}/mongodb"
  retention_in_days = var.log_retention_days
}

# --- Task Definition ---

resource "aws_ecs_task_definition" "mongodb" {
  family                   = "${var.name_prefix}-mongodb"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.execution_role_arn

  volume {
    name = "mongodb-data"

    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.mongodb.id
      transit_encryption = "ENABLED"
      root_directory     = "/"
      authorization_config {
        access_point_id = aws_efs_access_point.mongodb.id
        iam             = "DISABLED"
      }
    }
  }

  container_definitions = jsonencode([{
    name      = "mongodb"
    image     = "mongo:7"
    essential = true

    portMappings = [{
      containerPort = 27017
      protocol      = "tcp"
    }]

    environment = [
      { name = "MONGO_INITDB_ROOT_USERNAME", value = var.mongodb_username },
      { name = "MONGO_INITDB_ROOT_PASSWORD", value = var.mongodb_password }
    ]

    mountPoints = [{
      sourceVolume  = "mongodb-data"
      containerPath = "/data/db"
      readOnly      = false
    }]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.mongodb.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "mongodb"
      }
    }
  }])
}

# --- ECS Service ---

resource "aws_ecs_service" "mongodb" {
  name            = "${var.name_prefix}-mongodb"
  cluster         = var.cluster_id
  task_definition = aws_ecs_task_definition.mongodb.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  platform_version = "1.4.0"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.mongodb.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.mongodb.arn
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  depends_on = [aws_efs_mount_target.mongodb]
}
