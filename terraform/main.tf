# This Terraform configuration sets up an AWS EC2 instance with a security group that allows HTTP and SSH traffic

provider "aws" {
  region = var.aws_region
}

resource "aws_security_group" "app_sg" {
  name        = "app-server-sg"
  description = "Allow HTTP and SSH traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow SSH access from anywhere"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP traffic for the client"
  }

  ingress {
    description = "Allow traffic for frontend client"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

ingress {
    from_port   = 8080
    to_port     = 8083
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow traffic for microservices"
  }


# Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "app-server-sg"
  }
}

resource "aws_instance" "app_server" {
  ami           = "ami-01816d07b1128cd2d" # Amazon Machine Image ID for Amazon Linux 2023
  instance_type = var.instance_type
  key_name      = var.aws_key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  tags = {
    Name = "Study-Planner-App-Server"
  }

  # Install Docker and Docker Compose
user_data = <<-EOF
            #!/bin/bash
            yum update -y
            
            # Install Python 3.9, Docker, and other essentials
            yum install -y python3 python39 python3-pip docker git
            
            # Set up python3.9 as the default python3 (for Ansible compatibility)
            alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1
            
            # Start Docker services
            systemctl start docker
            systemctl enable docker
            usermod -a -G docker ec2-user
            
            # Install Docker Compose
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
            ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
            
            # Signal completion
            echo "Setup completed at $(date)" > /tmp/setup-complete.txt
            EOF
}

output "public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.app_server.id
}