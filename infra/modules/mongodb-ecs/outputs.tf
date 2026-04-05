output "dns_hostname" {
  description = "DNS hostname for the MongoDB service (use in connection strings)"
  value       = "${aws_service_discovery_service.mongodb.name}.${aws_service_discovery_private_dns_namespace.main.name}"
}

output "security_group_id" {
  description = "MongoDB security group ID"
  value       = aws_security_group.mongodb.id
}

output "service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.mongodb.name
}

output "log_group_name" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.mongodb.name
}
