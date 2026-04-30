terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "azurerm" {
  features {}
}

module "acr" {
  source   = "./modules/acr"
  location = var.location
}

module "vm_dev" {
  source      = "./modules/vm"
  environment = "dev"
  location    = var.location
  vm_size     = var.vm_size

  ssh_public_key   = var.ssh_public_key
  acr_login_server = module.acr.login_server
  acr_username     = module.acr.admin_username
  acr_password     = module.acr.admin_password

  db_name          = var.db_name
  db_user          = var.db_user
  db_password      = var.db_password
  db_root_password = var.db_root_password
  jwt_secret       = var.jwt_secret
}

module "vm_staging" {
  source      = "./modules/vm"
  environment = "staging"
  location    = var.location
  vm_size     = var.vm_size

  ssh_public_key   = var.ssh_public_key
  acr_login_server = module.acr.login_server
  acr_username     = module.acr.admin_username
  acr_password     = module.acr.admin_password

  db_name          = var.db_name
  db_user          = var.db_user
  db_password      = var.db_password
  db_root_password = var.db_root_password
  jwt_secret       = var.jwt_secret
}

module "vm_prod" {
  source      = "./modules/vm"
  environment = "prod"
  location    = var.location
  vm_size     = "Standard_D2s_v4"

  ssh_public_key   = var.ssh_public_key
  acr_login_server = module.acr.login_server
  acr_username     = module.acr.admin_username
  acr_password     = module.acr.admin_password

  db_name          = var.db_name
  db_user          = var.db_user
  db_password      = var.db_password
  db_root_password = var.db_root_password
  jwt_secret       = var.jwt_secret
}