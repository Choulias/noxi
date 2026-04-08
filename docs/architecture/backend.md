# Architecture Backend

## Technologies

| Technologie | Version | Role |
|---|---|---|
| Express.js | 4.18.2 | API REST |
| Sequelize | 6.29.1 | ORM pour MySQL |
| MySQL2 | 3.2.0 | Driver de base de donnees |
| JSON Web Token | 9.0.0 | Authentification stateless |
| bcryptjs | 2.4.3 | Hachage des mots de passe |
| SendGrid | 7.7.0 | Envoi d'emails de verification |
| ws | 1.0.34 | Serveur WebSocket |
| UUID | 9.0.0 | Generation d'identifiants uniques |
| CORS | 2.8.5 | Gestion des requetes cross-origin |
| Multer | -- | Upload de fichiers |

## Point d'entree (`server/index.js`)

Le fichier principal initialise :
1. L'application Express (port 5000)
2. Le serveur WebSocket (port 9090)
3. La connexion a la base de donnees via Sequelize
4. Les middlewares globaux (CORS, JSON, error handler)
5. Les routes API
6. Les handlers WebSocket pour chaque jeu et le chat (messages `chat_game`, `chat_private`)
7. Le seeding automatique des badges (`ncs_badges`) au premier demarrage

## Middlewares

### `auth.js`
- **`authMiddleware`** : Verifie le token JWT dans le header `Authorization`
- **`adminMiddleware`** : Verifie que `req.user.role === 'admin'`
- **`verifiedMiddleware`** : Verifie que `req.user.status === 'verified'`

### `errorHandler.js`
Gestion centralisee des erreurs avec reponse JSON structuree.

### `upload.js`
Configuration Multer pour l'upload de fichiers (images de jeux, evenements).

### Rate limiting WebSocket
Le serveur WebSocket applique un rate limit de **20 messages par seconde** par client. Les messages excedentaires sont ignores silencieusement.

### Nettoyage des connexions WebSocket
Un intervalle de 30 secondes nettoie les connexions mortes (clients qui ne repondent plus au ping).

### Protection IDOR
Les controleurs `Profiles`, `Friendships` et `FriendRequests` verifient que l'utilisateur authentifie est bien le proprietaire de la ressource avant toute mutation (creation, modification, suppression).

## Controleurs

| Controleur | Ressource | Fonctionnalites |
|---|---|---|
| `Users.js` | Utilisateurs | Inscription, connexion, verification email, CRUD |
| `Games.js` | Sessions de jeu | Creation, mise a jour, suppression de parties |
| `GameModels.js` | Modeles de jeux | CRUD des templates de jeux avec game modes |
| `GamePlayers.js` | Joueurs en partie | Ajout/suppression de joueurs dans les parties |
| `PlayerScores.js` | Scores | Meilleurs scores par joueur par jeu |
| `Profiles.js` | Profils | Personnalisation du profil utilisateur |
| `Events.js` | Evenements | CRUD, spotlight, filtrage |
| `EventAttendees.js` | Participants | Inscription/desinscription aux evenements |
| `EventLikers.js` | Likes | Like/unlike des evenements |
| `Friendships.js` | Amities | Relations bilaterales |
| `FriendRequests.js` | Demandes d'amis | Envoi, acceptation, refus |
| `Messages.js` | Messages de chat | Historique des conversations privees et de partie |
| `Stats.js` | Statistiques | XP, niveaux, badges, jeu favori, enregistrement de resultats de partie |

**Conventions communes :**
- Tous les controleurs utilisent `findByPk` pour les lookups de ressource unique, avec retour 404 si non trouve
- Tous les chemins de reponse incluent un `return` explicite pour eviter les doubles reponses
- Les mutations sur Profile, Friendship et FriendRequest verifient la propriete de la ressource (protection IDOR)

## Routes

### Niveaux de protection

| Niveau | Middleware | Description |
|---|---|---|
| Public | Aucun | Accessible sans authentification |
| Authentifie | `authMiddleware` | Token JWT valide requis |
| Admin | `authMiddleware` + `adminMiddleware` | Role admin requis |

### Endpoints principaux

| Methode | Route | Protection | Description |
|---|---|---|---|
| POST | `/users` | Public | Inscription |
| POST | `/users/login` | Public | Connexion |
| PUT | `/users/verify-mail/:token` | Public | Verification email |
| GET | `/users` | Admin | Liste des utilisateurs |
| GET | `/games/public` | Public | Parties publiques |
| POST | `/games` | Authentifie | Creer une partie |
| GET | `/gamemodels` | Public | Liste des modeles de jeux |
| POST | `/gamemodels` | Admin | Creer un modele de jeu |
| GET | `/events` | Public | Liste des evenements |
| POST | `/events` | Admin | Creer un evenement |
| GET | `/profiles/:userId` | Authentifie | Profil d'un joueur |
| POST | `/friendrequests` | Authentifie | Envoyer une demande d'ami |
| GET | `/stats/:userId` | Public | Statistiques d'un joueur |
| POST | `/stats/record` | Authentifie | Enregistrer un resultat de partie |
| POST | `/users/batch` | Authentifie | Recuperer plusieurs utilisateurs par IDs |

> Pour la reference complete, voir [api/routes.md](../api/routes.md)

## Moteurs de jeu

Les moteurs de jeu sont dans `server/games/` :

### `games.js`
Fonctions d'initialisation qui retournent l'etat initial de chaque jeu :
- `getTicTacToeGameInfo()` : grille 3x3, scores
- `getBoardGameInfo()` : 20 balles, couleurs
- `getMascaradeGameInfo()` : scenarios, masques, pieces, phases

### `mascarade/`
Le jeu Mascarade a son propre sous-dossier :
- `MascaradeGame.js` : Moteur principal (gestion d'etat, tours, actions)
- `mascaradeScenarios.js` : Configurations par nombre de joueurs (4-8, variantes A/B)
- `mascaradeMasks.js` : Pouvoirs des 16 masques, fonctions de transfert

> Pour plus de details, voir [games/mascarade/implementation.md](../games/mascarade/implementation.md)
