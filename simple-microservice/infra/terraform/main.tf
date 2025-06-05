terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.0.0-beta3"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

resource "aws_s3_bucket" "video_storage_svc" {
    bucket = "video-storage-svc-bucket-uco3p8exjlu"

  tags = {
    Name        = "video-streaming-svc"
    Environment = "Dev"
  }
}

output "bucket_name" {
  value = aws_s3_bucket.video_storage_svc.bucket
}


