locals {
  parameters_map = { for p in var.parameters : p.name => p }
}

resource "aws_ssm_parameter" "this" {
  for_each = local.parameters_map

  name  = each.key
  type  = each.value.type
  value = each.value.value

  lifecycle { ignore_changes = [value] }
}
