output "public_ip" {
  description = "IP publique de la VM"
  value       = azurerm_public_ip.pip.ip_address
}

output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}