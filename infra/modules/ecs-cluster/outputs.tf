output "cluster_id" {
  description = "ECS cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecr_repository_urls" {
  description = "Map of repository name to URL"
  value       = { for k, v in aws_ecr_repository.repos : k => v.repository_url }
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = aws_security_group.alb.id
}

output "https_listener_arn" {
  description = "HTTPS listener ARN"
  value       = aws_lb_listener.https.arn
}

output "execution_role_arn" {
  description = "ECS task execution role ARN"
  value       = aws_iam_role.ecs_execution.arn
}

output "execution_role_name" {
  description = "ECS task execution role name"
  value       = aws_iam_role.ecs_execution.name
}

output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = data.aws_route53_zone.main.zone_id
}

output "certificate_arns" {
  description = "Map of service key to ACM certificate ARN"
  value       = { for k, v in data.aws_acm_certificate.service : k => v.arn }
}

# --- Per-service outputs ---

output "service_names" {
  description = "Map of service key to ECS service name"
  value       = { for k, v in aws_ecs_service.service : k => v.name }
}

output "service_security_group_ids" {
  description = "Map of service key to security group ID"
  value       = { for k, v in aws_security_group.service : k => v.id }
}
