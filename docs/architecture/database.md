# Schema de base de donnees

## Vue d'ensemble

L'application utilise **MySQL** via l'ORM **Sequelize**. Le schema comprend 14 tables principales.

## Diagramme des relations

```
ncs_users ─────────┬──────────────── ncs_profiles (1:1)
    │              │
    │              ├──────────────── ncs_games (1:N via ownerId)
    │              │
    │              ├──────────────── ncs_gameplayers (N:M via gameId)
    │              │
    │              ├──────────────── ncs_playerscores (1:N)
    │              │
    │              ├──────────────── ncs_friendships (N:M via uid_1/uid_2)
    │              │
    │              ├──────────────── ncs_friendrequests (N:M via inviterId/invitedId)
    │              │
    │              ├──────────────── ncs_eventattendees (N:M)
    │              │
    │              ├──────────────── ncs_eventlikers (N:M)
    │              │
    │              ├──────────────── ncs_messages (1:N via senderId)
    │              │
    │              └──────────────── ncs_user_badges (N:M via userId/badgeId)
    │
ncs_badges ────────────────────────── ncs_user_badges (1:N via badgeId)
    │
ncs_gamemodels ────┬──────────────── ncs_games (1:N via gameModel/slug)
    │              │
    │              └──────────────── ncs_gamemode (1:N via gameSlug)
    │
ncs_events ────────┬──────────────── ncs_eventattendees (1:N)
                   └──────────────── ncs_eventlikers (1:N)
```

## Tables

### `ncs_users`
Comptes utilisateurs.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| username | STRING | Nom d'utilisateur unique (UNIQUE constraint) |
| password | STRING | Mot de passe hache (bcryptjs) |
| mail | STRING | Email unique (UNIQUE constraint) |
| role | STRING | `"user"` ou `"admin"` |
| status | STRING | `"pending"` ou `"verified"` |
| verificationString | STRING | UUID pour verification email |

### `ncs_profiles`
Donnees de profil utilisateur.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| userId | INT (FK) | Reference vers ncs_users |
| nickname | STRING | Pseudonyme affiche |
| age | INT | Age |
| bio | TEXT | Biographie |
| picture | STRING | URL de l'avatar (RoboHash) |
| xp | INT | Points d'experience accumules (defaut: 0) |
| level | INT | Niveau du joueur (calcule a partir de l'XP, defaut: 1) |
| favoriteGame | STRING (nullable) | Slug du jeu favori affiche sur le profil |

### `ncs_gamemodels`
Templates de jeux disponibles.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| name | STRING | Nom du jeu |
| slug | STRING | Identifiant URL (`tictactoe`, `board`, `mascarade`) |
| description | TEXT | Description du jeu |
| image | STRING | Image de couverture |
| playersMin | INT | Nombre minimum de joueurs |
| playersLimit | INT | Nombre maximum de joueurs |

### `ncs_games`
Sessions de jeu actives.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| gameId | STRING (UUID) | Identifiant unique de la partie |
| ownerId | INT (FK) | Createur de la partie |
| numberPlayers | INT | Joueurs actuels |
| maxPlayers | INT | Joueurs maximum |
| status | STRING | Statut de la partie |
| gameModel | STRING | Slug du modele de jeu |
| reach | STRING | `"public"` ou `"private"` |
| gameMode | STRING | Variante de jeu |

### `ncs_gameplayers`
Joueurs dans une session de jeu.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| gameId | STRING | UUID de la partie |
| playerId | INT (FK) | Reference vers ncs_users |
| clientId | STRING | ID WebSocket |
| clientName | STRING | Nom affiche |
| score | INT | Score en cours |

### `ncs_playerscores`
Meilleurs scores par joueur par jeu.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| gameSlug | STRING | Slug du jeu |
| playerId | INT (FK) | Reference vers ncs_users |
| clientName | STRING | Nom affiche |
| bestScore | INT | Meilleur score enregistre |

### `ncs_events`
Evenements communautaires.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| title | STRING | Titre |
| theme | STRING | Type de jeu associe |
| description | TEXT | Description |
| image | STRING | Image de l'evenement |
| attendees | INT | Nombre de participants |
| likes | INT | Nombre de likes |
| spotlight | BOOLEAN | Evenement a la une |

### `ncs_eventattendees`
Participation aux evenements.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| eventId | INT (FK) | Reference vers ncs_events |
| userId | INT (FK) | Reference vers ncs_users |

### `ncs_eventlikers`
Likes sur les evenements.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| eventId | INT (FK) | Reference vers ncs_events |
| userId | INT (FK) | Reference vers ncs_users |

### `ncs_friendships`
Relations d'amitie bilaterales.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| uid_1 | INT (FK) | Premier utilisateur |
| uid_2 | INT (FK) | Second utilisateur |

### `ncs_friendrequests`
Demandes d'amis en attente.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| inviterId | INT (FK) | Emetteur de la demande |
| invitedId | INT (FK) | Destinataire |

### `ncs_messages`
Messages de chat (conversations privees et chat de partie).

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| senderId | INT (FK) | Reference vers ncs_users (auteur) |
| receiverId | INT (FK, nullable) | Reference vers ncs_users (destinataire, conversations privees) |
| gameId | STRING (nullable) | UUID de la partie (chat de partie) |
| content | TEXT | Contenu du message |
| type | STRING | `"private"` ou `"game"` |
| createdAt | DATETIME | Date d'envoi |

### `ncs_gamemode`
Variantes de jeu disponibles.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| gameSlug | STRING | Slug du jeu parent |
| value | STRING | Identifiant de la variante |
| label | STRING | Nom affiche |
| description | TEXT | Description de la variante |

### `ncs_badges`
Badges deblocables par les joueurs.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| slug | STRING | Identifiant unique du badge |
| name | STRING | Nom affiche |
| description | TEXT | Description de la condition d'obtention |
| icon | STRING | Icone ou emoji du badge |
| condition_type | STRING | Type de condition (`games_played`, `wins`, `xp`, etc.) |
| condition_value | INT | Valeur seuil pour debloquer le badge |
| condition_game | STRING (nullable) | Slug du jeu concerne (null = tous les jeux) |

### `ncs_user_badges`
Association entre utilisateurs et badges obtenus.

| Colonne | Type | Description |
|---|---|---|
| id | INT (PK, auto) | Identifiant |
| userId | INT (FK) | Reference vers ncs_users |
| badgeId | INT (FK) | Reference vers ncs_badges |

## Index

| Table | Colonne(s) | Raison |
|---|---|---|
| `ncs_gameplayers` | `gameId` | Lookup rapide des joueurs par partie |
| `ncs_profiles` | `userId` | Lookup rapide du profil par utilisateur |
| `ncs_events` | `theme` | Filtrage des evenements par theme |
| `ncs_playerscores` | `gameSlug` + `playerId` | Classement par jeu et par joueur |
| `ncs_messages` | `senderId` + `receiverId` | Lookup rapide des conversations privees |
| `ncs_messages` | `gameId` | Lookup rapide des messages de partie |

## Donnees initiales

Le fichier `noxi_database.sql` contient :
- 3 utilisateurs de test (admin, Utilisateur, Player)
- 2 modeles de jeux (Tic-Tac-Toe, Board)
- 5 evenements d'exemple
- Profils associes
