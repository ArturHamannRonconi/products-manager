output "parameter_arns" {
  description = "Map of parameter name to ARN"
  value       = { for k, v in aws_ssm_parameter.this : k => v.arn }
}
