# Architecture Frontend

## Technologies

| Technologie | Version | Role |
|---|---|---|
| React | 18.2.0 | Bibliotheque UI |
| Vite | 4.1.0 | Bundler et serveur de developpement |
| React Router | 6.8.2 | Routage SPA |
| Tailwind CSS | 3.3.2 | Framework CSS utilitaire |
| SCSS/Sass | 1.97.3 | Styles composants personnalises |
| Material UI | 5.13.1 | DataGrid et formulaires (admin) |
| Headless UI | 1.7.14 | Composants accessibles (dropdown, modals) |
| Framer Motion | 12.35.1 | Animations de transition de pages |
| GSAP | 3.11.5 | Animations au scroll |
| Swiper | 9.3.2 | Carrousel de selection de jeux |
| Axios | 1.3.4 | Requetes HTTP avec intercepteur JWT |

## Arborescence des composants

```
src/components/
├── Home/                      # Page d'accueil
│   └── Home.jsx               # Parallax, compteurs animes, bouton Galaxy
│
├── Games/                     # Jeux
│   ├── Games.jsx              # Carrousel Swiper de selection de jeux
│   ├── TicTacToe.jsx          # Tic-Tac-Toe (2 joueurs)
│   ├── Board.jsx              # Board Game (2-3 joueurs)
│   └── Mascarade/             # Mascarade (4-8 joueurs)
│       ├── Mascarade.jsx              # Conteneur principal + WebSocket
│       ├── MascaradeBoard.jsx         # Plateau de jeu (cartes, pieces)
│       ├── MascaradeActions.jsx       # Panel d'actions (regarder, echanger, annoncer)
│       ├── MascaradeContestation.jsx  # Interface de contestation
│       ├── MascaradeLog.jsx           # Journal d'evenements
│       ├── MascaradePlayerCard.jsx    # Carte joueur (avatar, pieces, masque)
│       ├── MascaradeAnimations.jsx    # Systeme d'animations (deal, swap, etc.)
│       ├── Card3DModal.jsx            # Modal 3D interactive (rotation, shine)
│       └── mascaradeConstants.js      # Constantes (masques, images, descriptions)
│
├── Community/
│   ├── Events/Events.jsx      # Navigation et filtrage d'evenements
│   ├── Leaderboard/           # Classement des joueurs
│   ├── Players/               # Decouverte des joueurs
│   └── Gamers/Gamers.jsx      # Membres de la communaute
│
├── Profile/
│   ├── Profile.jsx            # Profil personnel (edition inline)
│   └── UserProfile.jsx        # Profil d'un autre joueur (edition inline)
│
├── Login/
│   ├── Login.jsx              # Connexion
│   ├── SignUp.jsx             # Inscription
│   └── ForgotPassword.jsx     # Mot de passe oublie
│
├── Admin/
│   ├── Admin.jsx              # Dashboard admin
│   ├── PlayersList/           # Gestion des joueurs (MUI DataGrid)
│   ├── GamesList/             # Gestion des modeles de jeux
│   └── EventsList/            # Gestion des evenements
│
├── Auth/
│   ├── useUser.jsx            # Hook Context pour l'etat utilisateur
│   ├── useToken.jsx           # Gestion du token JWT (localStorage)
│   ├── PrivateRoute.jsx       # Route protegee (authentifie)
│   ├── AdminRoute.jsx         # Route protegee (admin)
│   └── RedirectRoute.jsx      # Redirection si deja connecte
│
├── UI/
│   ├── Spinner.jsx               # Spinner de chargement reutilisable
│   └── Toast.jsx                 # Notifications toast (success, error, info, warning)
│
├── Chat/
│   ├── ChatContext.jsx            # Provider global etat du chat
│   ├── ChatBubble.jsx             # Bouton flottant en bas a droite
│   ├── ChatDrawer.jsx             # Panneau coulissant
│   ├── ChatConversationList.jsx   # Liste des conversations privees
│   ├── ChatConversation.jsx       # Conversation avec un utilisateur
│   ├── ChatGameRoom.jsx          # Chat de la partie en cours
│   └── ChatSocial.jsx            # Onglet social (liste d'amis en ligne)
│
├── Nav/Nav.jsx                # Barre de navigation + dropdown
├── Footer/Footer.jsx          # Pied de page
├── Support/Support.jsx        # Page de support
├── Email/                     # Flux de verification email
├── GlobalInfo.jsx             # Context API (etat global d'auth)
├── AnimatedRoutes.jsx         # Routes avec transitions Framer Motion
└── 404/                       # Page non trouvee
```

## Gestion de l'etat

### Context API
L'application utilise React Context pour l'etat global d'authentification :
- `GlobalInfo.jsx` : Provider qui fournit `user`, `token`, `setToken`
- `useUser.jsx` : Hook qui decode le JWT pour obtenir les infos utilisateur
- `useToken.jsx` : Hook qui gere le token dans localStorage
- `ChatContext.jsx` : Provider qui gere l'etat du chat (conversations, messages non lus, drawer ouvert/ferme). Encapsule la logique WebSocket pour les messages en temps reel.

### Etat local
Chaque composant de jeu gere son propre etat via `useState` et `useRef` :
- `useState` pour les donnees reactives (UI)
- `useRef` pour les donnees non-reactives (animations, WebSocket)

## Routing

Les routes sont definies dans `AnimatedRoutes.jsx` avec Framer Motion pour les transitions. Les composants de page sont charges en **lazy loading** (`React.lazy` + `Suspense`) pour reduire la taille du bundle initial :

| Route | Composant | Protection |
|---|---|---|
| `/` | Home | Public |
| `/games` | Games | Public |
| `/games/:slug/:gameid` | TicTacToe / Board / Mascarade | Public |
| `/community` | Events | Public |
| `/login` | Login | RedirectRoute |
| `/signup` | SignUp | RedirectRoute |
| `/profile` | Profile | PrivateRoute |
| `/profile/:id` | UserProfile | PrivateRoute |
| `/admin` | Admin | AdminRoute |

## Instance Axios

`src/api.js` configure une instance Axios centralisee :
- Base URL depuis `VITE_API_URL`
- Header `Authorization: Bearer <token>` automatique
- Intercepteur de reponse : redirige vers `/login` sur erreur 401 (sauf routes d'auth)

## Styles

L'application combine deux approches CSS :
- **Tailwind CSS** : utilitaires rapides (`flex`, `items-center`, `p-4`, etc.)
- **SCSS** : styles complexes par composant, animations, variables

### Variables SCSS (`_variables.scss`)
```scss
$main: #95FDFC;        // Cyan neon
$secondary: #FEBEFD;   // Rose neon
$darker: #06122F;      // Fond sombre
$dark: #06397B;        // Fond bleu
```

## Patterns et conventions

### Pages d'authentification
Les pages Login/SignUp utilisent `document.body.classList.add('auth-page')` dans un `useEffect` (avec cleanup dans le return) pour appliquer un style global au body, evitant la manipulation directe du DOM.

### Gestion des erreurs API
Les appels API sont systematiquement enveloppes dans des blocs `try-catch` avec gestion d'erreur (affichage de messages utilisateur, gestion du state d'erreur).

### Optimisation du polling
Les frequences de polling sont reduites pour limiter la charge reseau :
- **15 secondes** pour les messages (chat)
- **15 secondes** pour les notifications
- **60 secondes** pour les donnees sociales (amis en ligne)

### Appels API par lot (batch)
Pour eviter les patterns N+1, les composants qui affichent plusieurs utilisateurs utilisent `POST /users/batch` pour recuperer les donnees en un seul appel.

### Lazy loading
Les composants lourds (pages de jeu, admin, etc.) sont charges via `React.lazy` pour reduire le bundle initial. Un `Spinner` est affiche pendant le chargement.

### Edition inline (profil)
Les pages de profil utilisent l'edition inline : les champs sont editables directement sur la page sans redirection vers un formulaire separe.

### Patterns asynchrones
Les traitements asynchrones sur des collections utilisent `Promise.all` + `map` au lieu de `forEach(async ...)`, ce qui garantit que toutes les promesses sont correctement attendues.
