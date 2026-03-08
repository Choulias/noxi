# MIGRATION : Appliquer toutes les mises à jour au projet D:\Claude\Code

Ce document liste **TOUTES** les modifications à appliquer au projet `D:\Claude\Code` (version front avancée) pour y intégrer les améliorations backend/sécurité faites dans `D:\Claude\Noxi`.

Le projet est une plateforme de jeu multijoueur (React 18 + Vite 4 + Express.js + MySQL/Sequelize + WebSocket).

---

## 1. SÉCURITÉ : Variables d'environnement (.env)

**Problème** : Toutes les variables serveur utilisent le préfixe `VITE_`, ce qui les expose dans le bundle client.

**Fichier : `.env`** — Remplacer tout le contenu par :
```env
# Frontend (exposé côté client)
VITE_AUTHOR = "Ahandriou Rochdi"
VITE_API_URL = "http://localhost:5000"
VITE_WS_URL = "ws://localhost:9090"

# Backend (jamais exposé côté client)
DB_NAME = "noxi"
DB_USER = "root"
DB_PASSWORD = ""
DB_HOST = "localhost"
JWT_SECRET = "LVZmf74!c),@%/gCWm93At6#X432k#jD"
CORS_ORIGIN = "http://localhost:3006"
SENDGRID_API_KEY = "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"
```

**Puis mettre à jour les fichiers qui lisent ces variables :**

### 1a. `server/config/database.js`
Remplacer `VITE_DB_NAME`, `VITE_DB_USER`, `VITE_DB_PASSWORD`, `VITE_DB_HOST` par `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`.

### 1b. `server/controllers/Users.js`
Remplacer `VITE_JWT_SECRET` par `JWT_SECRET` partout.

### 1c. `server/util/sendEmail.js`
Remplacer `VITE_SENDGRID_API_KEY` par `SENDGRID_API_KEY`.

### 1d. `server/controllers/Users.js` — URL de vérification email
Dans la fonction `createUser`, l'URL de vérification dans le mail utilise probablement un lien hardcodé. Utiliser `process.env.CORS_ORIGIN` pour construire l'URL :
```js
const verificationUrl = `${process.env.CORS_ORIGIN}/verify-mail/${verificationString}`;
```

---

## 2. SÉCURITÉ : Middleware d'authentification

**Problème** : Aucune route n'est protégée côté serveur — tout est accessible sans token.

**Créer le dossier `server/middleware/` et 2 fichiers :**

### 2a. `server/middleware/auth.js`
```js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token manquant" });
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide" });
    }
};

export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Accès réservé aux administrateurs" });
    }
    next();
};

export const verifiedMiddleware = (req, res, next) => {
    if (req.user.status !== "verified") {
        return res.status(403).json({ message: "Veuillez vérifier votre email" });
    }
    next();
};
```

### 2b. `server/middleware/errorHandler.js`
```js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Erreur interne du serveur";
    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

export default errorHandler;
```

---

## 3. SÉCURITÉ : Protéger toutes les routes

**Importer et appliquer les middlewares dans chaque fichier de routes.**

### Schéma d'application :

**Routes publiques (pas de middleware) :**
- `POST /users` (inscription)
- `POST /users/login` (connexion)
- `PUT /users/verify-mail/:verificationString` (vérification email)
- `GET /gamemodels` et `GET /gamemodels/:id` et `GET /gamemodels/slug/:slug` (liste des jeux, publique)
- `GET /events/notspotlight`, `GET /events/spotlight`, `GET /events/notspotlight/:model` (événements publics)
- `GET /games/public` (parties publiques)

**Routes protégées (authMiddleware) :**
Toutes les autres GET, POST, PATCH sur : profiles, games, gameplayers, playerscores, events (création), eventattendees, eventlikers, friendships, friendrequests, users/:id

**Routes admin (authMiddleware + adminMiddleware) :**
- `GET /users` (liste tous les utilisateurs)
- `DELETE /users/:id`
- `POST /gamemodels`, `PATCH /gamemodels/:id`, `DELETE /gamemodels/:id`
- `POST /events`, `PATCH /events/:id`, `DELETE /events/:id`, `PATCH /events/unspot/:value`
- Toutes les routes DELETE admin

**Exemple pour `server/routes/userRoutes.js` :**
```js
import express from "express";
import { authMiddleware, adminMiddleware, verifiedMiddleware } from "../middleware/auth.js";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, identifyUser, verifyUser } from "../controllers/Users.js";

const router = express.Router();

// Public
router.post('/', createUser);
router.post('/login', identifyUser);
router.put('/verify-mail/:verificationString', verifyUser);

// Protégé
router.get('/:id', authMiddleware, getUserById);
router.patch('/:id', authMiddleware, verifiedMiddleware, updateUser);

// Admin
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
```

**Appliquer le même pattern à TOUS les fichiers de routes :**
- `eventRoutes.js` — GET spotlight/notspotlight publics, le reste protégé, création/modification/suppression admin
- `gameRoutes.js` — GET /public public, le reste protégé
- `gameModelRoutes.js` — GET publics, POST/PATCH/DELETE admin
- `profileRoutes.js` — tout protégé
- `gamePlayerRoutes.js` — tout protégé
- `playerScoreRoutes.js` — tout protégé
- `eventAttendeeRoutes.js` — tout protégé
- `eventLikerRoutes.js` — tout protégé
- `friendshipRoutes.js` — tout protégé
- `friendRequestRoutes.js` — tout protégé

---

## 4. BACKEND : Nettoyage du serveur (`server/index.js`)

### 4a. Restreindre CORS
Remplacer :
```js
app.use(cors());
```
Par :
```js
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3006',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4b. Ajouter le error handler
Après toutes les déclarations de routes (`app.use('/...', ...Routes)`), ajouter :
```js
import errorHandler from "./middleware/errorHandler.js";
// ... après toutes les routes ...
app.use(errorHandler);
```

### 4c. Remplacer guid() par uuid
Remplacer les fonctions `S4()` et `guid()` custom par :
```js
import { v4 as uuid } from "uuid";
```
Puis remplacer tous les appels `guid()` par `uuid()`.

### 4d. Supprimer la route Products
Supprimer :
```js
import productRoutes from "./routes/productRoutes.js";
app.use('/products', productRoutes);
```

### 4e. Optimiser le WebSocket : polling → event-driven
Remplacer la fonction `updateGameState()` qui fait un polling (boucle setTimeout toutes les 500ms pour TOUS les jeux) par une fonction `broadcastGameState(gameId)` qui envoie l'état uniquement aux joueurs concernés, appelée sur les événements play/reset/join :

```js
function broadcastGameState(gameId) {
    const game = games[gameId];
    if (!game) return;

    const payLoad = {
        "method": "update",
        "game": game
    };

    game.clients.forEach(c => {
        if (clients[c.clientId]) {
            clients[c.clientId].connection.send(JSON.stringify(payLoad));
        }
    });
}
```

Appeler `broadcastGameState(gameId)` après chaque action (join, play, reset) au lieu de `updateGameState()`.

---

## 5. BACKEND : Nettoyage du contrôleur Users (`server/controllers/Users.js`)

- **Supprimer** tous les `console.log` de mots de passe (faille de sécurité)
- **Supprimer** les `console.log` de debug excessifs
- **Corriger les codes HTTP** : utiliser 201 pour création, 409 pour conflit (email/username déjà pris), 401 pour auth échouée
- Dans `updateUser` : utiliser `req.user` (injecté par le middleware) au lieu de décoder le token manuellement
- Utiliser `process.env.CORS_ORIGIN` pour les URLs de vérification email

---

## 6. FRONTEND : Instance Axios centralisée

**Créer `src/api.js`** :
```js
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

**Puis dans TOUS les composants** qui font des appels API :
- Remplacer `import axios from "axios"` par `import api from "../../api"` (ajuster le chemin relatif)
- Remplacer `axios.get('http://localhost:5000/...')` par `api.get('/...')`
- Remplacer `axios.post('http://localhost:5000/...')` par `api.post('/...')`
- Supprimer les headers `{ Authorization: Bearer ${token} }` manuels (le intercepteur s'en charge)

**Composants concernés (tous ceux qui importent axios) :**
- `src/components/Community/Events/Events.jsx`
- `src/components/Community/Gamers/Gamers.jsx`
- `src/components/Games/Games.jsx`
- `src/components/Games/TicTacToe.jsx`
- `src/components/Games/Board.jsx`
- `src/components/Profile/UserProfile.jsx`
- `src/components/Login/Login.jsx`
- `src/components/Login/SignUp.jsx`
- `src/components/Login/ForgotPassword.jsx`
- `src/components/Admin/PlayersList/PlayersList.jsx`
- `src/components/Admin/GamesList/GameModelsList.jsx`
- `src/components/Admin/EventsList/EventsList.jsx`
- `src/components/Email/EmailVerificationLanding.jsx`
- Et tout autre composant utilisant `axios` directement

---

## 7. FRONTEND : Nettoyage App.jsx

- **Supprimer** les imports et routes de Products (`ProductList`, `AddProduct`, `EditProduct`)
- **Supprimer** les imports et routes de Users (`UserList`, `AddUser`, `EditUser`)
- **Vérifier l'import CSS** : s'assurer que le fichier CSS importé contient bien les directives `@tailwind base; @tailwind components; @tailwind utilities;` pour que Vite/PostCSS compile les classes Tailwind à la volée. Si l'import pointe vers `App.css` (version pré-compilée statique), le changer vers `./css/input.css` qui contient les directives `@tailwind`.

---

## 8. FRONTEND : Corriger le chemin du background home

Dans le fichier CSS compilé (`src/css/input.css`), si l'import CSS est fait depuis `src/css/input.css`, les chemins relatifs dans `url()` doivent pointer vers `../assets/...` au lieu de `assets/...`.

Vérifier et corriger :
```css
/* Dans la règle .home .home-parralax */
background-image: url(../assets/img/home-bg.png);
/* au lieu de url(assets/img/home-bg.png) */
```

Faire la même correction dans le fichier SCSS source :
- `src/scss/components/home/_home.scss`

---

## 9. TAILWIND : Corriger les warnings de couleurs dépréciées

**Fichier : `tailwind.config.cjs`**

Remplacer l'import des couleurs :
```js
const colors = require('tailwindcss/colors');
```
Par :
```js
const colors = require('tailwindcss/colors');
const { lightBlue, warmGray, trueGray, coolGray, blueGray, ...safeColors } = colors;
```

Et dans la config `theme.colors`, utiliser `...safeColors` au lieu de `...colors`.

---

## 10. PACKAGE.JSON : Ajouter scripts serveur

Ajouter dans `scripts` :
```json
"server": "node server/index.js",
"server:dev": "nodemon server/index.js"
```

---

## 11. FICHIERS LEGACY À SUPPRIMER

- `src/components/Products/` (tout le dossier)
- `src/components/Users/` (tout le dossier)
- `server/controllers/Products.js`
- `server/models/productModel.js`
- `server/routes/productRoutes.js`

---

## 12. BASE DE DONNÉES

Le script SQL `noxi_database.sql` est déjà prêt dans `D:\Claude\Noxi\noxi_database.sql`.
Il contient :
- 11 tables (users, profiles, games, gamemodels, gameplayers, playerscores, events, eventattendees, eventlikers, friendships, friendrequests)
- 3 utilisateurs : admin (Admin1!), Player1 (Player1!), Player2 (Player2!)
- 2 modèles de jeu (OXO/tictactoe, Board/board)
- 5 événements avec participants et likers
- Profils, scores, amitiés

**Copier ce fichier dans le projet Code.**

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

1. Copier `noxi_database.sql` dans le projet
2. Modifier `.env` (section 1)
3. Mettre à jour `database.js`, `Users.js`, `sendEmail.js` pour les nouvelles vars (sections 1a-1d)
4. Créer `server/middleware/auth.js` et `errorHandler.js` (section 2)
5. Protéger toutes les routes (section 3)
6. Nettoyer `server/index.js` (section 4)
7. Nettoyer `Users.js` (section 5)
8. Créer `src/api.js` et migrer tous les composants (section 6)
9. Nettoyer `App.jsx` (section 7)
10. Corriger le chemin background CSS (section 8)
11. Corriger Tailwind config (section 9)
12. Ajouter scripts package.json (section 10)
13. Supprimer fichiers legacy (section 11)

---

*Document généré pour migration de D:\Claude\Noxi vers D:\Claude\Code*
