# Documentation Noxi

Bienvenue dans la documentation du projet **Noxi** -- Plateforme de Gaming Multijoueur en Temps Reel.

---

## Sommaire

### Architecture
- [Vue d'ensemble](architecture/overview.md) -- Architecture globale, stack technique, flux de donnees
- [Frontend](architecture/frontend.md) -- Composants React, routing, gestion d'etat
- [Backend](architecture/backend.md) -- API Express, middleware, controleurs
- [Base de donnees](architecture/database.md) -- Schema MySQL, modeles Sequelize, relations

### API
- [Reference des endpoints](api/routes.md) -- Toutes les routes REST, parametres, authentification

### WebSocket
- [Protocole temps reel](websocket/protocol.md) -- Messages, flux de communication, gestion des parties

### Communication
- Le systeme de **chat** (messages prives entre joueurs et chat en partie) est integre via WebSocket et l'API REST. Voir [protocole WebSocket](websocket/protocol.md) et [endpoints API](api/routes.md).

### Jeux
- **[Guide : Ajouter un nouveau jeu](games/ADD_NEW_GAME.md)** -- Etapes completes pour creer un nouveau jeu
- [Mascarade](games/mascarade/README.md) -- Jeu de bluff multijoueur (4-8 joueurs)
  - [Regles du jeu](games/mascarade/regles.md) -- Regles completes de Mascarade
  - [Implementation technique](games/mascarade/implementation.md) -- Moteur de jeu, WebSocket, animations

### Installation et serveur
- [Guide d'installation](setup/installation.md) -- Prerequis, configuration, lancement
- [Memo serveur production](setup/server.md) -- Commandes SSH, phpMyAdmin, deploiement, DNS

### Design
- [Systeme de design](design/ui-guidelines.md) -- Palette, typographie, composants, effets visuels
