# Noxi — Plateforme Gaming

Projet de fin de formation DevOps Engineer 2025-2026.  
Déploiement complet d'une application web avec pipeline CI/CD, infrastructure as code, conteneurisation et monitoring.

## Stack applicative

- **Frontend** : React + Vite
- **Backend** : Node.js + Express + Sequelize
- **Base de données** : MariaDB 10.11
- **Conteneurisation** : Docker + Docker Compose
- **Registry** : Azure Container Registry (ACR)

## Infrastructure

- **Cloud** : Microsoft Azure (Sweden Central)
- **IaC** : Terraform
- **VMs** : 3 x Azure Linux VM (dev / staging / prod)
- **Firewall** : Network Security Groups Azure

## CI/CD

- **Outil** : GitHub Actions
- **Stratégie de branches** : GitFlow (feature → develop → staging → main)
- **Pipeline CI** : build, tests, lint, docker build check
- **Pipeline CD Staging** : déploiement automatique sur merge vers `staging`
- **Pipeline CD Prod** : déploiement manuel avec approbation sur merge vers `main`
- **Stratégie de déploiement** : Rolling update

## Monitoring

- **Métriques** : Prometheus + Grafana
- **Logs** : Loki + Promtail + Grafana
- **Alerting** : Alertmanager (email)
- **Alertes** : CPU élevé, mémoire faible, service down

## Prérequis

- Docker Desktop
- Terraform >= 1.5.0
- Azure CLI
- Compte Azure actif
- Node.js 20+

## Déploiement local

\```bash
# 1. Cloner le repo
git clone https://github.com/TON_USERNAME/noxi.git
cd noxi

# 2. Créer le fichier .env
cp .env.example .env
# Remplir les valeurs dans .env

# 3. Lancer l'application
docker compose up -d

# 4. Accéder à l'application
# App : http://localhost
# Grafana : http://localhost:3001 (admin / admin2026!)
# Prometheus : http://localhost:9090
\```

## Déploiement infrastructure Azure

\```bash
cd terraform

# 1. Configurer les credentials Azure
export ARM_CLIENT_ID="..."
export ARM_CLIENT_SECRET="..."
export ARM_TENANT_ID="..."
export ARM_SUBSCRIPTION_ID="..."

# 2. Initialiser Terraform
terraform init

# 3. Vérifier le plan
terraform plan -var-file="terraform.tfvars"

# 4. Créer l'infrastructure
terraform apply -var-file="terraform.tfvars"

# 5. Détruire l'infrastructure après utilisation
terraform destroy -var-file="terraform.tfvars"
\```

## Structure du projet

\```
noxi/
├── src/                    # Code source frontend React
├── server/                 # Code source backend Node.js
├── public/                 # Assets statiques
├── monitoring/             # Configuration monitoring
│   ├── prometheus/         # Config Prometheus + alertes
│   ├── grafana/            # Dashboards et datasources
│   ├── loki/               # Config Loki
│   └── alertmanager/       # Config Alertmanager
├── terraform/              # Infrastructure as Code
│   ├── modules/
│   │   ├── vm/             # Module VM Azure
│   │   └── acr/            # Module Azure Container Registry
│   └── environments/       # Variables par environnement
├── .github/
│   └── workflows/          # Pipelines CI/CD
│       ├── ci.yml          # Pipeline CI
│       ├── cd-staging.yml  # Pipeline CD Staging
│       └── cd-prod.yml     # Pipeline CD Production
├── Dockerfile.frontend     # Image Docker frontend
├── Dockerfile.backend      # Image Docker backend
├── docker-compose.yml      # Stack complète locale
└── nginx.conf              # Config Nginx frontend
\```

## Sécurité

- Secrets gérés via GitHub Encrypted Secrets et Azure Key Vault
- Aucun secret en clair dans le dépôt Git
- Conteneurs non-root
- HTTPS uniquement en production
- Principe du moindre privilège sur les accès Azure