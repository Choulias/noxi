import { SCENARIOS, MASK_NAMES } from "./mascaradeScenarios.js";
import { MASK_POWERS, getLeftNeighbor, getRightNeighbor, getAllOtherPlayers } from "./mascaradeMasks.js";

export class MascaradeGame {
  constructor(playersLimit, scenarioVariant = "A", hiddenMode = false) {
    this.playersLimit = playersLimit;
    this.scenarioVariant = scenarioVariant;
    this.hiddenMode = hiddenMode;

    const scenarioData = SCENARIOS[playersLimit]?.[scenarioVariant];
    if (!scenarioData) {
      throw new Error(`No scenario for ${playersLimit} players, variant ${scenarioVariant}`);
    }

    this.scenarioMasks = [...scenarioData.masks];
    this.centerCardCount = scenarioData.centerCards;

    this.state = {
      phase: "WAITING",          // WAITING → MEMORIZATION → PREPARATORY → ACTION_SELECT → ...
      turnNumber: 0,
      preparatoryTurnsLeft: 4,
      firstRealTurn: true,       // For hidden mode: no announce on first turn after preparatory
      currentPlayerIndex: 0,
      players: [],
      centerCards: [],
      justiceBoard: 0,
      announcedMask: null,
      announcerIndex: null,
      contestationQueue: [],
      contestants: [],
      powerState: null,
      powerEffect: null,         // Cached power effect for multi-step resolution
      lastAction: null,          // Last action for client animations
      log: [],
      winner: null,
      hiddenMode,
      scenarioVariant,
      scenarioMasks: this.getUniqueMaskNames()
    };
  }

  getUniqueMaskNames() {
    const unique = [...new Set(this.scenarioMasks)];
    return unique;
  }

  addPlayer(clientId, clientName) {
    const seatIndex = this.state.players.length;
    this.state.players.push({
      clientId,
      clientName,
      seatIndex,
      mask: null,
      coins: 6,
      mustLookNextTurn: false,
      cannotAnnounceThisTurn: false
    });
  }

  startGame() {
    // Shuffle masks
    const shuffled = shuffle([...this.scenarioMasks]);

    // Deal to players
    const playerCount = this.state.players.length;
    for (let i = 0; i < playerCount; i++) {
      this.state.players[i].mask = shuffled[i];
    }

    // Remaining cards go to center (4-5 player games)
    this.state.centerCards = shuffled.slice(playerCount);

    this.state.lastAction = { type: "deal", ts: Date.now() };

    if (this.hiddenMode) {
      // Hidden mode: skip memorization, go straight to preparatory
      this.state.phase = "PREPARATORY";
      this.state.currentPlayerIndex = 0;
      this.addLog("Mode caché : les masques sont distribués face cachée. Phase préparatoire !");
    } else {
      this.state.phase = "MEMORIZATION";
      this.addLog("Les masques sont distribués face visible. Mémorisez-les !");
    }
  }

  startPlaying() {
    if (this.state.phase !== "MEMORIZATION") return;
    this.state.phase = "PREPARATORY";
    this.state.currentPlayerIndex = 0;
    this.addLog("Les masques sont retournés face cachée. Phase préparatoire !");
  }

  handleAction(clientId, action) {
    const playerIdx = this.state.players.findIndex(p => p.clientId === clientId);
    if (playerIdx === -1) return { privateMessages: [] };

    const result = { privateMessages: [] };

    switch (action.type) {
      case "start_game":
        this.startPlaying();
        break;

      case "preparatory_swap":
        this._handlePreparatorySwap(playerIdx, action, result);
        break;

      case "preparatory_look":
        this._handlePreparatoryLook(playerIdx, result);
        break;

      case "look":
        this._handleLook(playerIdx, result);
        break;

      case "swap":
        this._handleSwap(playerIdx, action, result);
        break;

      case "announce":
        this._handleAnnounce(playerIdx, action, result);
        break;

      case "contest_response":
        this._handleContestResponse(playerIdx, action, result);
        break;

      case "power_target":
        this._handlePowerTarget(playerIdx, action, result);
        break;

      case "power_targets":
        this._handlePowerTargets(playerIdx, action, result);
        break;

      case "gourou_guess":
        this._handleGourouGuess(playerIdx, action, result);
        break;

      case "espionne_decision":
        this._handleEspionneDecision(playerIdx, action, result);
        break;

      case "fou_swap":
        this._handleFouSwap(playerIdx, action, result);
        break;

      case "swap_center":
        this._handleSwapCenter(playerIdx, action, result);
        break;

      case "look_acknowledge":
        this._handleLookAcknowledge(playerIdx, result);
        break;

      default:
        break;
    }

    return result;
  }

  // --- Phase handlers ---

  _handlePreparatorySwap(playerIdx, action, result) {
    if (this.state.phase !== "PREPARATORY") return;
    if (playerIdx !== this.state.currentPlayerIndex) return;

    const { targetIndex, didSwap, isCenter } = action;

    if (isCenter && this.state.centerCards.length > 0) {
      // Swap with center card
      const centerIdx = targetIndex;
      if (didSwap && centerIdx >= 0 && centerIdx < this.state.centerCards.length) {
        const temp = this.state.players[playerIdx].mask;
        this.state.players[playerIdx].mask = this.state.centerCards[centerIdx];
        this.state.centerCards[centerIdx] = temp;
      }
      this.state.lastAction = { type: "swap", from: playerIdx, toCenter: centerIdx, ts: Date.now() };
      this.addLog(`${this.state.players[playerIdx].clientName} manipule sa carte et la carte #${centerIdx + 1} du centre`);
    } else {
      // Swap with another player
      if (didSwap && targetIndex >= 0 && targetIndex < this.state.players.length && targetIndex !== playerIdx) {
        const temp = this.state.players[playerIdx].mask;
        this.state.players[playerIdx].mask = this.state.players[targetIndex].mask;
        this.state.players[targetIndex].mask = temp;
      }
      const targetName = this.state.players[targetIndex]?.clientName || "?";
      this.state.lastAction = { type: "swap", from: playerIdx, to: targetIndex, ts: Date.now() };
      this.addLog(`${this.state.players[playerIdx].clientName} manipule sa carte et celle de ${targetName}`);
    }

    this._advancePreparatory();
  }

  _handlePreparatoryLook(playerIdx, result) {
    if (this.state.phase !== "PREPARATORY") return;
    if (playerIdx !== this.state.currentPlayerIndex) return;
    if (!this.hiddenMode) return; // Only available in hidden mode

    const player = this.state.players[playerIdx];
    result.privateMessages.push({
      clientId: player.clientId,
      data: { type: "look_result", mask: player.mask }
    });
    this.addLog(`${player.clientName} regarde secrètement son masque`);

    this._advancePreparatory();
  }

  _advancePreparatory() {
    this.state.preparatoryTurnsLeft--;

    if (this.state.preparatoryTurnsLeft <= 0) {
      this.state.phase = "ACTION_SELECT";
      this.state.currentPlayerIndex = 0;
      this.state.firstRealTurn = this.hiddenMode; // Block announce on first turn in hidden mode
      this.addLog("Phase préparatoire terminée. La partie commence !");
    } else {
      this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    }
  }

  _handleLook(playerIdx, result) {
    if (this.state.phase !== "ACTION_SELECT") return;
    if (playerIdx !== this.state.currentPlayerIndex) return;

    const player = this.state.players[playerIdx];

    // Send the player their mask privately
    result.privateMessages.push({
      clientId: player.clientId,
      data: { type: "look_result", mask: player.mask }
    });

    this.state.lastAction = { type: "look", player: playerIdx, ts: Date.now() };
    this.addLog(`${player.clientName} regarde secrètement son masque`);
    player.mustLookNextTurn = false;
    player.cannotAnnounceThisTurn = false;

    // Pause the game until the player acknowledges
    this.state.phase = "LOOK_ACKNOWLEDGE";
    this.state.lookAckPlayerIdx = playerIdx;
  }

  _handleLookAcknowledge(playerIdx, result) {
    if (this.state.phase !== "LOOK_ACKNOWLEDGE") return;
    if (playerIdx !== this.state.lookAckPlayerIdx) return;

    this.state.lookAckPlayerIdx = null;
    this.advanceTurn();
  }

  _handleSwap(playerIdx, action, result) {
    if (this.state.phase !== "ACTION_SELECT") return;
    if (playerIdx !== this.state.currentPlayerIndex) return;
    if (this.state.players[playerIdx].mustLookNextTurn) return; // Must look instead

    const { targetIndex, didSwap, isCenter } = action;
    const player = this.state.players[playerIdx];

    if (isCenter && this.state.centerCards.length > 0) {
      const centerIdx = targetIndex;
      if (didSwap && centerIdx >= 0 && centerIdx < this.state.centerCards.length) {
        const temp = player.mask;
        player.mask = this.state.centerCards[centerIdx];
        this.state.centerCards[centerIdx] = temp;
      }
      this.state.lastAction = { type: "swap", from: playerIdx, toCenter: centerIdx, ts: Date.now() };
      this.addLog(`${player.clientName} manipule sa carte et la carte #${centerIdx + 1} du centre`);
    } else {
      if (didSwap && targetIndex >= 0 && targetIndex < this.state.players.length && targetIndex !== playerIdx) {
        const temp = player.mask;
        player.mask = this.state.players[targetIndex].mask;
        this.state.players[targetIndex].mask = temp;
      }
      const targetName = this.state.players[targetIndex]?.clientName || "?";
      this.state.lastAction = { type: "swap", from: playerIdx, to: targetIndex, ts: Date.now() };
      this.addLog(`${player.clientName} manipule sa carte et celle de ${targetName}`);
    }

    player.mustLookNextTurn = false;
    player.cannotAnnounceThisTurn = false;
    this.advanceTurn();
  }

  _handleAnnounce(playerIdx, action, result) {
    if (this.state.phase !== "ACTION_SELECT") return;
    if (playerIdx !== this.state.currentPlayerIndex) return;
    if (this.state.firstRealTurn) return; // Hidden mode: no announce on first turn

    const player = this.state.players[playerIdx];
    if (player.mustLookNextTurn) return;
    if (player.cannotAnnounceThisTurn) return;

    const { maskName } = action;
    this.state.announcedMask = maskName;
    this.state.announcerIndex = playerIdx;
    this.state.contestants = [];
    this.state.phase = "CONTESTATION";

    // Build contestation queue: all players except announcer, clockwise by seatIndex
    const announcerSeat = this.state.players[playerIdx].seatIndex;
    const playerCount = this.state.players.length;
    const others = this.state.players
      .map((p, i) => ({ idx: i, seatIndex: p.seatIndex }))
      .filter(p => p.idx !== playerIdx);
    // Sort clockwise from announcer's left (next seat)
    others.sort((a, b) => {
      const distA = (a.seatIndex - announcerSeat - 1 + playerCount) % playerCount;
      const distB = (b.seatIndex - announcerSeat - 1 + playerCount) % playerCount;
      return distA - distB;
    });
    this.state.contestationQueue = others.map(p => p.idx);

    const maskDisplay = MASK_NAMES[maskName] || maskName;
    this.state.lastAction = { type: "announce", player: playerIdx, mask: maskName, ts: Date.now() };
    this.addLog(`${player.clientName} annonce : "${maskDisplay}" !`);
  }

  _handleContestResponse(playerIdx, action, result) {
    if (this.state.phase !== "CONTESTATION") return;

    // Check this player is in the queue (simultaneous contestation)
    if (this.state.contestationQueue.length === 0) return;
    const queueIdx = this.state.contestationQueue.indexOf(playerIdx);
    if (queueIdx === -1) return;

    this.state.contestationQueue.splice(queueIdx, 1);
    const player = this.state.players[playerIdx];

    if (action.doContest) {
      this.state.contestants.push(playerIdx);
      this.addLog(`${player.clientName} conteste !`);
    } else {
      this.addLog(`${player.clientName} passe`);
    }

    // Check if all have responded
    if (this.state.contestationQueue.length === 0) {
      this._resolveContestation(result);
    }
  }

  _resolveContestation(result) {
    const { announcedMask, announcerIndex, contestants } = this.state;

    if (contestants.length === 0) {
      // No contestation — power activates, no card reveal
      this.addLog(`Personne ne conteste. Le pouvoir s'active !`);
      this._activatePower(announcedMask, announcerIndex, result, false);
    } else {
      // Contestation — reveal all involved
      const involved = [announcerIndex, ...contestants];

      // Find who actually has the mask
      const trueOwners = [];  // May have multiple (Paysan×2)
      const paysanOwners = [];

      for (const idx of involved) {
        const playerMask = this.state.players[idx].mask;
        if (playerMask === announcedMask) {
          trueOwners.push(idx);
        }
        if (playerMask === "paysan" && announcedMask === "paysan") {
          paysanOwners.push(idx);
        }
      }

      const trueOwnerIdx = trueOwners.length > 0 ? trueOwners[0] : null;

      // Build reveal data for all players
      const reveals = involved.map(idx => ({
        playerIndex: idx,
        mask: this.state.players[idx].mask
      }));

      // Send reveals to everyone
      this.state.players.forEach(p => {
        result.privateMessages.push({
          clientId: p.clientId,
          data: { type: "contestation_reveal", reveals, trueOwnerIdx, announcedMask }
        });
      });

      // Penalties: liars pay 1 coin to justice (skip ALL true owners)
      if (trueOwners.length > 0) {
        const penaltyPlayers = [];
        for (const idx of involved) {
          if (!trueOwners.includes(idx)) {
            const penalty = Math.min(1, this.state.players[idx].coins);
            this.state.players[idx].coins -= penalty;
            this.state.justiceBoard += penalty;
            if (penalty > 0) penaltyPlayers.push(idx);
            this.addLog(`${this.state.players[idx].clientName} paie 1 pièce d'amende`);
          }
        }
        if (penaltyPlayers.length > 0) {
          this.state.lastAction = { type: "coins_to_justice", players: penaltyPlayers, amount: 1, ts: Date.now() };
        }

        // Special: Paysan×2 — both get 2 coins each
        const bothPaysans = announcedMask === "paysan" && paysanOwners.length >= 2;
        if (bothPaysans) {
          for (const idx of paysanOwners) {
            this.state.players[idx].coins += 2;
            this.addLog(`${this.state.players[idx].clientName} est Paysan et prend 2 pièces !`);
          }
          // Mark revealed players, finish (no single power activation for paysan×2)
          for (const idx of involved) {
            if (this.state.players[idx]) {
              this.state.players[idx].cannotAnnounceThisTurn = true;
            }
          }
          this.state.powerState = null;
          this.state.powerEffect = null;
          this.state.announcedMask = null;
          this.state.announcerIndex = null;
          this.state.contestants = [];
          if (this.checkWinCondition()) return;
          this.advanceTurn();
        } else {
          this._activatePower(announcedMask, trueOwnerIdx, result, true, false);
        }
      } else {
        // Nobody has the mask — all involved pay 1
        const penaltyAll = [];
        for (const idx of involved) {
          const penalty = Math.min(1, this.state.players[idx].coins);
          this.state.players[idx].coins -= penalty;
          this.state.justiceBoard += penalty;
          if (penalty > 0) penaltyAll.push(idx);
          this.addLog(`${this.state.players[idx].clientName} paie 1 pièce d'amende (personne n'a le masque)`);
        }
        if (penaltyAll.length > 0) {
          this.state.lastAction = { type: "coins_to_justice", players: penaltyAll, amount: 1, ts: Date.now() };
        }

        // Mark revealed players
        for (const idx of involved) {
          this.state.players[idx].cannotAnnounceThisTurn = true;
        }

        // Check win after penalties
        if (this.checkWinCondition()) return;
        this.advanceTurn();
      }
    }
  }

  _activatePower(maskName, executorIdx, result, wasContested, bothPaysansRevealed = false) {
    const playerName = this.state.players[executorIdx].clientName;
    const maskDisplay = MASK_NAMES[maskName] || maskName;
    this.addLog(`${playerName} active le pouvoir de ${maskDisplay}`);

    // Get power function
    const powerFn = MASK_POWERS[maskName];
    if (!powerFn) {
      this.addLog(`Pouvoir inconnu: ${maskName}`);
      this.advanceTurn();
      return;
    }

    // Create a game proxy for the power function
    const gameProxy = { state: this.state };
    let effect;
    if (maskName === "paysan") {
      effect = powerFn(gameProxy, executorIdx, bothPaysansRevealed);
    } else {
      effect = powerFn(gameProxy, executorIdx);
    }

    if (effect.immediate) {
      const execResult = effect.execute();
      if (execResult?.log) this.addLog(`${playerName} ${execResult.log}`);
      if (wasContested) {
        // Mark revealed players as cannot announce next turn
        const involved = [this.state.announcerIndex, ...this.state.contestants];
        for (const idx of involved) {
          this.state.players[idx].cannotAnnounceThisTurn = true;
        }
      }
      if (this.checkWinCondition()) return;
      this.advanceTurn();
    } else if (effect.needsTarget) {
      // Need target selection
      this.state.phase = "POWER_TARGET";
      this.state.powerState = {
        type: effect.subPhase || "target",
        executorIdx,
        validTargets: effect.validTargets,
        data: {}
      };
      this.state.powerEffect = effect;
    } else if (effect.needsTargets === 2) {
      // Need 2 targets
      this.state.phase = "POWER_TARGET_2";
      this.state.powerState = {
        type: effect.subPhase || "targets_2",
        executorIdx,
        validTargets: effect.validTargets,
        selectedTargets: [],
        data: {}
      };
      this.state.powerEffect = effect;
    }
  }

  _handlePowerTarget(playerIdx, action, result) {
    if (this.state.phase !== "POWER_TARGET") return;
    if (!this.state.powerState) return;
    if (playerIdx !== this.state.powerState.executorIdx) return;

    const { targetIndex } = action;
    const effect = this.state.powerEffect;

    if (!effect?.validTargets?.includes(targetIndex)) return;

    if (effect.subPhase === "GOUROU_GUESS") {
      // Store target, transition to guess phase
      const targetResult = effect.onTarget(targetIndex);
      if (targetResult?.log) this.addLog(targetResult.log);
      if (targetResult?.privateMessages) {
        result.privateMessages.push(...targetResult.privateMessages);
      }
      this.state.phase = "GOUROU_GUESS";
      // powerState already set by onTarget
    } else if (effect.subPhase === "ESPIONNE_LOOK") {
      const targetResult = effect.onTarget(targetIndex);
      if (targetResult?.log) this.addLog(targetResult.log);
      if (targetResult?.privateMessages) {
        result.privateMessages.push(...targetResult.privateMessages);
      }
      this.state.phase = "ESPIONNE_DECISION";
    } else if (effect.subPhase === "PRINCESSE_REVEAL") {
      const targetResult = effect.onTarget(targetIndex);
      if (targetResult?.log) this.addLog(targetResult.log);
      if (targetResult?.privateMessages) {
        result.privateMessages.push(...targetResult.privateMessages);
      }
      this._finishPower();
    } else {
      // Simple target (escroc, sorciere)
      const targetResult = effect.onTarget(targetIndex);
      if (targetResult?.log) {
        this.addLog(`${this.state.players[playerIdx].clientName} ${targetResult.log}`);
      }
      if (targetResult?.privateMessages) {
        result.privateMessages.push(...targetResult.privateMessages);
      }
      this._finishPower();
    }
  }

  _handlePowerTargets(playerIdx, action, result) {
    if (this.state.phase !== "POWER_TARGET_2") return;
    if (!this.state.powerState) return;
    if (playerIdx !== this.state.powerState.executorIdx) return;

    const { targetIndex } = action;
    const ps = this.state.powerState;

    if (!ps.validTargets?.includes(targetIndex)) return;
    if (ps.selectedTargets.includes(targetIndex)) return;

    ps.selectedTargets.push(targetIndex);

    if (ps.selectedTargets.length < 2) {
      // Wait for second target
      return;
    }

    // Both targets selected — for marionnettiste, execute immediately
    // For fou, transition to swap decision
    if (ps.type === "FOU_SWAP") {
      this.state.phase = "FOU_SWAP_DECISION";
    } else {
      // Marionnettiste — execute
      const effect = this.state.powerEffect;
      const targetResult = effect.onTargets(ps.selectedTargets[0], ps.selectedTargets[1]);
      if (targetResult?.log) {
        this.addLog(`${this.state.players[playerIdx].clientName} ${targetResult.log}`);
      }
      this._finishPower();
    }
  }

  _handleGourouGuess(playerIdx, action, result) {
    if (this.state.phase !== "GOUROU_GUESS") return;
    if (!this.state.powerState || this.state.powerState.type !== "gourou_guess") return;
    if (playerIdx !== this.state.powerState.targetIdx) return;

    const effect = this.state.powerEffect;
    const guessResult = effect.onGuess(playerIdx, action.guessedMask);

    if (guessResult?.log) this.addLog(guessResult.log);

    // Send reveal to all
    if (guessResult?.reveal) {
      this.state.players.forEach(p => {
        result.privateMessages.push({
          clientId: p.clientId,
          data: { type: "gourou_reveal", ...guessResult.reveal }
        });
      });
    }

    this._finishPower();
  }

  _handleEspionneDecision(playerIdx, action, result) {
    if (this.state.phase !== "ESPIONNE_DECISION") return;
    if (!this.state.powerState || this.state.powerState.type !== "espionne_decision") return;
    if (playerIdx !== this.state.powerState.executorIdx) return;

    const effect = this.state.powerEffect;
    const decResult = effect.onDecision(action.doSwap);
    if (decResult?.log) this.addLog(`${this.state.players[playerIdx].clientName} ${decResult.log}`);

    this._finishPower();
  }

  _handleFouSwap(playerIdx, action, result) {
    if (this.state.phase !== "FOU_SWAP_DECISION") return;
    if (!this.state.powerState) return;
    if (playerIdx !== this.state.powerState.executorIdx) return;

    const ps = this.state.powerState;
    const effect = this.state.powerEffect;
    const targetResult = effect.onTargets(ps.selectedTargets[0], ps.selectedTargets[1], action.didSwap);
    if (targetResult?.log) {
      this.addLog(`${this.state.players[playerIdx].clientName} ${targetResult.log}`);
    }
    this.state.lastAction = { type: "swap", from: ps.selectedTargets[0], to: ps.selectedTargets[1], ts: Date.now() };

    this._finishPower();
  }

  _handleSwapCenter(playerIdx, action, result) {
    // Handle swap with center card during ACTION_SELECT (4-5 player games)
    if (this.state.phase !== "ACTION_SELECT") return;
    if (playerIdx !== this.state.currentPlayerIndex) return;
    if (this.state.centerCards.length === 0) return;

    const { centerIndex, didSwap } = action;
    const player = this.state.players[playerIdx];

    if (didSwap && centerIndex >= 0 && centerIndex < this.state.centerCards.length) {
      const temp = player.mask;
      player.mask = this.state.centerCards[centerIndex];
      this.state.centerCards[centerIndex] = temp;
    }

    this.state.lastAction = { type: "swap", from: playerIdx, toCenter: centerIndex, ts: Date.now() };
    this.addLog(`${player.clientName} manipule sa carte et la carte #${centerIndex + 1} du centre`);
    player.mustLookNextTurn = false;
    player.cannotAnnounceThisTurn = false;
    this.advanceTurn();
  }

  _finishPower() {
    // Clean up power state; only restrict announce if there was a real contestation (cards were revealed)
    if (this.state.contestants.length > 0) {
      const involved = [this.state.announcerIndex, ...this.state.contestants];
      for (const idx of involved) {
        if (this.state.players[idx]) {
          this.state.players[idx].cannotAnnounceThisTurn = true;
        }
      }
    }

    this.state.powerState = null;
    this.state.powerEffect = null;
    this.state.announcedMask = null;
    this.state.announcerIndex = null;
    this.state.contestants = [];

    if (this.checkWinCondition()) return;
    this.advanceTurn();
  }

  // --- Utilities ---

  advanceTurn() {
    // NOTE: cannotAnnounceThisTurn is NOT reset here.
    // It gets reset when the affected player actually takes their turn
    // (Look and Swap handlers reset it). This ensures the restriction
    // persists through exactly one of the player's own turns.
    this.state.turnNumber++;
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    this.state.phase = "ACTION_SELECT";
    // After first full round in hidden mode, allow announces
    if (this.state.firstRealTurn && this.state.currentPlayerIndex === 0) {
      this.state.firstRealTurn = false;
    }
  }

  checkWinCondition() {
    // Tricheur (and potentially others) may have already set GAME_OVER directly
    if (this.state.phase === "GAME_OVER") return true;

    // Check 13+ coins first (takes priority over 0 coins)
    for (let i = 0; i < this.state.players.length; i++) {
      const p = this.state.players[i];
      if (p.coins >= 13) {
        this.state.phase = "GAME_OVER";
        this.state.winner = i;
        this.addLog(`${p.clientName} atteint ${p.coins} pièces et gagne !`);
        return true;
      }
    }

    // Then check 0 coins (elimination — richest wins)
    for (let i = 0; i < this.state.players.length; i++) {
      const p = this.state.players[i];
      if (p.coins <= 0) {
        let maxCoins = -1;
        let winners = [];
        for (const player of this.state.players) {
          if (player.coins > maxCoins) {
            maxCoins = player.coins;
            winners = [player];
          } else if (player.coins === maxCoins) {
            winners.push(player);
          }
        }
        this.state.phase = "GAME_OVER";
        this.state.winner = this.state.players.indexOf(winners[0]);
        const winnerNames = winners.map(w => w.clientName).join(", ");
        this.addLog(`${p.clientName} perd sa dernière pièce ! ${winnerNames} gagne avec ${maxCoins} pièces !`);
        return true;
      }
    }
    return false;
  }

  addLog(message) {
    this.state.log.push({
      message,
      timestamp: Date.now(),
      turn: this.state.turnNumber
    });
    // Keep last 100 entries
    if (this.state.log.length > 100) {
      this.state.log = this.state.log.slice(-100);
    }
  }

  getPublicState() {
    return {
      phase: this.state.phase,
      turnNumber: this.state.turnNumber,
      preparatoryTurnsLeft: this.state.preparatoryTurnsLeft,
      currentPlayerIndex: this.state.currentPlayerIndex,
      players: this.state.players.map(p => ({
        clientId: p.clientId,
        clientName: p.clientName,
        seatIndex: p.seatIndex,
        coins: p.coins,
        mustLookNextTurn: p.mustLookNextTurn,
        cannotAnnounceThisTurn: p.cannotAnnounceThisTurn,
        // Reveal masks during memorization and game over
        mask: (this.state.phase === "MEMORIZATION" || this.state.phase === "GAME_OVER") ? p.mask : undefined
      })),
      // During memorization, reveal all masks (legacy field)
      revealedMasks: this.state.phase === "MEMORIZATION"
        ? this.state.players.map(p => p.mask)
        : null,
      centerCards: (this.state.phase === "MEMORIZATION" || this.state.phase === "GAME_OVER")
        ? this.state.centerCards
        : this.state.centerCards.map(() => "hidden"),
      centerCardCount: this.state.centerCards.length,
      justiceBoard: this.state.justiceBoard,
      announcedMask: this.state.announcedMask,
      announcerIndex: this.state.announcerIndex,
      contestationQueue: this.state.contestationQueue,
      contestants: this.state.contestants,
      powerState: this.state.powerState ? {
        type: this.state.powerState.type,
        executorIdx: this.state.powerState.executorIdx,
        validTargets: this.state.powerState.validTargets,
        selectedTargets: this.state.powerState.selectedTargets,
        targetIdx: this.state.powerState.targetIdx
      } : null,
      lastAction: this.state.lastAction,
      log: this.state.log,
      winner: this.state.winner,
      scenarioVariant: this.state.scenarioVariant,
      scenarioMasks: this.state.scenarioMasks,
      hiddenMode: this.state.hiddenMode,
      firstRealTurn: this.state.firstRealTurn,
      lookAckPlayerIdx: this.state.lookAckPlayerIdx ?? null
    };
  }

  getPrivateState(clientId) {
    const playerIdx = this.state.players.findIndex(p => p.clientId === clientId);
    if (playerIdx === -1) return {};

    return {
      playerIndex: playerIdx
    };
  }
}

// Fisher-Yates shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
