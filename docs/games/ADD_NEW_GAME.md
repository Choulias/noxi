# Guide : Ajouter un nouveau jeu sur Noxi

Ce document explique etape par etape comment ajouter un nouveau jeu a la plateforme Noxi. Il sert de reference et permet de demarrer un nouveau chat sans perdre de contexte.

---

## Vue d'ensemble de l'architecture existante

Noxi a deja 3 jeux : **TicTacToe**, **Board**, **Mascarade**. Chacun suit un pattern similaire :

1. **Un modele en BDD** (`ncs_gamemodels`) avec un `slug` unique
2. **Un composant React frontend** dans `src/components/Games/`
3. **Un moteur serveur** (optionnel, selon la complexite) dans `server/games/`
4. **Un handler WebSocket** dans `server/index.js` qui gere les actions du jeu
5. **Une entree dans les helpers** `server/games/games.js` pour initialiser l'etat
6. **Des assets** dans `src/assets/img/` et eventuellement `server/uploads/games/`

Le frontend et le serveur communiquent via **WebSocket** (port 9090) pour le temps reel et via l'**API REST** (port 5000) pour la persistance des scores/parties.

---

## Etape 1 : Definir le jeu

Avant de coder, clarifier :

- **Nom du jeu** et **slug** (ex: `chess`, `poker`, `uno`)
- **Nombre de joueurs** (min/max)
- **Regles principales** : tour par tour ? temps reel ? cartes ? plateau ?
- **Etat d'une partie** : quelles donnees faut-il stocker ?
- **Actions possibles** : quels messages WebSocket le client envoie ?
- **Conditions de victoire** : comment determiner un gagnant ?
- **Variantes/modes** : y a-t-il differents modes de jeu ?

---

## Etape 2 : Ajouter le jeu en BDD

### Inserer le modele dans `ncs_gamemodels`

```sql
INSERT INTO ncs_gamemodels (name, slug, description, image, playersMin, playersLimit)
VALUES (
    'Nom du jeu',
    'slug-du-jeu',
    'Description courte du jeu',
    NULL,
    2,    -- playersMin
    4     -- playersLimit
);
```

### Ajouter des modes/variantes (optionnel)

Si le jeu a plusieurs modes, les ajouter dans `ncs_gamemode` :

```sql
INSERT INTO ncs_gamemode (gameSlug, value, label, description)
VALUES
    ('slug-du-jeu', 'classique', 'Classique', 'Regles standards'),
    ('slug-du-jeu', 'rapide', 'Rapide', 'Partie accelere');
```

### Ajouter des badges lies au jeu (optionnel)

Editer `server/controllers/Stats.js`, fonction `seedBadges()`, ajouter des entrees :

```js
{ slug: 'mon_jeu_5wins', name: 'Nom du badge', description: '...', icon: '🎲', condition_type: 'game_wins', condition_value: 5, condition_game: 'slug-du-jeu' }
```

---

## Etape 3 : Creer le moteur serveur

### Structure type (pour un jeu simple)

Pour un jeu simple (comme TicTacToe), l'etat peut etre gere directement dans `server/index.js` via le handler WebSocket. Pas besoin de classe separee.

### Structure type (pour un jeu complexe, comme Mascarade)

Creer un dossier `server/games/nom-du-jeu/` avec :

**`NomDuJeuGame.js`** : classe qui encapsule la logique
```js
export class NomDuJeuGame {
    constructor(playersLimit, options) {
        this.state = {
            phase: "WAITING",
            players: [],
            // ... etat specifique au jeu
        };
    }

    addPlayer(clientId, clientName) { ... }
    removePlayer(clientId) { ... }
    startGame() { ... }
    handleAction(clientId, action) {
        // Retourne { privateMessages: [...] } pour les messages prives
    }
    getPublicState() { ... }
    getPrivateState(clientId) { ... }
}
```

### Helper d'initialisation

Dans `server/games/games.js`, ajouter :

```js
export function getNomDuJeuGameInfo(gameId, playersLimit, engine) {
    return {
        id: gameId,
        model: "slug-du-jeu",
        clients: [],
        playersLimit: parseInt(playersLimit),
        engine: engine,  // Instance de NomDuJeuGame
        state: engine.getPublicState()
    };
}
```

---

## Etape 4 : Ajouter les handlers WebSocket

Dans `server/index.js`, dans le block `connection.on("message", ...)`, ajouter :

### Pour la creation de partie (dans le handler `create`)
```js
} else if (result.gameModel === "slug-du-jeu") {
    const limit = parseInt(result.playersLimit);
    const engine = new NomDuJeuGame(limit);
    games[gameId] = getNomDuJeuGameInfo(gameId, limit, engine);
}
```

### Pour le join (dans le handler `join`)
```js
} else if (game.model === "slug-du-jeu") {
    const color = {"0":"#FEBEFD", "1":"#95FDFC"}[game.clients.length];
    game.clients.push({ clientId, clientName, color });
    game.engine.addPlayer(clientId, clientName);

    if (game.clients.length === game.playersLimit) {
        game.engine.startGame();
        broadcastNomDuJeuState(gameId);
        return;
    }
}
```

### Handler d'action specifique
```js
if (result.method === "nomdujeu_action") {
    const gameId = result.gameId;
    const game = games[gameId];
    if (!game || game.model !== "slug-du-jeu") return;

    try {
        const actionResult = game.engine.handleAction(result.clientId, result.action);

        if (actionResult.privateMessages) {
            actionResult.privateMessages.forEach(pm => {
                sendPrivateMessage(pm.clientId, pm.data);
            });
        }

        broadcastNomDuJeuState(gameId);
    } catch (e) {
        console.error("NomDuJeu action error:", e);
    }
}
```

### Fonction de broadcast

```js
function broadcastNomDuJeuState(gameId) {
    const game = games[gameId];
    if (!game || game.model !== "slug-du-jeu") return;

    game.clients.forEach(c => {
        if (clients[c.clientId] && clients[c.clientId].connection.connected) {
            const payLoad = {
                method: "update",
                game: {
                    id: game.id,
                    model: game.model,
                    clients: game.clients,
                    playersLimit: game.playersLimit,
                    state: game.engine.getPublicState(),
                    privateState: game.engine.getPrivateState(c.clientId)
                }
            };
            clients[c.clientId].connection.send(JSON.stringify(payLoad));
        }
    });
}
```

---

## Etape 5 : Creer le composant frontend

### Structure type

Creer `src/components/Games/NomDuJeu.jsx` (ou `src/components/Games/NomDuJeu/` si plusieurs fichiers).

Pattern **Mascarade** : useRef pour le WebSocket, useState pour le state reactif.

```jsx
import { useState, useEffect, useRef, Fragment } from "react";
import { useUser } from "../Auth/useUser.jsx";
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../api";
import { useChat } from "../Chat/ChatContext";
import { useToast } from "../UI/Toast";

export default function NomDuJeu() {
  const user = useUser();
  const { joinGame: chatJoinGame, leaveGame: chatLeaveGame, addGameMessage } = useChat();
  const { addToast } = useToast();
  const { id, reach, numberplayers } = useParams();
  const navigate = useNavigate();

  // Refs
  const wsRef = useRef(null);
  const clientIdRef = useRef(null);
  const playerIdRef = useRef(user ? user.id : null);
  const gameIdRef = useRef(id || null);

  // State
  const [gameState, setGameState] = useState(null);
  const [gamePhase, setGamePhase] = useState("WAITING");
  const [gameClients, setGameClients] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:9090");
    wsRef.current = ws;

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      switch (data.method) {
        case "connect":
          clientIdRef.current = data.clientId;
          if (!gameIdRef.current) {
            createGame();
          } else {
            joinGame(data.clientId, user?.username || "Invite");
          }
          break;
        case "create":
          gameIdRef.current = data.game.id;
          saveGame(data.game.id);
          joinGame(clientIdRef.current, user?.username);
          break;
        case "join":
        case "update":
          handleUpdate(data.game);
          break;
        case "chat_game":
          addGameMessage(data.message);
          break;
      }
    };

    return () => {
      chatLeaveGame();
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, []);

  // ... handlers, send functions, render
}
```

### Integration chat

Pour avoir le chat de partie automatique dans le drawer :
```jsx
const handleJoin = (game) => {
    setGameClients(game.clients);
    chatJoinGame(gameIdRef.current, wsRef, clientIdRef.current);
    // ...
};
```

### Styles SCSS

Creer `src/scss/components/games/_nom-du-jeu.scss` et l'importer dans `src/scss/input.scss` :
```scss
@import 'components/games/nom-du-jeu';
```

---

## Etape 6 : Ajouter la route

Dans `src/components/AnimatedRoutes.jsx`, ajouter avec lazy loading :

```jsx
const NomDuJeu = lazy(() => import('./Games/NomDuJeu'));
```

Et les routes :
```jsx
<Route path="/slug-du-jeu" element={<PageTransition><NomDuJeu/></PageTransition>} />
<Route path="/slug-du-jeu/:id" element={<PageTransition><NomDuJeu/></PageTransition>} />
<Route path="/slug-du-jeu/:reach/:numberplayers" element={<PageTransition><NomDuJeu/></PageTransition>} />
```

---

## Etape 7 : Ajouter l'icone/placeholder sur la page Games

Dans `src/components/Games/Games.jsx`, la logique gere deja n'importe quel jeu de la BDD. Si tu veux un rendu custom (SVG, animation) pour la carte :

```jsx
) : item.slug === 'slug-du-jeu' ? (
    <NomDuJeuSvg />  // Custom SVG component
) : (
    <div className="game-illustration-placeholder">
        <span>🎮</span>
    </div>
)
```

---

## Etape 8 : Enregistrer les resultats de partie

A la fin d'une partie, pour attribuer l'XP et les badges, appeler depuis le frontend :

```js
await api.post('/stats/record', {
    gameSlug: 'slug-du-jeu',
    result: 'win',  // 'win' | 'loss' | 'draw'
});
```

Le serveur s'occupe de :
- Ajouter l'XP au profil
- Recalculer le niveau
- Attribuer les badges debloqués

---

## Etape 9 : Mettre a jour la documentation

Creer `docs/games/slug-du-jeu/` avec :
- **`README.md`** : presentation du jeu
- **`regles.md`** : regles detaillees
- **`implementation.md`** : details techniques

Ajouter le lien dans `docs/README.md`.

---

## Checklist recap

- [ ] Jeu defini (nom, slug, joueurs, regles)
- [ ] Ligne ajoutee dans `ncs_gamemodels`
- [ ] Variantes dans `ncs_gamemode` (si applicable)
- [ ] Badges lies au jeu dans `seedBadges()`
- [ ] Moteur serveur (classe ou handler direct)
- [ ] Helper d'initialisation dans `server/games/games.js`
- [ ] Handlers `create` + `join` + action dans `server/index.js`
- [ ] Fonction de broadcast si gameplay complexe
- [ ] Composant React dans `src/components/Games/`
- [ ] Styles SCSS + import dans `input.scss`
- [ ] Route avec lazy loading dans `AnimatedRoutes.jsx`
- [ ] Icone/SVG custom dans `Games.jsx` (optionnel)
- [ ] Appel `/stats/record` en fin de partie
- [ ] Documentation dans `docs/games/slug-du-jeu/`
- [ ] Image du jeu uploadee via admin (`/admin`)

---

## Fichiers cles a lire avant de commencer

Pour comprendre les patterns existants :

1. **Jeu simple** : lire `src/components/Games/TicTacToe.jsx` et le handler dans `server/index.js`
2. **Jeu complexe** : lire `src/components/Games/Mascarade/Mascarade.jsx` et `server/games/mascarade/MascaradeGame.js`
3. **Integration chat** : voir l'usage de `useChat` dans Mascarade ou TicTacToe
4. **Integration stats** : voir `server/controllers/Stats.js` pour l'XP/badges

## Variables d'environnement disponibles

| Variable | Valeur exemple | Utilisation |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` ou `https://noxi.rhandr.me/api` | URL de l'API REST |
| `VITE_WS_URL` | `ws://localhost:9090` ou `wss://noxi.rhandr.me/ws` | URL du WebSocket |

---

*Voir aussi : [docs/architecture/backend.md](../architecture/backend.md), [docs/architecture/frontend.md](../architecture/frontend.md), [docs/websocket/protocol.md](../websocket/protocol.md)*
