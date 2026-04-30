resource "azurerm_resource_group" "acr_rg" {
  name     = "rg-noxi-acr"
  location = var.location
}

resource "azurerm_container_registry" "acr" {
  name                = "noxiacr${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.acr_rg.name
  location            = azurerm_resource_group.acr_rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}