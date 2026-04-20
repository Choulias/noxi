import { sharedTags, leakTags } from "./similarity.js";

/**
 * Évalue la « jouabilité » d'une paire (A, B).
 *
 * Critères :
 *   - survivability : nombre de tags que B peut emprunter à A (tient N tours)
 *   - leakTags      : nombre de tags que B a et pas A (il peut se trahir dessus)
 *   - ambiguity     : proportion des tags de B qui sont partagés avec A
 *
 * Une paire est "playable" si :
 *   - survivability >= rounds (typiquement 3)  → B tient la partie
 *   - leakTags >= 2                            → les civils ont de quoi coincer B
 */
export function simulatePair({ A, B, rounds = 3 }) {
  const shared = sharedTags(A, B);
  const leaks = leakTags(B, A);
  const totalShared = flatCount(shared);
  const totalLeaks = flatCount(leaks);
  const totalB = A.visual.length
    ? B.visual.length + B.personality.length + B.powers.length + B.themes.length
    : 0;

  return {
    survivability: totalShared,
    leakCount: totalLeaks,
    ambiguity: totalB === 0 ? 0 : totalShared / totalB,
    playable: totalShared >= rounds && totalLeaks >= 2,
    detail: { shared, leaks }
  };
}

function flatCount(obj) {
  return Object.values(obj).reduce((sum, arr) => sum + arr.length, 0);
}

/**
 * Tire un indice simulé pour un joueur.
 *
 * Stratégies :
 *   - "cautious" (imposteur intelligent) → pioche dans les tags partagés avec A
 *   - "reckless"                         → pioche dans n'importe quel tag de B
 *   - "majority"                         → pioche dans les tags de A
 */
export function pickClue(character, strategy = "reckless", other = null) {
  const allTags = [
    ...character.visual,
    ...character.personality,
    ...character.powers,
    ...character.themes
  ];

  if (strategy === "cautious" && other) {
    const shared = flatten(sharedTags(character, other));
    if (shared.length > 0) return shared[Math.floor(Math.random() * shared.length)];
  }

  return allTags[Math.floor(Math.random() * allTags.length)];
}

function flatten(obj) {
  return Object.values(obj).flat();
}

/**
 * Simule une partie complète : N rounds, tous les joueurs donnent un indice.
 * Utile pour prévisualiser ce qu'une paire produit comme dynamique.
 */
export function simulateGame({ A, B, majorityCount, impostorCount, rounds = 3 }) {
  const log = [];
  for (let r = 0; r < rounds; r++) {
    const roundClues = [];
    for (let i = 0; i < majorityCount; i++) {
      roundClues.push({ role: "majority", clue: pickClue(A, "reckless") });
    }
    for (let i = 0; i < impostorCount; i++) {
      roundClues.push({ role: "impostor", clue: pickClue(B, "cautious", A) });
    }
    log.push(roundClues);
  }
  return log;
}
