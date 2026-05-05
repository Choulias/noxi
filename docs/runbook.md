# Runbook Opérationnel — Noxi

Ce document décrit les procédures courantes pour opérer l'infrastructure Noxi.

---

## 1. Déployer une nouvelle version

### Via le pipeline (recommandé)
\```bash
# 1. Créer une branche feature
git checkout -b feature/ma-feature develop

# 2. Développer et commiter
git add .
git commit -m "feat: description de la feature"

# 3. Ouvrir une Pull Request vers develop
# → Le pipeline CI se déclenche automatiquement

# 4. Merger vers staging
# → Le pipeline CD staging déploie automatiquement

# 5. Merger vers main
# → Le pipeline CD prod attend une approbation manuelle
# → Approuver dans GitHub Actions → déploiement prod
\```

### Déploiement manuel d'urgence
\```bash
# Se connecter à la VM
ssh -i ~/.ssh/noxi_azure azureuser@IP_DE_LA_VM

# Mettre à jour les images et redémarrer
cd /app/noxi
docker compose pull
docker compose up -d
\```

---

## 2. Rollback — Revenir à une version précédente

\```bash
# Se connecter à la VM prod
ssh -i ~/.ssh/noxi_azure azureuser@IP_PROD

# Lister les images disponibles avec leurs tags
docker images | grep noxi

# Revenir à une version précédente (remplacer SHA par le commit souhaité)
docker compose down
sed -i 's/:latest/:SHA_PRECEDENT/g' docker-compose.yml
docker compose up -d

# Vérifier que tout tourne
docker compose ps
\```

---

## 3. Consulter les logs

### Logs en temps réel d'un service
\```bash
# Se connecter à la VM
ssh -i ~/.ssh/noxi_azure azureuser@IP_DE_LA_VM

# Logs du backend
docker compose logs -f backend

# Logs du frontend
docker compose logs -f frontend

# Logs de la base de données
docker compose logs -f db

# Tous les logs en même temps
docker compose logs -f
\```

### Via Grafana (interface web)
1. Ouvrir `http://IP_DE_LA_VM:3001`
2. Login : `admin`
3. Aller dans **Explore** → sélectionner **Loki**
4. Filtrer par service : `{compose_service="backend"}`

---

## 4. Répondre à une alerte

### Alerte CPU élevé
\```bash
# Se connecter à la VM
ssh -i ~/.ssh/noxi_azure azureuser@IP_DE_LA_VM

# Vérifier les processus qui consomment le plus
top

# Redémarrer le service concerné si nécessaire
docker compose restart backend
\```

### Alerte mémoire faible
\```bash
# Vérifier l'utilisation mémoire
free -h
docker stats --no-stream

# Nettoyer les images et conteneurs inutilisés
docker system prune -f
\```

### Alerte service down
\```bash
# Vérifier l'état des conteneurs
docker compose ps

# Redémarrer le service down
docker compose restart NOM_DU_SERVICE

# Si ça ne suffit pas, redémarrer toute la stack
docker compose down
docker compose up -d
\```

---

## 5. Allumer / Éteindre les VMs

\```bash
# Allumer toutes les VMs
az vm start --resource-group rg-noxi-dev --name vm-noxi-dev --no-wait
az vm start --resource-group rg-noxi-staging --name vm-noxi-staging --no-wait
az vm start --resource-group rg-noxi-prod --name vm-noxi-prod --no-wait

# Éteindre toutes les VMs (économie de coûts)
az vm deallocate --resource-group rg-noxi-dev --name vm-noxi-dev --no-wait
az vm deallocate --resource-group rg-noxi-staging --name vm-noxi-staging --no-wait
az vm deallocate --resource-group rg-noxi-prod --name vm-noxi-prod --no-wait
\```

---

## 6. Recréer toute l'infrastructure

\```bash
cd terraform

# Recréer depuis zéro
terraform apply -var-file="terraform.tfvars"

# Détruire après la présentation
terraform destroy -var-file="terraform.tfvars"
\```

---

## 7. Accès aux interfaces de monitoring

| Interface | URL | Login |
|---|---|---|
| Grafana | http://IP_VM:3001 | - |
| Prometheus | http://IP_VM:9090 | - |
| Alertmanager | http://IP_VM:9093 | - |