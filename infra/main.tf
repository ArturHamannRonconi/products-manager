data "aws_caller_identity" "current" {}

resource "random_uuid" "jwt_seller_secret" {}
resource "random_uuid" "jwt_customer_secret" {}


locals {
  name_prefix = "${var.project_name}-${var.environment}"

  backend_port  = 3001
  frontend_url  = "https://app.${var.domain_name}"
  api_url       = "https://api.${var.domain_name}"
  ssm_prefix    = "/${var.project_name}/${var.environment}"
  mongodb_uri   = "mongodb://${var.mongodb_username}:${var.mongodb_password}@${module.mongodb.dns_hostname}:27017/${var.project_name}?authSource=admin"
}


module "networking" {
  source = "./modules/networking"

  name_prefix          = local.name_prefix
  region               = var.aws_region
  vpc_cidr             = var.vpc_cidr
  azs                  = var.azs
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs

  interface_endpoint_services = [
    "ecr.dkr",
    "ecr.api",
    "logs",
    "ssm",
    "elasticfilesystem"
  ]
}

module "uploads_bucket" {
  source = "./modules/s3-bucket"

  bucket_name          = "${local.name_prefix}-uploads"
  region               = var.aws_region
  force_destroy        = true
  enable_public_access = false

  cors_rules = [{
    max_age_seconds = 3600
    allowed_headers = ["*"]
    allowed_origins = ["*"]
    allowed_methods = ["GET", "PUT"]
  }]
}


module "parameters" {
  source = "./modules/parameter-store"

  parameters = [
    {
      name  = "${local.ssm_prefix}/PORT"
      value = local.backend_port
      type  = "SecureString"
    },
    {
      name  = "${local.ssm_prefix}/S3_BUCKET_NAME"
      value = module.uploads_bucket.bucket_id
      type  = "SecureString"
    },
    {
      name  = "${local.ssm_prefix}/FRONTEND_URL"
      value = local.frontend_url
      type  = "SecureString"
    },
    {
      name  = "${local.ssm_prefix}/MONGODB_URI"
      value = local.mongodb_uri
      type  = "SecureString"
    },
    {
      name  = "${local.ssm_prefix}/JWT_SELLER_SECRET"
      value = random_uuid.jwt_seller_secret.result
      type  = "SecureString"
    },
    {
      name  = "${local.ssm_prefix}/JWT_CUSTOMER_SECRET"
      value = random_uuid.jwt_customer_secret.result
      type  = "SecureString"
    },
  ]
}

module "ecs_cluster" {
  source = "./modules/ecs-cluster"

  region             = var.aws_region
  domain_name        = var.domain_name
  name_prefix        = local.name_prefix
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  ecr_repositories   = ["backend", "frontend"]

  services = [
    {
      name              = "frontend"
      sub_domain_name   = "app"

      listener_priority = 200
      container_port    = 3000
      health_check_path = "/"

      cpu               = var.frontend_cpu
      memory            = var.frontend_memory
      desired_count     = var.frontend_desired_count

      environment = [
        {
          name  = "NEXT_PUBLIC_API_URL",
          value = local.api_url
        },
      ]
    },
    {
      name              = "backend"
      sub_domain_name   = "api"

      listener_priority = 100
      container_port    = 3001
      health_check_path = "/health"

      cpu               = var.backend_cpu
      memory            = var.backend_memory
      desired_count     = var.backend_desired_count
      
      task_role_policies = {
        s3-access = templatefile(
          "${path.module}/policies/s3-access.json",
          { bucket_arn = module.uploads_bucket.bucket_arn }
        )
        ssm-read = templatefile(
          "${path.module}/policies/ssm-read.json",
          { ssm_parameter_arn_prefix = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter${local.ssm_prefix}" }
        )
      }

      environment = [
        {
          name = "NODE_ENV",
          value = "prod"
        },
      ]
    }
  ]
}

module "mongodb" {
  source = "./modules/mongodb-ecs"

  name_prefix        = local.name_prefix
  region             = var.aws_region
  cluster_id         = module.ecs_cluster.cluster_id
  execution_role_arn = module.ecs_cluster.execution_role_arn
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids

  allowed_security_group_ids = [module.ecs_cluster.service_security_group_ids["backend"]]

  mongodb_username = var.mongodb_username
  mongodb_password = var.mongodb_password
  cpu              = var.mongodb_cpu
  memory           = var.mongodb_memory
}
