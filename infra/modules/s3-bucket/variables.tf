variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "force_destroy" {
  description = "Allow bucket destruction even with objects"
  type        = bool
  default     = false
}

variable "enable_public_access" {
  description = "Enable public access to the bucket"
  type        = bool
  default     = false
}

variable "cors_rules" {
  description = "CORS rules for the bucket"
  type = list(object({
    allowed_headers = list(string)
    allowed_methods = list(string)
    allowed_origins = list(string)
    max_age_seconds = optional(number, 3600)
  }))
  default = []
}

variable "create_vpc_endpoint" {
  description = "Create an S3 VPC Gateway Endpoint"
  type        = bool
  default     = false
}

variable "restrict_to_vpc_endpoint" {
  description = "Add a bucket policy that denies all access except through the VPC endpoint (requires create_vpc_endpoint = true)"
  type        = bool
  default     = false
}

variable "vpc_id" {
  description = "VPC ID for the S3 VPC Endpoint (required if create_vpc_endpoint is true)"
  type        = string
  default     = ""
}

variable "route_table_ids" {
  description = "Route table IDs for the S3 VPC Endpoint (required if create_vpc_endpoint is true)"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Additional tags for the bucket"
  type        = map(string)
  default     = {}
}
