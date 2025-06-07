terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Security group for the application
resource "aws_security_group" "app_sg" {
  name        = "tum-study-planner-sg"
  
  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Frontend (nginx)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Program catalog service
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Study plan service
  ingress {
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "tum-study-planner-sg"
  }
}

# EC2 instance
resource "aws_instance" "app_server" {
  ami           = "ami-084568db4383264d4"  # Your specific AMI ID
  instance_type = var.instance_type
  key_name      = var.key_pair_name
  
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  
  # User data script for Ubuntu (using apt instead of yum)
  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y python3 python3-pip git curl
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # Start Docker service
    systemctl start docker
    systemctl enable docker
    
    # Add ubuntu user to docker group
    usermod -a -G docker ubuntu
    
    # Install Docker Compose
    pip3 install docker-compose
  EOF
  
  tags = {
    Name = "tum-study-planner-server"
  }
}

# Elastic IP for consistent access
resource "aws_eip" "app_ip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"
  
  tags = {
    Name = "tum-study-planner-ip"
  }
}