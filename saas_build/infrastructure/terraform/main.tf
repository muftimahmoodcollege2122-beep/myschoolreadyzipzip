terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "myschoolapp-terraform-state"
    key    = "production/terraform.tfstate"
    region = "ap-south-1"
    encrypt        = true
    dynamodb_table = "myschoolapp-tf-lock"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = { Project = "myschoolapp", Environment = var.environment, ManagedBy = "terraform" }
  }
}

variable "aws_region"   { default = "ap-south-1" }
variable "environment"  { default = "production" }
variable "db_password"  { sensitive = true }
variable "redis_auth"   { sensitive = true }

# ── VPC ──────────────────────────────────────────────────────
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  name = "myschoolapp-vpc"
  cidr = "10.0.0.0/16"
  azs              = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
  private_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets   = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
  database_subnets = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]
  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true
  enable_flow_log        = true
  create_flow_log_cloudwatch_iam_role  = true
  create_flow_log_cloudwatch_log_group = true
}

# ── EKS ──────────────────────────────────────────────────────
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"
  cluster_name    = "myschoolapp-cluster"
  cluster_version = "1.29"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true
  eks_managed_node_groups = {
    general = {
      instance_types = ["r6g.xlarge"]
      min_size     = 3
      max_size     = 20
      desired_size = 3
      labels = { role = "general" }
    }
    workers = {
      instance_types = ["c6g.large"]
      min_size     = 2
      max_size     = 10
      desired_size = 2
      labels = { role = "workers" }
      taints = [{ key = "workers", value = "true", effect = "NO_SCHEDULE" }]
    }
  }
}

# ── RDS PostgreSQL ────────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name       = "myschoolapp-db"
  subnet_ids = module.vpc.database_subnets
}

resource "aws_db_instance" "main" {
  identifier     = "myschoolapp-postgres"
  engine         = "postgres"
  engine_version = "16.1"
  instance_class = "db.r6g.large"
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  db_name  = "myschoolapp"
  username = "myschoolapp"
  password = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  multi_az               = true
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  deletion_protection     = true
  skip_final_snapshot     = false
  final_snapshot_identifier = "myschoolapp-final-${formatdate("YYYYMMDD", timestamp())}"
  performance_insights_enabled = true
}

# ── ElastiCache Redis ─────────────────────────────────────────
resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "myschoolapp-redis"
  description          = "MySchool App Redis cluster"
  node_type            = "cache.r6g.large"
  num_cache_clusters   = 3
  automatic_failover_enabled = true
  multi_az_enabled           = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token = var.redis_auth
  engine_version = "7.0"
}

# ── S3 Buckets ────────────────────────────────────────────────
resource "aws_s3_bucket" "uploads" {
  bucket = "myschoolapp-uploads-${var.environment}"
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    id     = "archive"
    status = "Enabled"
    transition { days = 90;  storage_class = "STANDARD_IA" }
    transition { days = 365; storage_class = "GLACIER" }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
  }
}

resource "aws_kms_key" "s3" {
  description             = "MySchool App S3 encryption key"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

# ── CloudFront ────────────────────────────────────────────────
resource "aws_cloudfront_distribution" "web" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = ["myschoolapp.pk", "www.myschoolapp.pk"]

  origin {
    domain_name = "web-alb.ap-south-1.elb.amazonaws.com"
    origin_id   = "web-alb"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "web-alb"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    cache_policy_id        = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  }

  restrictions { geo_restriction { restriction_type = "none" } }
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.main.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_acm_certificate" "main" {
  domain_name               = "myschoolapp.pk"
  subject_alternative_names = ["*.myschoolapp.pk"]
  validation_method         = "DNS"
  lifecycle { create_before_destroy = true }
}
