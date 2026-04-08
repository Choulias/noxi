# Protocole WebSocket

## Connexion

Le serveur WebSocket ecoute sur le **port 9090**.

```
URL : ws://localhost:9090
```

A la connexion, le serveur attribue un `clientId` unique et le renvoie au client.

## Format des messages

Tous les messages sont en JSON :

```json
{
  "type": "action_type",
  "data": { ... }
}
```

## Messages Client → Serveur

### `connect`
Premiere connexion au serveur.

### `create`
Creer une nouvelle partie.
```json
{
  "type": "create",
  "gameModel": "mascarade",
  "gameId": "uuid-de-la-partie",
  "maxPlayers": 4,
  "clientName": "NomDuJoueur",
  "gameMode": "4a"
}
```

### `join`
Rejoindre une partie existante.
```json
{
  "type": "join",
  "gameId": "uuid-de-la-partie",
  "clientName": "NomDuJoueur"
}
```

### `play`
Envoyer une action de jeu.
```json
{
  "type": "play",
  "gameId": "uuid-de-la-partie",
  "action": {
    "type": "action_specifique",
    ...
  }
}
```

### `quit`
Quitter une partie.
```json
{
  "type": "quit",
  "gameId": "uuid-de-la-partie"
}
```

### `reset`
Reinitialiser le plateau (Tic-Tac-Toe, Board).

### `chat_game`
Envoyer un message dans le chat de la partie en cours.
```json
{
  "type": "chat_game",
  "gameId": "uuid-de-la-partie",
  "content": "Texte du message",
  "senderId": 1,
  "senderName": "NomDuJoueur"
}
```

### `chat_private`
Envoyer un message prive a un autre utilisateur.
```json
{
  "type": "chat_private",
  "receiverId": 2,
  "content": "Texte du message",
  "senderId": 1,
  "senderName": "NomDuJoueur"
}
```

## Messages Serveur → Client

### `update` (broadcast)
Envoye a tous les joueurs d'une partie apres chaque changement d'etat.
```json
{
  "type": "update",
  "game": { ... }
}
```

### `private_message` (unicast)
Envoye uniquement au joueur concerne.
```json
{
  "type": "private_message",
  "action": "look_result",
  "data": {
    "mask": "voleur"
  }
}
```

### `connected`
Confirmation de connexion avec le `clientId`.

### `error`
Message d'erreur.

### `chat_game` (broadcast partie)
Relaye un message de chat a tous les joueurs de la partie.
```json
{
  "type": "chat_game",
  "gameId": "uuid-de-la-partie",
  "content": "Texte du message",
  "senderId": 1,
  "senderName": "NomDuJoueur",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

### `chat_private` (unicast)
Relaye un message prive au destinataire.
```json
{
  "type": "chat_private",
  "content": "Texte du message",
  "senderId": 1,
  "senderName": "NomDuJoueur",
  "timestamp": "2026-03-31T12:00:00.000Z"
}
```

## Flux de communication

### Creation et demarrage d'une partie

```
Joueur 1                 Serveur                 Joueur 2
    │                       │                       │
    ├── create ───────────► │                       │
    │ ◄── update ────────── │                       │
    │                       │                       │
    │                       │ ◄── join ─────────── │
    │ ◄── update ────────── │ ── update ──────────► │
    │                       │                       │
```

### Action de jeu

```
Joueur actif             Serveur              Tous les joueurs
    │                       │                       │
    ├── play(action) ─────► │                       │
    │                       ├── traitement          │
    │                       ├── update state         │
    │ ◄── update ────────── │ ── update ──────────► │
    │                       │                       │
```

### Message prive (Mascarade : regarder son masque)

```
Joueur actif             Serveur              Autres joueurs
    │                       │                       │
    ├── play(look) ───────► │                       │
    │                       ├── traitement          │
    │ ◄── private_message ─ │                       │
    │ ◄── update ────────── │ ── update ──────────► │
    │                       │                       │
```

## Gestion des deconnexions

- Quand un joueur se deconnecte, le serveur le retire de la partie
- Si la partie est vide, elle est nettoyee automatiquement
- Les joueurs restants recoivent un `update` avec l'etat mis a jour

## Securite et robustesse

### Rate limiting
Chaque client est limite a **20 messages par seconde**. Les messages excedentaires sont ignores silencieusement. Le compteur est reinitialise chaque seconde.

### Nettoyage des connexions mortes
Un intervalle de **30 secondes** envoie un ping a chaque client. Les clients qui n'ont pas repondu au ping precedent (`isAlive === false`) sont termines. Cela libere les ressources et evite les broadcasts vers des connexions fantomes.

### Verification d'etat avant broadcast
Avant d'envoyer un message, le serveur verifie que la connexion est dans l'etat `OPEN`. Les connexions fermees ou en cours de fermeture sont ignorees.

### Parsing JSON securise
Les messages entrants sont parses dans un bloc `try-catch`. Les messages malformes (JSON invalide) sont ignores sans crash du serveur.

### Protection contre les conditions de course
L'action `join` verifie que la partie n'est pas deja pleine au moment de l'ajout, evitant qu'un depassement du nombre maximum de joueurs ne survienne en cas de connexions simultanees.

## Stockage de l'etat

L'etat des jeux est stocke **en memoire** sur le serveur (pas en base de donnees).
Seuls les enregistrements de parties (`ncs_games`) et les scores (`ncs_playerscores`) sont persistes en BDD.
