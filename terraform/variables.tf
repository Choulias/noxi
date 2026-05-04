variable "location" {
  description = "Région Azure"
  type        = string
  default     = "swedencentral"
}

variable "vm_size" {
  description = "Taille de la VM Azure"
  type        = string
  default     = "Standard_D2s_v4"
}

variable "ssh_public_key" {
  description = "Clé SSH publique"
  type        = string
}

variable "db_name" {
  type      = string
  sensitive = true
}

variable "db_user" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_root_password" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}