import { CHARACTERS } from "./characters.js";

// Pondération des catégories dans le score de similarité global.
// Décision design : visual priorisé (40%) car c'est le vecteur d'indice
// le plus naturel pour les joueurs (cheveux, yeux, tenue).
export const WEIGHTS = {
  visual: 0.40,
  personality: 0.20,
  powers: 0.20,
  themes: 0.20
};

const CATEGORIES = ["visual", "personality", "powers", "themes"];

// ─── IDF (Inverse Document Frequency) ────────────────────────────────────
// Un tag qui apparaît chez 80% des persos est peu distinctif ("combat_rapproche",
// "adolescent"). Un tag qui apparaît chez 3% des persos est très distinctif
// ("magie", "moustaches_renard", "sharingan").
//
// On calcule un poids par tag = log(N / count). Tag rare → poids élevé.
// Puis on remplace le Jaccard classique par un Jaccard pondéré par IDF :
// chaque tag partagé contribue à hauteur de son poids.
//
// Effet : deux persos qui partagent 10 tags ultra-communs scorent moins
// que deux persos qui partagent 3 tags très distinctifs.

function computeIDF(characters) {
  const N = characters.length;
  const counts = {};
  for (const c of characters) {
    const allTags = new Set([...c.visual, ...c.personality, ...c.powers, ...c.themes]);
    for (const t of allTags) {
      counts[t] = (counts[t] || 0) + 1;
    }
  }
  const idf = {};
  for (const [tag, count] of Object.entries(counts)) {
    // log(N / count). +1 au denom pour éviter log(1)=0 sur un tag ubiquitaire.
    idf[tag] = Math.log(N / count);
  }
  return idf;
}

export const IDF = computeIDF(CHARACTERS);

function weightOf(tag) {
  return IDF[tag] ?? 0;
}

function jaccardWeighted(arrA, arrB) {
  const setA = new Set(arrA);
  const setB = new Set(arrB);
  if (setA.size === 0 && setB.size === 0) return 0;
  let interWeight = 0;
  let unionWeight = 0;
  for (const t of setA) {
    const w = weightOf(t);
    unionWeight += w;
    if (setB.has(t)) interWeight += w;
  }
  for (const t of setB) {
    if (!setA.has(t)) unionWeight += weightOf(t);
  }
  return unionWeight === 0 ? 0 : interWeight / unionWeight;
}

// Alias conservé pour les tests qui appelaient `jaccard` directement.
const jaccard = jaccardWeighted;

/**
 * Similarité entre deux personnages.
 * @returns { score: number 0..1, breakdown: { visual, personality, powers, themes } }
 */
export function similarity(a, b, weights = WEIGHTS) {
  const breakdown = {};
  let score = 0;
  for (const cat of CATEGORIES) {
    const s = jaccard(a[cat], b[cat]);
    breakdown[cat] = s;
    score += s * weights[cat];
  }
  return { score, breakdown };
}

/**
 * Pré-calcule la matrice de similarité NxN.
 * Accès : matrix[idA][idB] = { score, breakdown }
 */
export function precomputeMatrix(characters = CHARACTERS, weights = WEIGHTS) {
  const matrix = {};
  for (const a of characters) {
    matrix[a.id] = {};
    for (const b of characters) {
      if (a.id === b.id) {
        matrix[a.id][b.id] = { score: 1, breakdown: { visual: 1, personality: 1, powers: 1, themes: 1 } };
      } else {
        matrix[a.id][b.id] = similarity(a, b, weights);
      }
    }
  }
  return matrix;
}

// Matrice calculée au chargement du module (une seule fois)
export const SIMILARITY_MATRIX = precomputeMatrix();

/**
 * Tags partagés entre A et B, pour info / debug.
 */
export function sharedTags(a, b) {
  const result = {};
  for (const cat of CATEGORIES) {
    const setB = new Set(b[cat]);
    result[cat] = a[cat].filter(t => setB.has(t));
  }
  return result;
}

/**
 * Tags de B absents de A — « leaks » qui peuvent trahir B s'il les dit.
 */
export function leakTags(b, a) {
  const result = {};
  for (const cat of CATEGORIES) {
    const setA = new Set(a[cat]);
    result[cat] = b[cat].filter(t => !setA.has(t));
  }
  return result;
}

export function countSharedTags(a, b) {
  const shared = sharedTags(a, b);
  return CATEGORIES.reduce((sum, cat) => sum + shared[cat].length, 0);
}

export function countLeakTags(b, a) {
  const leaks = leakTags(b, a);
  return CATEGORIES.reduce((sum, cat) => sum + leaks[cat].length, 0);
}

// ─── Identifiant visuel ──────────────────────────────────────────────────
// Un tag "identifiant" est une couleur de cheveux ou d'yeux. Ce sont les
// éléments qui permettent à un joueur de distinguer deux persos d'un coup d'œil.
// Les tags "structurels" (muscle, adolescent, regard_froid, cheveux_herisses)
// ne comptent PAS comme identifiants — deux persos peuvent être "tous les deux
// adolescents musclés hérissés" sans se ressembler visuellement.

const HAIR_COLOR_TAGS = new Set([
  "cheveux_blonds", "cheveux_noirs", "cheveux_bruns", "cheveux_roux",
  "cheveux_blancs", "cheveux_verts", "cheveux_roses", "cheveux_violets",
  "cheveux_bleus", "cheveux_argentes", "cheveux_rouges", "cheveux_oranges",
  "cheveux_heterochromes", "chauve"
]);

const EYE_COLOR_TAGS = new Set([
  "yeux_bleus", "yeux_rouges", "yeux_verts", "yeux_noirs", "yeux_dores",
  "yeux_heterochromes", "yeux_violets", "yeux_gris", "yeux_oranges",
  "yeux_argentes", "yeux_noisette", "yeux_jaunes", "yeux_roses"
]);

/**
 * Vrai si les deux persos partagent au moins un tag identifiant visuel
 * (couleur de cheveux ou couleur d'yeux). Critère utilisé en hardcore pour
 * exclure les paires "âme jumelle mais look totalement différent".
 */
export function hasVisualIdentityOverlap(a, b) {
  const bHair = new Set(b.visual.filter(t => HAIR_COLOR_TAGS.has(t)));
  const bEye = new Set(b.visual.filter(t => EYE_COLOR_TAGS.has(t)));
  for (const t of a.visual) {
    if (HAIR_COLOR_TAGS.has(t) && bHair.has(t)) return true;
    if (EYE_COLOR_TAGS.has(t) && bEye.has(t)) return true;
  }
  return false;
}
