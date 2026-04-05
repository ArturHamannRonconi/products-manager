variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for ALB"
  type        = list(string)
}

variable "domain_name" {
  description = "Domain name for Route 53 and ACM certificate"
  type        = string
}

variable "ecr_repositories" {
  description = "List of ECR repository names to create (appended to name_prefix)"
  type        = list(string)
  default     = []
}

variable "ecr_max_image_count" {
  description = "Maximum number of images to keep per ECR repository"
  type        = number
  default     = 5
}

variable "container_insights" {
  description = "Enable Container Insights on the ECS cluster"
  type        = bool
  default     = false
}

variable "execution_role_extra_policies" {
  description = "Map of policy name to policy JSON for extra ECS execution role inline policies"
  type        = map(string)
  default     = {}
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for ECS services"
  type        = list(string)
}

variable "region" {
  description = "AWS region (used for CloudWatch log configuration)"
  type        = string
}

variable "services" {
  description = "List of ECS services to create. Each service gets its own SG, target group, listener rule, log group, task definition, and ECS service. Services with sub_domain_name get a dedicated ACM certificate and host-header based routing."
  type = list(object({
    name               = string
    sub_domain_name    = optional(string)
    container_port     = number
    cpu                = number
    memory             = number
    desired_count      = number
    task_role_policies = optional(map(string), {})
    health_check_path  = string
    listener_priority  = number
    listener_paths     = optional(list(string), [])
    log_retention_days = optional(number, 14)
    environment = optional(list(object({
      name  = string
      value = string
    })), [])
  }))
  default = []
}
