variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "cluster_id" {
  description = "ECS cluster ID to run the MongoDB service in"
  type        = string
}

variable "execution_role_arn" {
  description = "ECS task execution role ARN"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for the MongoDB service and EFS mount targets"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security group IDs allowed to connect to MongoDB (port 27017)"
  type        = list(string)
}

variable "ecr_image_url" {
  description = "ECR image URL for the MongoDB container (e.g. 123456789.dkr.ecr.us-east-1.amazonaws.com/name-mongodb:latest)"
  type        = string
}

variable "mongodb_username" {
  description = "MongoDB root username"
  type        = string
  default     = "admin"
}

variable "mongodb_password" {
  description = "MongoDB root password"
  type        = string
  sensitive   = true
}

variable "cpu" {
  description = "Task CPU units"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Task memory (MB)"
  type        = number
  default     = 512
}

variable "log_retention_days" {
  description = "CloudWatch log group retention in days"
  type        = number
  default     = 14
}
