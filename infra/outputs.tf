output "alb_dns_name" {
  description = "ALB DNS name — access the application here"
  value       = module.ecs_cluster.alb_dns_name
}

output "frontend_url" {
  description = "Frontend URL"
  value       = local.frontend_url
}

output "api_url" {
  description = "Backend API URL"
  value       = local.api_url
}

output "ecr_backend_url" {
  description = "ECR repository URL for backend"
  value       = module.ecs_cluster.ecr_repository_urls["backend"]
}

output "ecr_frontend_url" {
  description = "ECR repository URL for frontend"
  value       = module.ecs_cluster.ecr_repository_urls["frontend"]
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs_cluster.cluster_name
}

output "ecs_backend_service" {
  description = "ECS backend service name"
  value       = module.ecs_cluster.service_names["backend"]
}

output "ecs_frontend_service" {
  description = "ECS frontend service name"
  value       = module.ecs_cluster.service_names["frontend"]
}

output "s3_bucket_name" {
  description = "S3 bucket for product image uploads"
  value       = module.uploads_bucket.bucket_name
}

output "domain_name" {
  description = "Base domain name"
  value       = var.domain_name
}
