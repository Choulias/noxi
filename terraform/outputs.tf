output "vm_dev_ip" {
  description = "IP publique de la VM dev"
  value       = module.vm_dev.public_ip
}

output "vm_staging_ip" {
  description = "IP publique de la VM staging"
  value       = module.vm_staging.public_ip
}

output "vm_prod_ip" {
  description = "IP publique de la VM prod"
  value       = module.vm_prod.public_ip
}