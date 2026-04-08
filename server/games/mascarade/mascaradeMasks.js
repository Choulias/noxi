// Mask power definitions for Mascarade
// Each power function takes (game, executorIndex) and returns an effect descriptor
// Effects can be immediate, require targets, or have multi-step resolution

export const MASK_POWERS = {

  roi: (game, executorIdx) => {
    // Take 2 coins from bank
    return { immediate: true, execute: () => transferFromBank(game, executorIdx, 2) };
  },

  imperatrice: (game, executorIdx) => {
    // Take 3 coins from bank
    return { immediate: true, execute: () => transferFromBank(game, executorIdx, 3) };
  },

  juge: (game, executorIdx) => {
    // Take all coins from the Justice board
    const amount = game.state.justiceBoard;
    return {
      immediate: true,
      execute: () => {
        game.state.players[executorIdx].coins += amount;
        game.state.justiceBoard = 0;
        return { log: `prend ${amount} pièce(s) du plateau Justice` };
      }
    };
  },

  veuve: (game, executorIdx) => {
    // Take coins from bank until you have 10 (no effect if already 10+)
    const player = game.state.players[executorIdx];
    const deficit = Math.max(0, 10 - player.coins);
    return {
      immediate: true,
      execute: () => {
        player.coins += deficit;
        if (deficit === 0) return { log: `a déjà 10+ pièces, aucun effet` };
        return { log: `prend ${deficit} pièce(s) de la Banque (monte à 10)` };
      }
    };
  },

  voleur: (game, executorIdx) => {
    // Take 1 from left neighbor and 1 from right neighbor
    return {
      immediate: true,
      execute: () => {
        const left = getLeftNeighbor(game, executorIdx);
        const right = getRightNeighbor(game, executorIdx);
        stealCoin(game, executorIdx, left, 1);
        stealCoin(game, executorIdx, right, 1);
        const lName = game.state.players[left].clientName;
        const rName = game.state.players[right].clientName;
        return { log: `vole 1 pièce à ${lName} (gauche) et 1 à ${rName} (droite)` };
      }
    };
  },

  mecene: (game, executorIdx) => {
    // Take 3 from bank, left and right neighbors each take 1
    return {
      immediate: true,
      execute: () => {
        const left = getLeftNeighbor(game, executorIdx);
        const right = getRightNeighbor(game, executorIdx);
        game.state.players[executorIdx].coins += 3;
        game.state.players[left].coins += 1;
        game.state.players[right].coins += 1;
        const lName = game.state.players[left].clientName;
        const rName = game.state.players[right].clientName;
        return { log: `prend 3 pièces, ${lName} et ${rName} prennent 1 pièce chacun` };
      }
    };
  },

  mendiant: (game, executorIdx) => {
    // Each player richer than executor gives 1 coin, starting from left
    return {
      immediate: true,
      execute: () => {
        const executor = game.state.players[executorIdx];
        const executorCoinsAtStart = executor.coins; // Capture before any transfers
        let collected = 0;
        const playerCount = game.state.players.length;
        // Start from left neighbor, go clockwise
        for (let i = 1; i < playerCount; i++) {
          const idx = (executorIdx + i) % playerCount;
          const other = game.state.players[idx];
          if (other.coins > executorCoinsAtStart) {
            stealCoin(game, executorIdx, idx, 1);
            collected++;
          }
        }
        return { log: `reçoit ${collected} pièce(s) des joueurs plus riches` };
      }
    };
  },

  tricheur: (game, executorIdx) => {
    // If 10+ coins, win immediately
    return {
      immediate: true,
      execute: () => {
        const player = game.state.players[executorIdx];
        if (player.coins >= 10) {
          game.state.phase = "GAME_OVER";
          game.state.winner = executorIdx;
          return { log: `a ${player.coins} pièces et gagne immédiatement !` };
        }
        return { log: `a moins de 10 pièces, pas d'effet` };
      }
    };
  },

  paysan: (game, executorIdx, bothRevealed = false) => {
    // Take 1 from bank (or 2 if both Paysans revealed in contestation)
    const amount = bothRevealed ? 2 : 1;
    return {
      immediate: true,
      execute: () => {
        game.state.players[executorIdx].coins += amount;
        if (bothRevealed) return { log: `prend 2 pièces (les 2 Paysans révélés !)` };
        return { log: `prend 1 pièce de la Banque` };
      }
    };
  },

  escroc: (game, executorIdx) => {
    // Take 2 coins from richest player (choice if tie)
    const richest = getRichestPlayers(game, executorIdx);
    if (richest.length === 1) {
      return {
        immediate: true,
        execute: () => {
          stealCoin(game, executorIdx, richest[0], 2);
          return { log: `vole 2 pièces à ${game.state.players[richest[0]].clientName}` };
        }
      };
    }
    // Multiple richest — need target selection
    return {
      needsTarget: true,
      validTargets: richest,
      onTarget: (targetIdx) => {
        stealCoin(game, executorIdx, targetIdx, 2);
        return { log: `vole 2 pièces à ${game.state.players[targetIdx].clientName}` };
      }
    };
  },

  sorciere: (game, executorIdx) => {
    // Swap entire fortune with another player
    const validTargets = getAllOtherPlayers(game, executorIdx);
    return {
      needsTarget: true,
      validTargets,
      onTarget: (targetIdx) => {
        const executor = game.state.players[executorIdx];
        const target = game.state.players[targetIdx];
        const temp = executor.coins;
        executor.coins = target.coins;
        target.coins = temp;
        return { log: `échange sa fortune avec ${target.clientName}` };
      }
    };
  },

  princesse: (game, executorIdx) => {
    // Take 2 from bank, then choose a player who reveals card to others (not to themselves)
    game.state.players[executorIdx].coins += 2;
    const validTargets = getAllOtherPlayers(game, executorIdx);
    return {
      needsTarget: true,
      validTargets,
      subPhase: "PRINCESSE_REVEAL",
      onTarget: (targetIdx) => {
        // Reveal target's mask to everyone except target
        const mask = game.state.players[targetIdx].mask;
        const reveals = [];
        game.state.players.forEach((p, i) => {
          if (i !== targetIdx) {
            reveals.push({ clientId: p.clientId, data: { type: "princesse_reveal", targetIndex: targetIdx, mask } });
          }
        });
        return { log: `prend 2 pièces et révèle le masque de ${game.state.players[targetIdx].clientName} aux autres`, privateMessages: reveals };
      }
    };
  },

  gourou: (game, executorIdx) => {
    // Choose a player who must guess their mask. Wrong = pay 4 coins to Gourou
    const validTargets = getAllOtherPlayers(game, executorIdx);
    return {
      needsTarget: true,
      validTargets,
      subPhase: "GOUROU_GUESS",
      onTarget: (targetIdx) => {
        // Store target, wait for their guess
        game.state.powerState = {
          type: "gourou_guess",
          executorIdx,
          targetIdx,
          data: {}
        };
        return { log: `désigne ${game.state.players[targetIdx].clientName} qui doit deviner son Masque`, awaitGuess: true };
      },
      onGuess: (targetIdx, guessedMask) => {
        const target = game.state.players[targetIdx];
        const correct = target.mask === guessedMask;
        if (!correct) {
          const payment = Math.min(4, target.coins);
          target.coins -= payment;
          game.state.players[executorIdx].coins += payment;
          return {
            log: `${target.clientName} se trompe ! Paie ${payment} pièce(s) au Gourou`,
            reveal: { playerIndex: targetIdx, mask: target.mask }
          };
        }
        return {
          log: `${target.clientName} devine correctement, rien ne se passe`,
          reveal: { playerIndex: targetIdx, mask: target.mask }
        };
      }
    };
  },

  espionne: (game, executorIdx) => {
    // Look at another player's mask and your own, then decide to swap or not
    const validTargets = getAllOtherPlayers(game, executorIdx);
    return {
      needsTarget: true,
      validTargets,
      subPhase: "ESPIONNE_LOOK",
      onTarget: (targetIdx) => {
        const myMask = game.state.players[executorIdx].mask;
        const theirMask = game.state.players[targetIdx].mask;
        game.state.powerState = {
          type: "espionne_decision",
          executorIdx,
          targetIdx,
          data: {}
        };
        return {
          log: `regarde secrètement le masque de ${game.state.players[targetIdx].clientName}`,
          privateMessages: [{
            clientId: game.state.players[executorIdx].clientId,
            data: { type: "espionne_reveal", yourMask: myMask, targetMask: theirMask, targetIndex: targetIdx }
          }],
          awaitDecision: true
        };
      },
      onDecision: (doSwap) => {
        const { executorIdx, targetIdx } = game.state.powerState;
        if (doSwap) {
          const temp = game.state.players[executorIdx].mask;
          game.state.players[executorIdx].mask = game.state.players[targetIdx].mask;
          game.state.players[targetIdx].mask = temp;
        }
        // Others don't know if swap happened
        return { log: `a fini son action` };
      }
    };
  },

  fou: (game, executorIdx) => {
    // Take 1 from bank, then swap (or pretend) 2 other players' cards
    game.state.players[executorIdx].coins += 1;
    const validTargets = getAllOtherPlayers(game, executorIdx);
    return {
      needsTargets: 2,
      validTargets,
      subPhase: "FOU_SWAP",
      onTargets: (targetIdx1, targetIdx2, didSwap) => {
        if (didSwap) {
          const temp = game.state.players[targetIdx1].mask;
          game.state.players[targetIdx1].mask = game.state.players[targetIdx2].mask;
          game.state.players[targetIdx2].mask = temp;
        }
        const n1 = game.state.players[targetIdx1].clientName;
        const n2 = game.state.players[targetIdx2].clientName;
        return { log: `prend 1 pièce et manipule les cartes de ${n1} et ${n2}` };
      }
    };
  },

  marionnettiste: (game, executorIdx) => {
    // Choose 2 players, take 1 coin from each, they swap seats (cards+fortune stay)
    const validTargets = getAllOtherPlayers(game, executorIdx);
    return {
      needsTargets: 2,
      validTargets,
      subPhase: "MARIONNETTISTE_SWAP",
      onTargets: (targetIdx1, targetIdx2) => {
        stealCoin(game, executorIdx, targetIdx1, 1);
        stealCoin(game, executorIdx, targetIdx2, 1);
        // Swap seat indices
        const temp = game.state.players[targetIdx1].seatIndex;
        game.state.players[targetIdx1].seatIndex = game.state.players[targetIdx2].seatIndex;
        game.state.players[targetIdx2].seatIndex = temp;
        const n1 = game.state.players[targetIdx1].clientName;
        const n2 = game.state.players[targetIdx2].clientName;
        return { log: `prend 1 pièce à ${n1} et ${n2}, qui échangent leur place` };
      }
    };
  }
};

// --- Helper functions ---

function transferFromBank(game, playerIdx, amount) {
  game.state.players[playerIdx].coins += amount;
  return { log: `prend ${amount} pièce(s) de la Banque` };
}

function stealCoin(game, fromIdx, targetIdx, amount) {
  const target = game.state.players[targetIdx];
  const actual = Math.min(amount, target.coins);
  target.coins -= actual;
  game.state.players[fromIdx].coins += actual;
}

function getLeftNeighbor(game, playerIdx) {
  const players = game.state.players;
  const mySeat = players[playerIdx].seatIndex;
  let bestIdx = -1;
  let bestDist = Infinity;
  for (let i = 0; i < players.length; i++) {
    if (i === playerIdx) continue;
    // Left = previous seat in clockwise order (seat - 1, wrapping)
    let dist = (mySeat - players[i].seatIndex + players.length) % players.length;
    if (dist > 0 && dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function getRightNeighbor(game, playerIdx) {
  const players = game.state.players;
  const mySeat = players[playerIdx].seatIndex;
  let bestIdx = -1;
  let bestDist = Infinity;
  for (let i = 0; i < players.length; i++) {
    if (i === playerIdx) continue;
    // Right = next seat in clockwise order (seat + 1, wrapping)
    let dist = (players[i].seatIndex - mySeat + players.length) % players.length;
    if (dist > 0 && dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function getRichestPlayers(game, excludeIdx) {
  const players = game.state.players;
  let maxCoins = -1;
  for (let i = 0; i < players.length; i++) {
    if (i === excludeIdx) continue;
    if (players[i].coins > maxCoins) maxCoins = players[i].coins;
  }
  const richest = [];
  for (let i = 0; i < players.length; i++) {
    if (i === excludeIdx) continue;
    if (players[i].coins === maxCoins) richest.push(i);
  }
  return richest;
}

function getAllOtherPlayers(game, excludeIdx) {
  return game.state.players
    .map((_, i) => i)
    .filter(i => i !== excludeIdx);
}

export { getLeftNeighbor, getRightNeighbor, getRichestPlayers, getAllOtherPlayers };
