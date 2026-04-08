# Architecture globale

## Vue d'ensemble

Noxi est une application web full-stack composee de trois services principaux :

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend      │     │    API REST      │     │    WebSocket     │
│  React + Vite    │────►│    Express.js    │     │   Server (ws)    │
│   Port 3006      │     │   Port 5000      │     │   Port 9090      │
└─────────────────┘     └────────┬──────────┘     └────────┬─────────┘
                                 │                          │
                                 ▼                          │
                        ┌─────────────────┐                 │
                        │     MySQL        │◄────────────────┘
                        │   Port 3306      │
                        └─────────────────┘
```

## Stack technique

| Couche | Technologies |
|---|---|
| **Frontend** | React 18, Vite 4 (manual chunks: vendor, ui, animation), Tailwind CSS 3, SCSS, Material UI, Framer Motion, GSAP |
| **Backend** | Express.js 4, Sequelize 6 (ORM), JWT, bcryptjs, SendGrid |
| **Temps reel** | WebSocket natif (librairie `ws`) |
| **Base de donnees** | MySQL / MariaDB |
| **Outils** | Nodemon, PostCSS, Autoprefixer |

## Flux de donnees

### Lazy loading
Les composants de route sont charges en lazy loading via `React.lazy` + `Suspense` dans `AnimatedRoutes.jsx`, ce qui reduit la taille du bundle initial.

### Requetes HTTP (API REST)
1. Le frontend envoie des requetes via **Axios** avec un token JWT en header
2. L'API Express recoit la requete, passe par les middlewares (auth, admin, error)
3. Le controleur execute la logique metier via les modeles Sequelize
4. La reponse JSON est renvoyee au client

### Temps reel (WebSocket)
1. Le client se connecte au serveur WebSocket (port 9090)
2. Un `clientId` unique est attribue a la connexion
3. Les actions de jeu sont envoyees via `ws.send(JSON.stringify(...))`
4. Le serveur traite l'action, met a jour l'etat, et **broadcast** a tous les joueurs de la partie
5. Certains messages sont prives (envoyes uniquement au joueur concerne)

### Authentification
1. Inscription → hash du mot de passe → email de verification → JWT
2. Connexion → verification du hash → JWT (expire apres 2 jours)
3. Chaque requete protegee passe par `authMiddleware` qui valide le JWT
4. Un intercepteur Axios cote client redirige vers `/login` si le JWT expire (401)
5. Protection IDOR : les mutations sur les ressources utilisateur (profil, amities, demandes d'amis) verifient la propriete
6. Le serveur WebSocket applique un rate limit (20 msg/sec) et nettoie les connexions mortes toutes les 30s
7. Le serveur de developpement Vite envoie des headers de securite (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`)

### Systeme XP, niveaux et badges
- Les joueurs gagnent de l'XP en terminant des parties (via `POST /stats/record`)
- Le niveau est calcule automatiquement a partir de l'XP
- Des badges sont attribues lorsque des conditions sont remplies (nombre de parties jouees, victoires, etc.)
- Chaque joueur peut definir un jeu favori affiche sur son profil

## Structure des dossiers

```
noxi/
├── docs/                    # Documentation du projet
├── server/
│   ├── index.js             # Point d'entree (Express + WebSocket)
│   ├── config/database.js   # Connexion Sequelize
│   ├── models/              # 12 modeles Sequelize
│   ├── controllers/         # 11 controleurs
│   ├── routes/              # 11 fichiers de routes
│   ├── middleware/           # Auth, admin, error handling
│   ├── util/                # Utilitaires (email)
│   ├── games/               # Moteurs de jeu
│   │   ├── games.js         # Helpers d'initialisation
│   │   └── mascarade/       # Moteur Mascarade
│   └── uploads/             # Fichiers uploades
├── src/
│   ├── components/          # Composants React
│   │   ├── UI/              # Composants UI reutilisables (Spinner, Toast)
│   │   ├── Chat/            # Systeme de chat (bulle, drawer, conversations)
│   ├── scss/                # Styles SCSS
│   ├── assets/              # Images, audio, video
│   ├── api.js               # Instance Axios
│   └── main.jsx             # Point d'entree React
├── package.json
├── vite.config.js
├── tailwind.config.cjs
└── noxi_database.sql        # Schema SQL initial
```
