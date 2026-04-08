# Mascarade -- Jeu de bluff multijoueur

## Presentation

Mascarade est un jeu de bluff et d'identite cachee pour **4 a 8 joueurs**. Chaque joueur possede un masque secret dont il peut utiliser le pouvoir -- mais les echanges frequents rendent l'identite de chacun incertaine.

Le premier joueur a atteindre **13 pieces** gagne. Si un joueur perd sa derniere piece, le plus riche l'emporte.

## Contenu

- [Regles du jeu](regles.md) -- Regles completes de Mascarade
- [Implementation technique](implementation.md) -- Moteur serveur, WebSocket, composants React
- [Variantes de scenarios](variantes/) -- Images des configurations par nombre de joueurs

## Masques disponibles (16)

| Masque | Effet principal |
|---|---|
| Escroc | Vole 2 pieces au plus riche |
| Espionne | Regarde un masque + le sien, peut echanger |
| Fou | Prend 1 piece, echange 2 cartes d'autres joueurs |
| Gourou | Force un joueur a annoncer puis reveler (penalite de 4) |
| Imperatrice | Prend 3 pieces de la banque |
| Juge | Recupere les pieces du plateau Justice |
| Marionnettiste | Prend 1 piece a 2 joueurs qui echangent leur place |
| Mecene | Prend 3 pieces + voisins prennent 1 chacun |
| Mendiant | Chaque joueur plus riche donne 1 piece |
| Paysan (x2) | Prend 1 piece (2 si les deux sont reveles) |
| Princesse | Prend 2 pieces, un joueur revele sa carte |
| Roi | Prend 2 pieces de la banque |
| Sorciere | Echange sa fortune avec un autre |
| Tricheur | Gagne a 10+ pieces |
| Veuve | Complete jusqu'a 10 pieces |
| Voleur | Prend 1 piece aux 2 voisins |

## Phases de jeu

```
WAITING → MEMORIZATION → PREPARATION → PLAYING → (GAME_OVER)
```

1. **WAITING** : En attente de joueurs
2. **MEMORIZATION** : Les masques sont distribues face visible, les joueurs memorisent
3. **PREPARATION** : 4 tours d'echanges obligatoires (sans regarder)
4. **PLAYING** : Tours normaux -- regarder, echanger ou annoncer
5. **GAME_OVER** : Un joueur a atteint 13 pieces ou perdu sa derniere

## Captures d'ecran

Le jeu presente une interface immersive avec :
- Plateau circulaire avec les cartes des joueurs
- Plateau Justice au centre avec pieces d'amende
- Panel d'actions a gauche (regarder, echanger, annoncer)
- Journal d'evenements a droite
- Animations de distribution, d'echange et de contestation
- Modal 3D interactive pour reveler les masques
- Particules dorees et effets lumineux
