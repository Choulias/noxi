# Reference des endpoints API

Base URL : `http://localhost:5000`

## Authentification

Toutes les routes protegees necessitent le header :
```
Authorization: Bearer <token_jwt>
```

Les niveaux de protection :
- **Public** : Aucun header requis
- **Auth** : Token JWT valide
- **Admin** : Token JWT + role `admin`

---

## Utilisateurs (`/users`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| POST | `/users` | Public | Inscription (username, mail, password) |
| POST | `/users/login` | Public | Connexion (mail, password) → JWT |
| PUT | `/users/verify-mail/:verificationString` | Public | Verification email |
| GET | `/users/:id` | Auth | Obtenir un utilisateur par ID |
| GET | `/users/mail/:mail` | Auth | Chercher par email |
| GET | `/users/username/:username` | Auth | Chercher par username |
| GET | `/users` | Admin | Liste de tous les utilisateurs |
| DELETE | `/users/:id` | Admin | Supprimer un utilisateur |
| POST | `/users/batch` | Auth | Recuperer plusieurs utilisateurs par IDs (corps: `{ ids: [...] }`) |
| GET | `/users/search/:query` | Auth | Rechercher des utilisateurs par nom |
| GET | `/users/count` | Public | Nombre total d'utilisateurs |

## Sessions de jeu (`/games`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/games/count` | Public | Nombre total de parties jouees |
| GET | `/games/public` | Public | Parties publiques disponibles |
| GET | `/games` | Auth | Toutes les parties |
| GET | `/games/:id` | Auth | Partie par ID |
| GET | `/games/gameid/:gameid` | Auth | Partie par UUID |
| POST | `/games` | Auth | Creer une partie |
| PATCH | `/games/:id` | Auth | Mettre a jour une partie |
| DELETE | `/games/:id` | Auth | Supprimer une partie |
| DELETE | `/games/gameid/:gameId` | Auth | Supprimer par UUID |

## Modeles de jeux (`/gamemodels`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/gamemodels` | Public | Liste des modeles |
| GET | `/gamemodels/:id` | Public | Modele par ID |
| GET | `/gamemodels/slug/:slug` | Public | Modele par slug |
| POST | `/gamemodels` | Admin | Creer un modele |
| PATCH | `/gamemodels/:id` | Admin | Modifier un modele |
| DELETE | `/gamemodels/:id` | Admin | Supprimer un modele |

## Joueurs en partie (`/gameplayers`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/gameplayers` | Auth | Tous les joueurs en partie |
| GET | `/gameplayers/:id` | Auth | Joueur par ID |
| POST | `/gameplayers` | Auth | Ajouter un joueur a une partie |
| DELETE | `/gameplayers/:id` | Auth | Retirer un joueur |

## Scores (`/playerscores`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/playerscores` | Auth | Tous les scores |
| GET | `/playerscores/:id` | Auth | Score par ID |
| POST | `/playerscores` | Auth | Enregistrer un score |
| PATCH | `/playerscores/:id` | Auth | Mettre a jour un score |
| DELETE | `/playerscores/:id` | Auth | Supprimer un score |

## Profils (`/profiles`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/profiles/:userId` | Auth | Profil d'un utilisateur |
| POST | `/profiles` | Auth | Creer un profil |
| PATCH | `/profiles/:id` | Auth | Modifier un profil |
| DELETE | `/profiles/:id` | Auth | Supprimer un profil |

## Evenements (`/events`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/events` | Public | Tous les evenements |
| GET | `/events/:id` | Public | Evenement par ID |
| GET | `/events/spotlight` | Public | Evenements a la une |
| GET | `/events/notspotlight` | Public | Evenements hors spotlight |
| GET | `/events/notspotlight/:model` | Public | Filtrer par modele de jeu |
| POST | `/events` | Admin | Creer un evenement |
| PATCH | `/events/:id` | Admin | Modifier un evenement |
| PATCH | `/events/unspot/:value` | Admin | Gerer le spotlight |
| DELETE | `/events/:id` | Admin | Supprimer un evenement |

## Participants aux evenements (`/eventattendees`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/eventattendees` | Auth | Tous les participants |
| POST | `/eventattendees` | Auth | S'inscrire a un evenement |
| DELETE | `/eventattendees/:id` | Auth | Se desinscrire |

## Likes d'evenements (`/eventlikers`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/eventlikers` | Auth | Tous les likes |
| POST | `/eventlikers` | Auth | Liker un evenement |
| DELETE | `/eventlikers/:id` | Auth | Retirer un like |

## Amities (`/friendships`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/friendships/:uid` | Auth | Amis d'un utilisateur |
| POST | `/friendships` | Auth | Creer une amitie |
| DELETE | `/friendships/:id` | Auth | Supprimer une amitie |

## Messages (`/messages`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/messages/private/:userId` | Auth | Messages prives avec un utilisateur |
| GET | `/messages/game/:gameId` | Auth | Messages d'une partie |
| GET | `/messages/conversations` | Auth | Liste des conversations de l'utilisateur |
| POST | `/messages` | Auth | Envoyer un message (persiste en BDD) |
| DELETE | `/messages/:id` | Auth | Supprimer un message |

## Demandes d'amis (`/friendrequests`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/friendrequests` | Auth | Demandes recues |
| POST | `/friendrequests` | Auth | Envoyer une demande |
| DELETE | `/friendrequests/:id` | Auth | Annuler/refuser une demande |

## Statistiques (`/stats`)

| Methode | Endpoint | Protection | Description |
|---|---|---|---|
| GET | `/stats/:userId` | Public | Statistiques d'un joueur (XP, niveau, badges, parties jouees) |
| POST | `/stats/favorite` | Auth | Definir le jeu favori du joueur |
| POST | `/stats/record` | Auth | Enregistrer un resultat de partie, attribuer l'XP, verifier les badges |
