# Guide d'installation

## Prerequis

- **Node.js** v16 ou superieur
- **MySQL** 5.7+ ou **MariaDB** 10+
- **npm** (inclus avec Node.js)
- Compte **SendGrid** (optionnel, pour la verification email)

---

## Installation

### 1. Cloner le depot

```bash
git clone https://github.com/ahandriourochdi/noxi.git
cd noxi
```

### 2. Installer les dependances

```bash
npm install
```

### 3. Configurer la base de donnees

Creer une base de donnees MySQL puis importer le schema :

```bash
mysql -u root -p < noxi_database.sql
```

Le fichier `noxi_database.sql` contient :
- Le schema complet (14 tables, incluant `ncs_badges`, `ncs_user_badges` et `ncs_messages`)
- Des donnees d'exemple (utilisateurs, jeux, evenements)
- Les champs `xp`, `level` et `favoriteGame` dans `ncs_profiles`

> **Note :** Les badges (`ncs_badges`) sont automatiquement inseres au premier demarrage du serveur si la table est vide (seeding automatique).

### 4. Variables d'environnement

Creer un fichier `.env` a la racine du projet :

```env
# Base de donnees
DB_NAME=noxi
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost

# Authentification
JWT_SECRET=votre_cle_secrete_jwt

# CORS
CORS_ORIGIN=http://localhost:3006

# API (expose au frontend via Vite)
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:9090

# Email (optionnel)
SENDGRID_API_KEY=votre_cle_sendgrid
```

### 5. Lancer l'application

```bash
# Terminal 1 -- Backend (API + WebSocket)
npm run server:dev

# Terminal 2 -- Frontend
npm run dev
```

### 6. Acceder a l'application

Ouvrir `http://localhost:3006` dans le navigateur.

---

## Ports utilises

| Service | Port | Description |
|---|---|---|
| Frontend (Vite) | 3006 | Serveur de developpement |
| API REST (Express) | 5000 | Endpoints HTTP |
| WebSocket | 9090 | Communication temps reel |
| MySQL | 3306 | Base de donnees |

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur Vite (port 3006) |
| `npm run build` | Build de production |
| `npm run preview` | Previsualisation du build |
| `npm run server` | Lance le serveur Express |
| `npm run server:dev` | Lance le serveur avec Nodemon (auto-reload) |
| `npm run watchcss` | Compilation Tailwind CSS en mode watch |
| `npm run buildcss` | Compilation Tailwind CSS |
| `npm run minifycss` | Compilation et minification Tailwind CSS |

---

## Comptes de test

Apres import de `noxi_database.sql`, les comptes suivants sont disponibles :

| Utilisateur | Email | Mot de passe | Role |
|---|---|---|---|
| admin | admin@noxi.local | Admin123! | admin |
| Player1 | player1@noxi.local | Player1! | user |
| Player2 | player2@noxi.local | Player2! | user |

---

## Problemes courants

### Erreur de connexion MySQL
Verifier que le service MySQL est lance et que les identifiants dans `.env` sont corrects.

### Port deja utilise
Si un port est occupe, arreter le processus ou modifier le port dans la configuration.

### Erreurs CORS
Verifier que `CORS_ORIGIN` dans `.env` correspond a l'URL du frontend.

### Emails non envoyes
La verification email necessite une cle API SendGrid valide. Sans cette cle, les comptes restent en statut `pending`.
