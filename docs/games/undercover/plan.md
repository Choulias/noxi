# Undercover — Plan de distribution des personnages

## Objectif de ce document

Ce plan couvre **uniquement la Phase 1** du jeu : la distribution des personnages.
Le but est de garantir qu'à chaque partie générée, la paire de personnages (A / B) soit
cohérente pour créer un bon Undercover — ni trop facile, ni trop confus.

Le reste (phases de jeu, indices, vote, scoring XP/badges, UI) est **hors scope** de
ce document et sera traité en Phase 2.

---

## 1. Règles de distribution

- À chaque partie, on tire **exactement 2 personnages** :
  - **A** : personnage de la **majorité** (les « civils »)
  - **B** : personnage des **imposteurs**
- **Tous les imposteurs ont le même personnage B** (pas de C, D…)
- Les deux personnages doivent être suffisamment **proches** pour que ce soit
  intéressant, mais assez **distincts** pour laisser des angles d'identification
- **Tirage 100% aléatoire** (pas d'anchor admin)
- **Bouton « relancer »** disponible avant le début de la partie : si un joueur
  ne connaît pas un des personnages tirés, l'hôte peut re-tirer une nouvelle
  paire avec la même difficulté. Nombre de relances illimité tant que la partie
  n'a pas démarré. Techniquement, ça appelle juste `generatePair()` à nouveau.

### Table des effectifs par nombre de joueurs

| Joueurs | Majorité A | Imposteurs B |
|---:|:---:|:---:|
| 3  | 2 | 1 |
| 4  | 3 | 1 |
| 5  | 4 | 1 |
| 6  | 4 | 2 |
| 7  | 5 | 2 |
| 8  | 6 | 2 |
| 9  | 6 | 3 |
| 10 | 7 | 3 |

> **À valider** : le ratio d'imposteurs est un choix de design (trop d'imposteurs →
> camp civil frustré ; trop peu → imposteurs isolés). Les valeurs ci-dessus sont un
> point de départ conservateur.

---

## 2. Structure de données d'un personnage

Chaque personnage = un vecteur de tags, répartis en 4 catégories. Les tags sont des
identifiants stables (`snake_case`), jamais du texte libre — pour permettre un calcul
de similarité déterministe.

```js
// server/games/undercover/characters.js
export const CHARACTERS = [
  {
    id: "naruto",
    name: "Naruto Uzumaki",
    anime: "Naruto",
    image: "/assets/img/undercover/naruto.png",
    visual: ["blond", "yeux_bleus", "cheveux_courts", "moustaches_renard", "tenue_orange", "bandeau_ninja"],
    personality: ["optimiste", "bruyant", "loyal", "impulsif", "tenace"],
    powers: ["chakra", "clones", "vent", "boule_energie", "puissance_bestiale"],
    themes: ["orphelin", "amitie", "ninja", "reve_de_leader", "bete_scellee"]
  },
  {
    id: "boruto",
    name: "Boruto Uzumaki",
    anime: "Boruto",
    image: "/assets/img/undercover/boruto.png",
    visual: ["blond", "yeux_bleus", "cheveux_courts", "moustaches_renard", "bandeau_ninja", "tenue_noire"],
    personality: ["rebelle", "loyal", "impulsif", "orgueilleux"],
    powers: ["chakra", "clones", "vent", "oeil_karma"],
    themes: ["heritage", "amitie", "ninja", "bete_scellee"]
  },
  // ...
];
```

### Règles de curation (à respecter en étendant la base)

- 4-6 tags par catégorie minimum (sinon la similarité devient instable)
- Tags normalisés : un seul `cheveux_blancs`, pas de `cheveux_blanc` / `blanc_cheveux`
- Les tags doivent décrire des **choses qu'un joueur pourrait dire en indice**
  (« cicatrice_front » ✓, « apparait_chapitre_45 » ✗)
- Maintenir un `tags.json` maître pour éviter les doublons lexicaux

### Base actuelle

**95 personnages** couvrant les animes les plus populaires all-time :
Naruto, One Piece, Dragon Ball Z, Bleach, Death Note, Attack on Titan,
Jujutsu Kaisen, My Hero Academia, Demon Slayer, Fullmetal Alchemist,
One Punch Man, Hunter x Hunter, Code Geass, Sword Art Online, Fairy Tail,
Mob Psycho 100, Chainsaw Man, JoJo, Berserk, Inuyasha, Rurouni Kenshin,
Dr. Stone, Evangelion, Black Clover, Tokyo Ghoul, D.Gray-man,
Bungo Stray Dogs, Spy x Family, Tokyo Revengers, Boruto.

Avec 95 persos → 4465 paires → 1208 easy / 275 medium / 48 hard / 8 hardcore.
Hardcore reste sparse : enrichir si on veut plus de variété en difficulté max.

---

## 3. Calcul de similarité

**Jaccard pondéré par catégorie**, score normalisé [0, 1].

```js
// server/games/undercover/similarity.js
const WEIGHTS = {
  visual: 0.40,       // Le look est l'indice le plus naturel
  personality: 0.20,
  powers: 0.20,
  themes: 0.20
};

function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  if (A.size === 0 && B.size === 0) return 0;
  const inter = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return inter / union;
}

export function similarity(a, b) {
  const cats = ["visual", "personality", "powers", "themes"];
  let score = 0;
  const breakdown = {};
  for (const cat of cats) {
    const s = jaccard(a[cat], b[cat]);
    breakdown[cat] = s;
    score += s * WEIGHTS[cat];
  }
  return { score, breakdown };
}
```

### Pré-calcul

Au démarrage serveur, calculer une fois la **matrice NxN** :

```js
// Exécuté au boot, stocké en mémoire
export const SIMILARITY_MATRIX = precomputeMatrix(CHARACTERS);
// Accès O(1) : SIMILARITY_MATRIX["naruto"]["boruto"] === 0.64
```

### Pondération retenue : 40/20/20/20

Le **visuel est pondéré plus fort (40%)** car c'est le vecteur d'indice le plus
naturel pour les joueurs (cheveux, yeux, tenue). Deux personnages qui se
ressemblent physiquement seront donc jugés plus proches — ce qui aligne
l'algorithme sur ce que les joueurs vont réellement exploiter en jeu.

À réévaluer après playtest : si les parties deviennent trop visuelles et
oublient le narratif, rebalancer vers `themes` / `personality`.

---

## 4. Algorithme de génération de la paire (A, B)

```js
// server/games/undercover/generator.js

const DIFFICULTY = {
  easy:     { min: 0.15, max: 0.25 },
  medium:   { min: 0.25, max: 0.35 },
  hard:     { min: 0.35, max: 0.45 },
  hardcore: { min: 0.45, max: 1.00 }
};

// Seuils de qualité minimale pour une paire "jouable"
const MIN_SHARED_TAGS = 4;   // L'imposteur doit pouvoir tenir >= 3 tours
const MIN_LEAK_TAGS_B = 2;   // On doit pouvoir coincer B sur au moins 2 angles

export function generatePair({ difficulty = "medium", anchor = null }) {
  const window = DIFFICULTY[difficulty];

  // 1. Choisir A (aléatoire ou forcé par anchor pour events admin)
  const A = anchor
    ? CHARACTERS.find(c => c.id === anchor)
    : pickRandom(CHARACTERS);

  // 2. Filtrer les candidats B dans la fenêtre de similarité
  const candidates = CHARACTERS.filter(c => {
    if (c.id === A.id) return false;
    const sim = SIMILARITY_MATRIX[A.id][c.id];
    return sim >= window.min && sim <= window.max;
  });

  // 3. Filtrer sur les critères de jouabilité
  const valid = candidates.filter(c => {
    const shared = countSharedTags(A, c);
    const leaks = countLeakTags(c, A); // tags de B absents de A
    return shared >= MIN_SHARED_TAGS && leaks >= MIN_LEAK_TAGS_B;
  });

  // 4. Fallback : relâcher la fenêtre d'un cran
  if (valid.length === 0) {
    return generatePair({ difficulty: downgrade(difficulty), anchor });
  }

  const B = pickRandom(valid);
  return {
    A, B,
    similarity: SIMILARITY_MATRIX[A.id][B.id],
    difficulty
  };
}

export function distribute({ A, B, playerCount }) {
  const { majority, impostors } = IMPOSTOR_TABLE[playerCount];
  const deck = [
    ...Array(majority).fill(A),
    ...Array(impostors).fill(B)
  ];
  return shuffle(deck);
}
```

### Ce que garantit l'algorithme

1. **Fenêtre de similarité respectée** → niveau de difficulté tenu
2. **Au moins 4 tags partagés** → B a de quoi faire des indices crédibles sur 3+ tours
3. **Au moins 2 tags différenciants de B** → les civils ont des angles pour démasquer
4. **Fallback automatique** → jamais de crash si la base est petite, on dégrade
5. **Anchor admin** → possibilité de forcer un personnage (events thématiques)

---

## 5. Niveaux de difficulté

Chaque niveau combine **deux contraintes** :
1. Fenêtre de score global `[min, max]`
2. Similarité minimale **par catégorie** `minPerCat` — force la paire à être
   similaire sur plusieurs axes à la fois (visual + personality + powers + themes),
   pas juste à avoir un bon score moyen tiré par une seule catégorie.

| Niveau | Score | min/cat | Paires éligibles | Ressenti |
|---|:---:|:---:|---:|---|
| **Facile**    | 0.15 – 0.25 | 0.00 | 1818 | Un truc cloche vite |
| **Moyen**     | 0.25 – 0.35 | 0.10 | 462  | Hésitation, discussion utile |
| **Difficile** | 0.35 – 0.45 | 0.15 | 122  | Quasi-jumeaux sur plusieurs axes |
| **Hardcore**  | 0.45 – 1.00 | 0.22 | 29   | Indiscernables sauf micro-détails |

> **Pourquoi la contrainte `minPerCat`** : sans elle, une paire peut atteindre
> un score global élevé grâce à UNE seule catégorie dominante (ex : L/Near ont
> powers=1.0 mais visual=0.10 → même tag "detective" suffit à gonfler le score).
> Avec la contrainte, on garantit que la paire est vraiment trompeuse sur
> plusieurs dimensions — visuel ET personnalité ET pouvoirs ET thèmes.

> **Calibrage empirique** : les fenêtres ont été ajustées après exécution du
> script de validation. Max observé ~0.66 (Boruto/Naruto), médian ~0.12.

---

## 6. Validation automatique de la base

Script à lancer après chaque ajout de personnages :
`npm run undercover:validate`

Il doit mesurer :

```
Pour chaque difficulté :
  Lancer 1000 générations de paires
  Compter :
    - paires trouvées au 1er essai (%)
    - paires trouvées après fallback (%)
    - échecs totaux (doit être 0)
  Moyenne de similarité réelle des paires générées
  Moyenne de tags partagés
  Moyenne de tags "leak" de B
```

### Cibles

| Difficulté | % succès sans fallback (cible) |
|---|:---:|
| easy     | > 95% |
| medium   | > 90% |
| hard     | > 75% |
| hardcore | > 50% |

Si hardcore < 50%, il faut soit enrichir la base, soit accepter un fallback plus fréquent.

---

## 7. Simulation d'une partie (facultatif Phase 1, utile Phase 2)

Pour vérifier qu'une paire est « vraiment » jouable, simuler des joueurs moyens.

```js
function simulatePair({ A, B, rounds = 3 }) {
  const sharedPool = sharedTags(A, B);
  const bLeaks = exclusiveTags(B, A);

  // L'imposteur optimal pioche d'abord dans les tags partagés
  // Un imposteur moyen a X% de chance de glisser un tag "leak"
  const survivability = sharedPool.length >= rounds;
  const trapExists = bLeaks.length >= 2;

  return {
    survivability,   // B peut-il tenir les 3 tours ?
    trapExists,      // A-t-il des tags qui le trahissent ?
    playable: survivability && trapExists
  };
}
```

---

## 8. Arborescence de fichiers prévue pour la Phase 1

```
server/games/undercover/
├── characters.js         # Base de 50+ personnages tagués
├── similarity.js         # jaccard + similarity + precomputeMatrix
├── generator.js          # generatePair + distribute + IMPOSTOR_TABLE
├── simulator.js          # simulatePair (validation)
└── __tests__/
    └── validate.js       # Script npm run undercover:validate
```

Pas de `UndercoverGame.js` en Phase 1 : on ne construit pas encore le moteur temps
réel, juste les fonctions pures de distribution.

---

## 9. Étapes de livraison Phase 1

- [x] Curater 65 personnages de départ dans `characters.js` (top animes all-time)
- [x] Implémenter `similarity.js` + `precomputeMatrix` (pondération 40/20/20/20)
- [x] Implémenter `generator.js` (generatePair, distribute, IMPOSTOR_TABLE)
- [x] Implémenter `simulator.js` (simulatePair)
- [x] Implémenter le script `validate.js` (1000 tirages/difficulté + exemples)
- [x] Calibrer les fenêtres de difficulté sur la distribution réelle
- [x] Script npm `undercover:validate` enregistré dans `package.json`
- [x] *Enrichir la base* : 65 → 95 personnages
- [x] *Peaufiner les fiches* : propagation systématique des tags cross-cutting
  (`survivant`, `genocide_famille`, `orphelin`, `mentor`, `eleve`, `heritage_pouvoir`,
  `yeux_rouges`, `rejet_enfance`) pour capturer les similarités conceptuelles
  qui manquaient (ex : Sasuke/Kurapika survivants-de-clan-vengeurs)
- [x] *Affiner minPerCat par difficulté* : 0 / 0.10 / 0.15 / 0.22
- [ ] *Enrichissement futur optionnel* : ajouter Muichiro/Sanemi (Demon Slayer
  épéistes), Goku Black, Cell perfect form, pour densifier hardcore vers 15-20 paires
- [ ] **Point de décision** : passer en Phase 2 (moteur de jeu, WS, UI)

---

## 10. Décisions validées

1. ✓ **Table des effectifs** : répartition proposée en section 1 adoptée
2. ✓ **Base de personnages** : top animes all-time (Naruto, One Piece, DBZ, Bleach,
   Death Note, Attack on Titan, JJK, MHA, Demon Slayer, Fullmetal Alchemist,
   One Punch Man, Hunter x Hunter, etc.) — cibler des personnages largement connus
3. ✓ **Tirage aléatoire** + bouton « relancer » avant démarrage de la partie
4. ✓ **Pondération 40/20/20/20** (visual priorisé)

---

## 11. Phase 2 — Moteur, WebSocket et UI

### 11.1 Machine à états (phases de jeu)

```
WAITING → DEAL → MEMORIZATION → CLUE_ROUND (×N) → VOTE → REVEAL → GAME_OVER
                                      ↑                     │
                                      └─── next round ──────┘
```

| Phase | Description | Qui agit |
|---|---|---|
| `WAITING` | Salle d'attente, l'hôte peut re-roll la paire | Tous rejoignent, hôte lance |
| `DEAL` | Distribution des cartes face cachée (animation 1-2s) | Auto |
| `MEMORIZATION` | Chaque joueur voit son personnage (Card3DModal) | Tous, chacun "OK" |
| `CLUE_ROUND` | Round `r/N` d'indices (ordre randomisé par round) | Chacun à son tour |
| `VOTE` | Vote simultané caché pour un suspect | Tous |
| `REVEAL` | Révèle vote majoritaire + carte éliminée, verdict | Auto |
| `GAME_OVER` | Résultats finaux, XP | Auto + boutons retour |

**Règles de résolution** (à l'issue du vote) :
- Le joueur accusé (majorité des votes) est éliminé et sa carte révélée
- Si **tous les imposteurs éliminés** → civils gagnent
- Si **aucun imposteur éliminé** → imposteurs gagnent
- Si **partiellement éliminé** (cas 2-3 imposteurs) → nouveau round de clues avec joueurs restants
- Tie-break : relance d'un vote entre les 2 top-votés (max 1 fois, sinon aléatoire)

### 11.2 Actions WebSocket

Messages client → serveur (via `method: "undercover_action"`) :

| Action | Payload | Qui |
|---|---|---|
| `start_game` | — | Hôte uniquement, en WAITING |
| `reroll_pair` | — | Hôte uniquement, en WAITING |
| `acknowledge_card` | — | Chaque joueur, en MEMORIZATION |
| `submit_clue` | `{ clue: string }` | Joueur actif en CLUE_ROUND |
| `cast_vote` | `{ targetIdx: number }` | Chaque joueur en VOTE |

Messages serveur → client :
- `update` (broadcast) : nouvel état public après chaque changement
- `private` (unicast) : envoi de la carte personnelle au joueur concerné (DEAL)
- `chat_game` : relayé au chat de partie (via `useChat`)

### 11.3 Arborescence de fichiers Phase 2

```
server/
├── games/
│   ├── games.js                        # + getUndercoverGameInfo
│   └── undercover/
│       ├── characters.js               # (Phase 1)
│       ├── similarity.js               # (Phase 1)
│       ├── generator.js                # (Phase 1)
│       ├── simulator.js                # (Phase 1)
│       └── UndercoverGame.js           # ◄─ NEW
└── index.js                            # + handlers create/join/undercover_action/broadcast

src/components/Games/Undercover/
├── Undercover.jsx                      # Conteneur principal + WS
├── UndercoverLobby.jsx                 # Salle d'attente (re-roll, start)
├── UndercoverMemorize.jsx              # Card3DModal reveal + "OK"
├── UndercoverClueBoard.jsx             # Affichage indices de tous les joueurs
├── UndercoverClueInput.jsx             # Input pour soumettre un indice
├── UndercoverVotePanel.jsx             # Boutons vote
├── UndercoverReveal.jsx                # Résultat vote + carte révélée
├── UndercoverGameOver.jsx              # Écran fin, retour
└── undercoverConstants.js              # Labels, couleurs par rôle

src/scss/components/games/_undercover.scss  # + import dans input.scss
src/components/AnimatedRoutes.jsx           # + route lazy-loaded
```

### 11.4 Moteur `UndercoverGame.js` — API

```js
export class UndercoverGame {
  constructor(playersLimit, difficulty, rounds = 3) { ... }

  addPlayer(clientId, clientName) { ... }
  removePlayer(clientId) { ... }

  rerollPair()                                  // en WAITING uniquement
  startGame()                                   // génère paire + distribue + DEAL
  handleAction(clientId, action) { ... }        // dispatch

  getPublicState()                              // sans les rôles cachés
  getPrivateState(clientId)                     // avec le personnage du joueur
}
```

**State interne** :
```js
{
  phase: "WAITING" | "MEMORIZATION" | "CLUE_ROUND" | "VOTE" | "REVEAL" | "GAME_OVER",
  difficulty: "easy" | "medium" | "hard" | "hardcore",
  rounds: 3,
  currentRound: 0,
  currentPlayerIdx: 0,     // index du joueur qui doit soumettre un indice
  players: [
    { clientId, clientName, seatIdx, character, role: "majority"|"impostor",
      alive: true, hasAcknowledged: false, clues: [], vote: null }
  ],
  pair: { A, B },          // tiré depuis generator
  clueLog: [               // tous les indices par round
    [ { playerIdx, clue } ],
    [ { playerIdx, clue } ],
  ],
  voteCount: { [targetIdx]: count },
  winner: null,            // "majority" | "impostors"
  log: []
}
```

### 11.5 Intégrations Noxi

- **Chat de partie** : `chatJoinGame(gameId, wsRef, clientId)` dans `handleJoin`
- **Stats XP/badges** : `POST /stats/record` à GAME_OVER avec `result: "win" | "loss"` par joueur
- **Game record** : `POST /games` à la création, `PATCH /games/:id` (status=ended) à GAME_OVER
- **Lazy loading** : `const Undercover = lazy(() => import('./Games/Undercover/Undercover'))`

### 11.6 BDD (SQL à exécuter)

```sql
INSERT INTO ncs_gamemodels (name, slug, description, image, playersMin, playersLimit)
VALUES ('Undercover', 'undercover',
        'Jeu de déduction : identifiez les imposteurs parmi les personnages d''anime',
        NULL, 3, 10);

INSERT INTO ncs_gamemode (gameSlug, value, label, description) VALUES
  ('undercover', 'easy',     'Facile',    'Paires distinctes, erreurs visibles'),
  ('undercover', 'medium',   'Moyen',     'Paires similaires, discussion utile'),
  ('undercover', 'hard',     'Difficile', 'Paires très proches, micro-indices'),
  ('undercover', 'hardcore', 'Hardcore',  'Paires quasi-jumelles, ultra-serré');
```

### 11.7 Badges (à ajouter dans `seedBadges()` de `Stats.js`)

```js
{ slug: 'undercover_5wins', name: 'Détective aguerri', description: '5 victoires',
  icon: '🔍', condition_type: 'game_wins', condition_value: 5, condition_game: 'undercover' },
{ slug: 'undercover_impostor_5', name: 'Maître du bluff', description: '5 victoires en imposteur',
  icon: '🎭', condition_type: 'impostor_wins', condition_value: 5, condition_game: 'undercover' },
{ slug: 'undercover_10wins', name: 'Espion confirmé', description: '10 victoires',
  icon: '🕵️', condition_type: 'game_wins', condition_value: 10, condition_game: 'undercover' }
```

### 11.8 Checklist de livraison Phase 2

- [x] Moteur `UndercoverGame.js` avec toutes les phases (WAITING → MEMORIZATION → CLUE_ROUND × N → VOTE → REVEAL)
- [x] Helper `getUndercoverGameInfo` dans `games.js`
- [x] Handlers `create` / `join` / `undercover_action` / `broadcastUndercoverState` dans `server/index.js`
- [x] Fichier SQL `server/games/undercover/install.sql` (à exécuter en BDD : `ncs_gamemodels` + `ncs_gamemode`)
- [x] Badges dans `seedBadges()` (`undercover_5wins`, `undercover_20wins`, `undercover_10games`)
- [x] Composant `Undercover.jsx` avec sous-composants inline (Lobby, Memorize, ClueBoard, VotePanel, Reveal, CardRevealModal)
- [x] Route lazy-loaded dans `AnimatedRoutes.jsx` (`/undercover/:id?`)
- [x] SCSS `_undercover.scss` + import dans `input.scss`
- [x] Intégration chat (`useChat()` hook dans `Undercover.jsx`)
- [x] Appel `/stats/record` en fin de partie (REVEAL)
- [x] Build frontend passé (chunk `Undercover-*.js` lazy-loadé OK)
- [ ] Exécuter `server/games/undercover/install.sql` en BDD locale
- [ ] Test local end-to-end (3 navigateurs privés → créer, rejoindre, jouer)
- [ ] Push en prod quand validé
