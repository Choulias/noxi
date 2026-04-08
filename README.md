# Noxi -- Plateforme de Gaming Multijoueur en Temps Reel

Noxi est une plateforme communautaire de jeux multijoueur en temps reel, construite autour d'un univers nocturne et futuriste. Les joueurs peuvent s'affronter en ligne, participer a des evenements, consulter des classements et personnaliser leur profil.

---

## Table des matieres

- [Apercu du projet](#aperçu-du-projet)
- [Stack technique](#stack-technique)
- [Fonctionnalites](#fonctionnalités)
- [Jeux disponibles](#jeux-disponibles)
- [Installation rapide](#installation-rapide)
- [Documentation](#documentation)

---

## Apercu du projet

**Type** : Application web full-stack (SPA + API REST + WebSocket)
**Theme** : Plateforme de gaming communautaire a l'esthetique cyberpunk/nocturne
**Langue de l'interface** : Francais

Noxi permet aux utilisateurs de :
- Jouer a des jeux multijoueur en temps reel (Tic-Tac-Toe, Board Game, Mascarade)
- Creer et rejoindre des parties publiques ou privees
- Participer a des evenements communautaires
- Consulter les classements et profils des joueurs
- Gerer un systeme d'amis (demandes, acceptation)
- Personnaliser leur profil (pseudo, bio, avatar)

---

## Stack technique

| Couche | Technologies |
|---|---|
| **Frontend** | React 18, Vite 4, Tailwind CSS 3, SCSS, Material UI, Framer Motion, GSAP, Swiper |
| **Backend** | Express.js 4, Sequelize 6, JWT, bcryptjs, SendGrid |
| **Temps reel** | WebSocket natif (librairie `ws`) |
| **Base de donnees** | MySQL / MariaDB |

> Voir [docs/architecture/](docs/architecture/) pour les details complets.

---

## Fonctionnalites

- **Jeux multijoueur temps reel** : Tic-Tac-Toe, Board Game, Mascarade
- **Authentification** : JWT + verification email (SendGrid)
- **Profils** : Personnalisation, avatars RoboHash, historique
- **Communaute** : Evenements, classements, systeme d'amis
- **Administration** : Dashboard avec gestion joueurs/jeux/evenements

---

## Jeux disponibles

| Jeu | Joueurs | Description |
|---|---|---|
| **Tic-Tac-Toe** | 2 | Grille 3x3, tour par tour, score cumule |
| **Board Game** | 2-3 | Placement de balles colorees en temps reel |
| **Mascarade** | 4-8 | Jeu de bluff avec 16 masques et pouvoirs uniques |

> Voir [docs/games/mascarade/](docs/games/mascarade/) pour la documentation complete de Mascarade.

---

## Installation rapide

```bash
# Cloner et installer
git clone https://github.com/ahandriourochdi/noxi.git
cd noxi
npm install

# Configurer la BDD
mysql -u root -p < noxi_database.sql

# Creer un fichier .env (voir docs/setup/installation.md)

# Lancer
npm run server:dev   # Terminal 1 - Backend
npm run dev          # Terminal 2 - Frontend
```

Ouvrir `http://localhost:3006`

> Voir [docs/setup/installation.md](docs/setup/installation.md) pour le guide complet.

---

## Documentation

Toute la documentation detaillee est dans le dossier [`docs/`](docs/) :

| Section | Description |
|---|---|
| [Architecture](docs/architecture/) | Vue d'ensemble, frontend, backend, base de donnees |
| [API](docs/api/routes.md) | Reference complete des endpoints REST |
| [WebSocket](docs/websocket/protocol.md) | Protocole de communication temps reel |
| [Jeux](docs/games/) | Documentation des jeux (regles, implementation) |
| [Installation](docs/setup/installation.md) | Guide d'installation detaille |
| [Design](docs/design/ui-guidelines.md) | Systeme de design, palette, typographie |

---

## Licence

ISC
