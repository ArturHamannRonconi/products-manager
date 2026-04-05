variable "parameters" {
  description = "List of SSM parameters to create"
  type = list(object({
    name  = string
    value = string
    type  = optional(string, "SecureString")
  }))
  default = []
}
