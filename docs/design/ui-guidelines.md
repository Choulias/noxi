# Systeme de design Noxi

## Identite visuelle

L'esthetique de Noxi s'inspire d'un univers **cyberpunk nocturne** : fonds sombres rappelant un ciel de nuit etoile, accents neon lumineux et effets de glow sur les elements interactifs. L'ambiance evoque une salle d'arcade futuriste.

---

## Palette de couleurs

### Couleurs principales

| Nom | Code | Variable SCSS | Utilisation |
|---|---|---|---|
| **Cyan neon** | `#95FDFC` | `$main` | Elements interactifs, bordures, accents principaux |
| **Rose neon** | `#FEBEFD` | `$secondary` | Accents secondaires, boutons, surbrillance |
| **Fond sombre** | `#06122F` | `$darker` | Arriere-plan principal |
| **Fond bleu** | `#06397B` | `$dark` | Degrades d'arriere-plan |
| **Rouge erreur** | `#ff6b6b` | `$error-red` | Etats d'erreur (login, validation) |

### Degrades

Les degrades utilisent un angle de **45 degres** entre le cyan et le rose :

```css
background: linear-gradient(45deg, #95FDFC, #FEBEFD);
```

Utilisation : boutons, bordures, scrollbar, elements de surbrillance.

### Couleurs utilitaires (Bootstrap)

| Nom | Code |
|---|---|
| Blue | `#0d6efd` |
| Indigo | `#6610f2` |
| Purple | `#6f42c1` |
| Pink | `#d63384` |
| Red | `#dc3545` |
| Orange | `#fd7e14` |
| Yellow | `#ffc107` |
| Green | `#198754` |
| Teal | `#20c997` |
| Cyan | `#0dcaf0` |

---

## Typographie

### Polices principales

| Police | Source | Utilisation |
|---|---|---|
| **Quicksand** | Google Fonts (`@import`) | Titres, en-tetes, elements de jeu |
| **Poppins** | Google Fonts (`@import`) | Corps de texte, interface |
| **Marcellus** | Google Fonts (`@import`) | Chiffres pieces (Mascarade) |

### Grammages

| Grammage | Valeur | Utilisation |
|---|---|---|
| Bold | 700 | Titres principaux |
| Semibold | 600 | Sous-titres, labels importants |
| Medium | 500 | Boutons, liens |
| Regular | 400 | Corps de texte |
| Light | 300 | Texte secondaire |

### Tailles

| Element | Taille |
|---|---|
| Titre principal (H1) | 40-80px |
| Sous-titre (H2) | 24-32px |
| Corps de texte | 14-18px |
| Petit texte | 11-13px |

---

## Composants UI

### Boutons

**Style principal :** Fond avec degrede cyan/rose, coins arrondis (50px pour pilule).

```scss
background: linear-gradient(45deg, $main, $secondary);
border-radius: 50px;
```

**Hover :** Effet de glow neon autour du bouton.

### Cartes

Fond semi-transparent avec flou :

```scss
background: rgba(255, 255, 255, 0.07);
backdrop-filter: blur(10px);
border-radius: 15px;
```

### Modals

Overlay sombre avec contenu centre :

```scss
background: rgba(0, 0, 0, 0.7);
backdrop-filter: blur(5px);
```

### Scrollbar

```scss
&::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, $main, $secondary);
  border-radius: 10px;
}
```

### Notifications Toast (`UI/Toast.jsx`)

Systeme de notifications en superposition, 4 types :
- **success** : Fond vert, confirmation d'action
- **error** : Fond rouge, erreur ou echec
- **info** : Fond bleu, information neutre
- **warning** : Fond orange, avertissement

Les toasts apparaissent en haut a droite et disparaissent automatiquement apres quelques secondes.

### Spinner (`UI/Spinner.jsx`)

Composant de chargement reutilisable, affiche pendant le lazy loading des pages et les appels API.

### Systeme de chat

Le chat se compose de trois elements visuels :
- **ChatBubble** : Bouton flottant en bas a droite avec indicateur de messages non lus
- **ChatDrawer** : Panneau coulissant qui s'ouvre depuis la droite
- **Onglets** : Le drawer contient des onglets (conversations privees, chat de partie, social/amis en ligne)

### Edition inline (profil)

Les pages de profil (`Profile.jsx`, `UserProfile.jsx`) utilisent l'edition inline : les champs texte (bio, nickname, age) sont cliquables et se transforment en champs de saisie. La sauvegarde se fait au blur ou a la validation.

### Boutons d'action avec icones (amis)

Les actions sociales (ajouter en ami, supprimer, accepter) utilisent des boutons circulaires avec des icones SVG, sans texte. Le hover affiche un tooltip explicatif.

---

## Effets visuels

### Glow neon
```scss
box-shadow: 0 0 20px rgba(149, 253, 252, 0.4),
            0 0 40px rgba(149, 253, 252, 0.1);
```

### Parallax (page d'accueil)
Plusieurs couches d'images superposees avec defilement differentiel.

### Transitions de page
Framer Motion avec fade + slide entre les routes.

### Animations de jeu (Mascarade)
- Particules dorees flottantes (`@keyframes particleFloat`)
- Etoiles scintillantes (`@keyframes twinkle`)
- Shimmer sur les cartes (`@keyframes cardShimmer`)
- Balancement des cartes (`@keyframes cardSway`)
- Halo pulse sur le joueur actif (`@keyframes currentPlayerGlow`)
- Distribution et echange de cartes (animations programmatiques)

### Cube SVG (lobby)
Animation de rotation continue pour l'etat d'attente.

### Bouton Galaxy (accueil)
20 etoiles en rotation autour du bouton principal.

### Compteurs animes (accueil)
Incrementation progressive des statistiques (15k joueurs, 1200 parties, etc.).

---

## Organisation CSS

### Structure des fichiers

```
src/scss/
├── _variables.scss              # Variables globales
├── _style.scss                  # Styles globaux
├── input.scss                   # Point d'entree SCSS
└── components/
    ├── _btn.scss                # Boutons
    ├── _header.scss             # Navigation
    ├── _login.scss              # Connexion/inscription
    ├── _popup.scss              # Modals et popups
    ├── _select.scss             # Selecteurs
    ├── _switch.scss             # Interrupteurs
    ├── admin/_admin.scss        # Dashboard admin
    ├── events/_events.scss      # Evenements
    ├── gamers/_gamers.scss       # Communaute
    ├── games/_games.scss        # Selection de jeux
    ├── games/_mascarade.scss    # Plateau Mascarade
    ├── home/_home.scss          # Page d'accueil
    ├── home/_galaxybtn.scss     # Bouton Galaxy
    └── profil/_profil.scss      # Profils
```

### Approche hybride

- **Tailwind CSS** : Utilitaires rapides (layout, spacing, flexbox)
- **SCSS** : Styles complexes, animations, variables, media queries
- Les deux coexistent dans les composants React (`className` combine Tailwind et classes SCSS)
