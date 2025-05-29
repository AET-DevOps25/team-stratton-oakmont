output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.app_ip.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = "http://${aws_eip.app_ip.public_ip}"
}

output "program_catalog_service_url" {
  description = "Program catalog service URL"
  value       = "http://${aws_eip.app_ip.public_ip}:8080"
}

output "study_plan_service_url" {
  description = "Study plan service URL"
  value       = "http://${aws_eip.app_ip.public_ip}:8081"
}