# Mascarade -- Implementation technique

## Architecture

Le jeu Mascarade est reparti en 3 couches :

```
┌─────────────────────────────────┐
│          Frontend React          │
│  Mascarade.jsx (conteneur)       │
│  + sous-composants               │
└─────────────┬───────────────────┘
              │ WebSocket
┌─────────────▼───────────────────┐
│     WebSocket Handler            │
│     server/index.js              │
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│     Moteur de jeu                │
│     MascaradeGame.js             │
│     mascaradeMasks.js            │
│     mascaradeScenarios.js        │
└─────────────────────────────────┘
```

---

## Serveur -- Moteur de jeu

### `MascaradeGame.js`

Classe principale qui gere l'etat complet d'une partie :

**Proprietes :**
- `players[]` : Liste des joueurs avec leurs pieces, masques et cartes
- `phase` : Phase actuelle (`WAITING`, `MEMORIZATION`, `PREPARATION`, `PLAYING`, `GAME_OVER`)
- `currentTurn` : Index du joueur actif
- `justiceCoins` : Pieces sur le plateau Justice
- `centerCards[]` : Cartes au centre (4-5 joueurs)
- `lastAction` : Derniere action effectuee (type, joueur, timestamp)
- `preparationTurns` : Compteur de tours preparatoires (4 max)

**Methodes principales :**
- `handleAction(playerIndex, action)` : Point d'entree pour toutes les actions
- `_handleLook(playerIndex)` : Regarder son masque (envoie un message prive)
- `_handleSwap(playerIndex, targetIndex, didSwap)` : Echanger 2 cartes
- `_handleAnnounce(playerIndex, announcedMask)` : Annoncer un masque
- `_handleContest(playerIndex, contests)` : Gerer les contestations
- `_resolvePower(mask, playerIndex)` : Appliquer le pouvoir d'un masque
- `advanceTurn()` : Passer au tour suivant
- `checkVictory()` : Verifier si un joueur a gagne (13 pieces) ou perdu (0 piece)

### `mascaradeScenarios.js`

Definit les compositions de masques pour chaque nombre de joueurs :

```javascript
// Exemple pour 4 joueurs, variante A
"4a": {
  players: ["roi", "escroc", "juge", "voleur"],
  center: ["sorciere", "espionne"]
}
```

### `mascaradeMasks.js`

Definit les pouvoirs de chaque masque sous forme de fonctions :

```javascript
MASK_POWERS = {
  roi: (game, playerIndex) => { transferFromBank(game, playerIndex, 2); },
  voleur: (game, playerIndex) => { /* vole 1 piece aux voisins */ },
  // ...
}
```

Fonctions utilitaires :
- `transferFromBank(game, playerIndex, amount)` : Pieces depuis la banque
- `transferBetweenPlayers(game, from, to, amount)` : Pieces entre joueurs
- `transferToJustice(game, playerIndex, amount)` : Amende sur le plateau
- `transferFromJustice(game, playerIndex)` : Juge recupere les pieces

---

## Frontend -- Composants React

### `Mascarade.jsx` (conteneur principal)

Responsabilites :
- Connexion WebSocket et gestion des messages
- Etat du jeu (`game`, `player`, `phase`)
- Envoi d'actions au serveur via `sendAction()`
- Gestion des messages prives (`look_result`, `contestation_reveal`)
- Sauvegarde/restauration du scroll position
- Integration du chat de partie via le hook `useChat` (messages `chat_game` transitent par WebSocket)

**Hooks importants :**
- `useRef(wsRef)` : Reference WebSocket persistante
- `useState(game)` : Etat complet de la partie
- `useEffect` : Gestion des evenements WebSocket

### `MascaradeBoard.jsx`

Affiche le plateau de jeu :
- Cercle de cartes joueurs (position calculee)
- Plateau Justice au centre (pieces d'amende)
- Cartes du centre (4-5 joueurs)
- Informations du joueur actif
- Ecran de victoire/defaite

### `MascaradeActions.jsx`

Panel d'actions dans la colonne de gauche :
- **Regarder** : Bouton simple
- **Echanger** : Selection d'un joueur cible (picker)
- **Annoncer** : Selection d'un masque (MaskPicker en popup)
- Affichage du joueur actuel et de la phase

### `MascaradeContestation.jsx`

Interface de contestation apres une annonce :
- Liste des joueurs avec option de contester
- Timer d'attente pour les contestations
- Affichage des resultats (cartes revelees, amendes)

### `MascaradeLog.jsx`

Journal d'evenements :
- Historique des actions (echange, annonce, contestation)
- Resultats des pouvoirs actives
- Messages systeme (phase, tour)

### `MascaradePlayerCard.jsx`

Carte individuelle d'un joueur sur le plateau :
- Avatar du joueur
- Nombre de pieces
- Carte masque (face visible ou cachee)
- Halo dore si c'est le tour du joueur
- Attribut `data-player-index` pour les animations

### `MascaradeAnimations.jsx`

Systeme d'animations central :
- **Deal** : Distribution des cartes une par une au debut
- **Swap** : Animation take-then-send pour les echanges
- Utilise `useRef` (pas useState) pour eviter les resets React
- Overlay en position absolute avec inline styles
- Manipulation DOM directe pour masquer les cartes pendant les animations

### `Card3DModal.jsx`

Modal 3D interactive pour reveler les masques :
- Rotation drag-to-rotate avec perspective 1000px
- Effet de brillance (shine) avec position CSS dynamique
- Image chibi du personnage
- Nom et description du masque
- Bouton "Compris !" pour confirmer la lecture

### `mascaradeConstants.js`

Constantes partagees :
- `MASKS` : 16 masques avec nom, icone, description
- `MASK_IMAGES` : Chemins vers les images de cartes
- `MASK_CHIBIS` : Chemins vers les illustrations chibi
- `MASK_DESCRIPTIONS` : Descriptions courtes des pouvoirs

---

## Animations

### Distribution des cartes (Deal)
- Declenchee lors du passage `WAITING → MEMORIZATION`
- Les cartes sont envoyees une par une vers chaque joueur
- Duree : 800ms par carte, delai sequentiel
- Les cartes existantes sont masquees via DOM (`opacity: 0`) pendant l'animation

### Echange de cartes (Swap)
- Declenchee lors d'une action d'echange
- Phase 1 : La carte cible est "prise" (vole vers le joueur actif, 700ms)
- Pause : 800ms
- Phase 2 : Une carte est "renvoyee" vers la position cible (700ms)
- La carte cible est masquee pendant l'animation

### Annonce de masque
- Affichage bref de l'image du masque annonce au-dessus de la carte du joueur
- Avec image chibi du personnage

### Effets visuels du plateau
- Particules dorees flottantes
- Etoiles scintillantes
- Shimmer sur les cartes retournees
- Balancement leger des cartes
- Halo dore pulse sur le joueur actif
