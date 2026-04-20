import { CHARACTERS, CHARACTERS_BY_ID } from "./characters.js";
import { SIMILARITY_MATRIX, countSharedTags, countLeakTags, hasVisualIdentityOverlap } from "./similarity.js";

// Répartition civils / imposteurs selon le nombre de joueurs.
// Toutes les valeurs sont fixes et validées par le game design.
export const IMPOSTOR_TABLE = {
  3:  { majority: 2, impostors: 1 },
  4:  { majority: 3, impostors: 1 },
  5:  { majority: 4, impostors: 1 },
  6:  { majority: 4, impostors: 2 },
  7:  { majority: 5, impostors: 2 },
  8:  { majority: 6, impostors: 2 },
  9:  { majority: 6, impostors: 3 },
  10: { majority: 7, impostors: 3 }
};

// Fenêtres de similarité par niveau de difficulté.
//
// Paramètres :
//   min/max       : bornes du score global pondéré
//   minPerCat     : similarité minimale requise sur CHAQUE catégorie (visual,
//                   personality, powers, themes). Ça force les paires à être
//                   similaires sur plusieurs axes à la fois, pas juste à avoir
//                   un bon score moyen tiré par une seule catégorie.
//
// Calibrées sur la distribution réelle de la base (max ~0.52, médian ~0.11).
export const DIFFICULTY = {
  easy:     { min: 0.15, max: 0.25, minPerCat: 0.00 },
  medium:   { min: 0.25, max: 0.35, minPerCat: 0.10 },
  // En hard ET hardcore, on exige que la paire partage au moins un identifiant
  // visuel (couleur cheveux/yeux) OU ait un visual >= 0.25. Ça élimine les
  // paires "âme jumelle mais visuellement étrangères" (ex : Asta/Natsu).
  hard:     { min: 0.35, max: 0.45, minPerCat: 0.15, requireVisualIdentity: true, visualIdentityBypass: 0.25 },
  hardcore: { min: 0.45, max: 1.00, minPerCat: 0.22, requireVisualIdentity: true, visualIdentityBypass: 0.25 }
};

const DIFFICULTY_ORDER = ["hardcore", "hard", "medium", "easy"];

// Seuils de jouabilité : en deçà, la paire ne crée pas un bon jeu.
const MIN_SHARED_TAGS = 4;   // B doit pouvoir tenir plusieurs tours
const MIN_LEAK_TAGS   = 2;   // B doit avoir au moins 2 angles d'identification

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function downgrade(difficulty) {
  const i = DIFFICULTY_ORDER.indexOf(difficulty);
  return i >= 0 && i < DIFFICULTY_ORDER.length - 1
    ? DIFFICULTY_ORDER[i + 1]
    : null;
}

/**
 * Génère une paire (A, B) cohérente pour Undercover.
 * @param {object} opts
 * @param {string} opts.difficulty  "easy" | "medium" | "hard" | "hardcore"
 * @returns { A, B, similarity: number, breakdown, difficultyUsed }
 *          ou null si aucune paire ne peut être trouvée même après fallback.
 */
export function generatePair({ difficulty = "medium" } = {}) {
  const window = DIFFICULTY[difficulty];
  if (!window) throw new Error(`Unknown difficulty: ${difficulty}`);

  // 1. Parcourir les personnages A dans un ordre aléatoire
  const shuffledA = shuffle(CHARACTERS);

  for (const A of shuffledA) {
    // 2. Candidats B dans la fenêtre de similarité + contrainte par catégorie
    //    + seuils de jouabilité
    const candidates = CHARACTERS.filter(B => {
      if (B.id === A.id) return false;
      const { score, breakdown } = SIMILARITY_MATRIX[A.id][B.id];
      if (score < window.min || score > window.max) return false;
      // Toutes les catégories doivent dépasser minPerCat — force la paire à
      // être polyvalente (similaire sur plusieurs axes), pas juste tirée par
      // une seule catégorie.
      if (window.minPerCat > 0) {
        for (const v of Object.values(breakdown)) {
          if (v < window.minPerCat) return false;
        }
      }
      // Contrainte identité visuelle (hardcore) : au moins 1 tag couleur
      // cheveux/yeux partagé, SAUF si la similarité visuelle est déjà forte.
      if (window.requireVisualIdentity) {
        const visualStrong = breakdown.visual >= (window.visualIdentityBypass ?? 0.30);
        if (!visualStrong && !hasVisualIdentityOverlap(A, B)) return false;
      }
      if (countSharedTags(A, B) < MIN_SHARED_TAGS) return false;
      if (countLeakTags(B, A) < MIN_LEAK_TAGS) return false;
      return true;
    });

    if (candidates.length > 0) {
      const B = candidates[Math.floor(Math.random() * candidates.length)];
      return {
        A,
        B,
        similarity: SIMILARITY_MATRIX[A.id][B.id].score,
        breakdown: SIMILARITY_MATRIX[A.id][B.id].breakdown,
        difficultyUsed: difficulty
      };
    }
  }

  // 3. Fallback : on dégrade la difficulté d'un cran
  const next = downgrade(difficulty);
  if (next) return generatePair({ difficulty: next });

  return null;
}

/**
 * Distribue les personnages à chaque joueur pour un effectif donné.
 * @returns tableau de personnages mélangés (length === playerCount)
 */
export function distribute({ A, B, playerCount }) {
  const row = IMPOSTOR_TABLE[playerCount];
  if (!row) throw new Error(`Unsupported player count: ${playerCount}`);
  const deck = [
    ...Array(row.majority).fill(A),
    ...Array(row.impostors).fill(B)
  ];
  return shuffle(deck);
}

/**
 * Helper combiné : génère la paire + distribue en une seule fois.
 */
export function generateRound({ playerCount, difficulty = "medium" }) {
  const pair = generatePair({ difficulty });
  if (!pair) return null;
  const deck = distribute({ A: pair.A, B: pair.B, playerCount });
  return { ...pair, playerCount, deck };
}
