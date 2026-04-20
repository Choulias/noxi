// Script de validation de la base Undercover.
// Usage : node server/games/undercover/__tests__/validate.js
//
// Mesure sur 1000 générations par difficulté :
//   - % succès sans fallback
//   - similarité moyenne des paires
//   - tags partagés moyens
//   - tags "leak" moyens
//   - % de paires jouables (selon simulatePair)

import { CHARACTERS } from "../characters.js";
import { SIMILARITY_MATRIX, countSharedTags, countLeakTags } from "../similarity.js";
import { generatePair, DIFFICULTY } from "../generator.js";
import { simulatePair } from "../simulator.js";

const TRIALS = 1000;
const DIFFICULTIES = ["easy", "medium", "hard", "hardcore"];

// Cibles : % succès sans fallback minimum attendu
const TARGETS = {
  easy: 95,
  medium: 90,
  hard: 75,
  hardcore: 50
};

function pct(n, total) {
  return total === 0 ? 0 : (n / total) * 100;
}

function avg(arr) {
  return arr.length === 0 ? 0 : arr.reduce((s, x) => s + x, 0) / arr.length;
}

function runDifficulty(difficulty) {
  const results = {
    successFirstTry: 0,
    successAfterFallback: 0,
    total: 0,
    similarities: [],
    shared: [],
    leaks: [],
    playable: 0
  };

  for (let i = 0; i < TRIALS; i++) {
    const pair = generatePair({ difficulty });
    results.total++;
    if (!pair) continue;

    if (pair.difficultyUsed === difficulty) {
      results.successFirstTry++;
    } else {
      results.successAfterFallback++;
    }

    results.similarities.push(pair.similarity);

    const sim = simulatePair({ A: pair.A, B: pair.B });
    results.shared.push(sim.survivability);
    results.leaks.push(sim.leakCount);
    if (sim.playable) results.playable++;
  }

  return results;
}

function formatRow(difficulty, r) {
  const firstTryPct = pct(r.successFirstTry, r.total);
  const target = TARGETS[difficulty];
  const status = firstTryPct >= target ? "OK" : "BELOW TARGET";
  return {
    difficulty,
    firstTryPct: firstTryPct.toFixed(1) + "%",
    target: target + "%",
    status,
    avgSim: avg(r.similarities).toFixed(3),
    avgShared: avg(r.shared).toFixed(1),
    avgLeaks: avg(r.leaks).toFixed(1),
    playablePct: pct(r.playable, r.total).toFixed(1) + "%"
  };
}

function main() {
  console.log("Undercover — validation de la base");
  console.log(`Personnages chargés : ${CHARACTERS.length}`);
  console.log(`Tirages par difficulté : ${TRIALS}`);
  console.log("");

  const rows = [];
  for (const diff of DIFFICULTIES) {
    const r = runDifficulty(diff);
    rows.push(formatRow(diff, r));
  }

  console.table(rows);

  // Statistiques globales sur la matrice
  console.log("");
  console.log("Statistiques sur la matrice de similarité :");
  const scores = [];
  for (const a of CHARACTERS) {
    for (const b of CHARACTERS) {
      if (a.id < b.id) scores.push(SIMILARITY_MATRIX[a.id][b.id].score);
    }
  }
  scores.sort((x, y) => x - y);
  console.log(`  Paires totales : ${scores.length}`);
  console.log(`  Min : ${scores[0].toFixed(3)}`);
  console.log(`  Médian : ${scores[Math.floor(scores.length / 2)].toFixed(3)}`);
  console.log(`  Max : ${scores[scores.length - 1].toFixed(3)}`);
  console.log(`  Moyenne : ${avg(scores).toFixed(3)}`);

  // Distribution par bucket de difficulté.
  // On distingue :
  //   - "in-range"   : score global dans la fenêtre
  //   - "eligible"   : in-range ET passe minPerCat ET seuils shared/leaks
  console.log("");
  console.log("Paires disponibles par difficulté :");
  console.log("  in-range  = score global dans la fenêtre");
  console.log("  eligible  = respecte aussi minPerCat + seuils shared/leaks");
  console.log("");
  for (const [name, window] of Object.entries(DIFFICULTY)) {
    let inRange = 0;
    let eligible = 0;
    for (const a of CHARACTERS) {
      for (const b of CHARACTERS) {
        if (a.id >= b.id) continue;
        const { score, breakdown } = SIMILARITY_MATRIX[a.id][b.id];
        if (score < window.min || score > window.max) continue;
        inRange++;
        if (window.minPerCat > 0 && Object.values(breakdown).some(v => v < window.minPerCat)) continue;
        if (countSharedTags(a, b) < 4) continue;
        if (countLeakTags(b, a) < 2) continue;
        eligible++;
      }
    }
    console.log(`  ${name.padEnd(10)} [${window.min.toFixed(2)}-${window.max.toFixed(2)}] minPerCat=${window.minPerCat.toFixed(2)} : in-range=${inRange}, eligible=${eligible}`);
  }

  // Exemples concrets de paires générées par difficulté
  console.log("");
  console.log("Exemples de paires générées :");
  for (const diff of DIFFICULTIES) {
    console.log(`\n[${diff}]`);
    const seen = new Set();
    let printed = 0;
    let attempts = 0;
    while (printed < 5 && attempts < 100) {
      const pair = generatePair({ difficulty: diff });
      attempts++;
      if (!pair || pair.difficultyUsed !== diff) continue;
      const key = [pair.A.id, pair.B.id].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      printed++;
      console.log(`  ${pair.A.name.padEnd(24)} vs ${pair.B.name.padEnd(24)} sim=${pair.similarity.toFixed(3)}  (v=${pair.breakdown.visual.toFixed(2)} p=${pair.breakdown.personality.toFixed(2)} pw=${pair.breakdown.powers.toFixed(2)} t=${pair.breakdown.themes.toFixed(2)})`);
    }
  }

  // Top 10 paires les plus similaires de toute la base
  console.log("");
  console.log("Top 10 paires les plus similaires (toutes difficultés) :");
  const allPairs = [];
  for (const a of CHARACTERS) {
    for (const b of CHARACTERS) {
      if (a.id < b.id) {
        allPairs.push({ a, b, sim: SIMILARITY_MATRIX[a.id][b.id].score });
      }
    }
  }
  allPairs.sort((x, y) => y.sim - x.sim);
  for (const p of allPairs.slice(0, 10)) {
    console.log(`  ${p.a.name.padEnd(24)} vs ${p.b.name.padEnd(24)} sim=${p.sim.toFixed(3)}`);
  }

  // Exit code non-zéro si une difficulté est sous la cible
  const hasFail = rows.some(r => r.status !== "OK");
  process.exit(hasFail ? 1 : 0);
}

main();
