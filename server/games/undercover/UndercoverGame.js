import { generatePair, distribute, IMPOSTOR_TABLE } from "./generator.js";

/**
 * Moteur de jeu Undercover.
 *
 * Phases :
 *   WAITING       : attente des joueurs, hôte peut reroll + start
 *   MEMORIZATION  : chaque joueur voit son perso puis clique "OK"
 *   CLUE_ROUND    : tour par tour, chaque joueur soumet un indice
 *                   (N rounds successifs avec ordre randomisé par round)
 *   VOTE          : vote simultané caché
 *   REVEAL        : reveal vote + carte + verdict
 *   GAME_OVER     : résultats finaux
 */
export class UndercoverGame {
  constructor(playersLimit, difficulty = "medium", rounds = 3) {
    const limit = parseInt(playersLimit);
    if (!IMPOSTOR_TABLE[limit]) {
      throw new Error(`Unsupported player count: ${playersLimit}`);
    }

    this.playersLimit = limit;
    this.difficulty = difficulty;
    this.rounds = rounds;                 // nombre de clue-rounds AVANT le 1er vote
    this.postVoteRounds = 1;              // nombre de clue-rounds entre 2 votes (cycle)

    this.state = {
      phase: "WAITING",
      difficulty,
      rounds,
      currentRound: 0,          // 1-indexed pendant CLUE_ROUND
      roundsThisCycle: rounds,  // combien de clue-rounds avant le prochain vote
      cycleNumber: 0,           // incrémenté à chaque cycle CLUE_ROUND→VOTE
      turnOrder: [],            // indices des joueurs ALIVE pour le round courant
      turnOrderIdx: 0,
      currentPlayerIdx: null,
      players: [],
      pair: null,
      clueLog: [],              // [ [ { playerIdx, clue } ] ] aplati, tous rounds confondus
      votes: {},                // clientId -> targetIdx
      eliminationHistory: [],   // [{ playerIdx, role, character, atCycle }] pour afficher au reveal
      eliminatedPlayerIdx: null,  // le dernier éliminé (pour le reveal instantané)
      winner: null,             // "majority" | "impostors" | null
      lastAction: null,
      log: []
    };

    this.hostClientId = null;
  }

  // ─── Gestion des joueurs ─────────────────────────────────────────────────

  addPlayer(clientId, clientName) {
    if (this.state.players.length >= this.playersLimit) return false;
    if (this.state.phase !== "WAITING") return false;

    const seatIdx = this.state.players.length;
    this.state.players.push({
      clientId,
      clientName,
      seatIdx,
      character: null,
      role: null,
      hasAcknowledged: false,
      alive: true,
      connected: true,
      hasAckReveal: false
    });

    if (this.hostClientId === null) this.hostClientId = clientId;
    return true;
  }

  removePlayer(clientId) {
    const idx = this.state.players.findIndex(p => p.clientId === clientId);
    if (idx === -1) return;
    const player = this.state.players[idx];

    if (this.state.phase === "WAITING") {
      this.state.players.splice(idx, 1);
      this.state.players.forEach((p, i) => { p.seatIdx = i; });
      if (this.hostClientId === clientId) {
        this.hostClientId = this.state.players[0]?.clientId ?? null;
      }
      return;
    }

    // En cours de partie : on marque déconnecté. Le joueur ne vote plus,
    // ne donne plus d'indice. Sa carte sera révélée en REVEAL/GAME_OVER.
    player.connected = false;

    // Si c'était son tour, on passe au suivant (ou on avance la phase)
    if (this.state.phase === "CLUE_ROUND" && this.state.currentPlayerIdx === player.seatIdx) {
      this._advanceClueTurn();
    }

    // Si c'était le seul à ne pas avoir ack/voté, débloquer la phase
    if (this.state.phase === "MEMORIZATION" && this._allAliveAck()) {
      this._startNewRound();
    }
    if (this.state.phase === "VOTE" && this._allAliveVoted()) {
      this._resolveVote();
    }

    // Transférer l'hôte si c'était lui
    if (this.hostClientId === clientId) {
      const newHost = this.state.players.find(p => p.connected);
      this.hostClientId = newHost?.clientId ?? null;
    }
  }

  isHost(clientId) {
    return this.hostClientId === clientId;
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  handleAction(clientId, action) {
    switch (action.type) {
      case "reroll_pair":       return this._handleReroll(clientId);
      case "start_game":        return this._handleStart(clientId);
      case "acknowledge_card":  return this._handleAcknowledge(clientId);
      case "acknowledge_reveal": return this._handleAcknowledge(clientId);
      case "submit_clue":       return this._handleClue(clientId, action.clue);
      case "cast_vote":         return this._handleVote(clientId, action.targetIdx);
      default:                  return { error: "Unknown action" };
    }
  }

  _handleReroll(clientId) {
    if (!this.isHost(clientId)) return { error: "Hôte uniquement" };
    if (this.state.phase !== "WAITING") return { error: "Trop tard pour re-roll" };

    const pair = generatePair({ difficulty: this.difficulty });
    if (!pair) return { error: "Aucune paire trouvée" };

    this.state.pair = { A: pair.A, B: pair.B, similarity: pair.similarity };
    this.state.lastAction = { type: "reroll", ts: Date.now() };
    this._addLog(`L'hôte a re-tiré la paire (${pair.A.name} / ${pair.B.name})`);
    return {};
  }

  _handleStart(clientId) {
    if (!this.isHost(clientId)) return { error: "Hôte uniquement" };
    if (this.state.phase !== "WAITING") return { error: "Partie déjà démarrée" };
    if (this.state.players.length < 3) return { error: "Minimum 3 joueurs" };

    // Générer la paire si pas déjà fait (ou re-utiliser si reroll déjà fait)
    if (!this.state.pair) {
      const pair = generatePair({ difficulty: this.difficulty });
      if (!pair) return { error: "Aucune paire trouvée" };
      this.state.pair = { A: pair.A, B: pair.B, similarity: pair.similarity };
    }

    const { A, B } = this.state.pair;
    const playerCount = this.state.players.length;
    const row = IMPOSTOR_TABLE[playerCount];
    const deck = distribute({ A, B, playerCount });

    // Distribution + assignation des rôles
    this.state.players.forEach((p, i) => {
      p.character = deck[i];
      p.role = deck[i].id === A.id ? "majority" : "impostor";
    });

    this.state.phase = "MEMORIZATION";
    this.state.lastAction = { type: "deal", ts: Date.now() };
    this._addLog(`Partie lancée avec ${playerCount} joueurs (${row.majority} majorité, ${row.impostors} imposteur${row.impostors > 1 ? 's' : ''})`);

    // Préparer les clueLog vides
    this.state.clueLog = [];

    return { privateMessages: this._buildDealMessages() };
  }

  _buildDealMessages() {
    // Chaque joueur reçoit son personnage en message privé
    return this.state.players.map(p => ({
      clientId: p.clientId,
      data: { type: "card_reveal", character: p.character, role: p.role }
    }));
  }

  _handleAcknowledge(clientId) {
    // En MEMORIZATION : valider la lecture de sa carte
    if (this.state.phase === "MEMORIZATION") {
      const player = this._getPlayer(clientId);
      if (!player) return { error: "Joueur non trouvé" };
      player.hasAcknowledged = true;
      if (this._allAliveAck()) this._startNewRound();
      return {};
    }
    // En REVEAL : valider la lecture du résultat pour enchaîner
    if (this.state.phase === "REVEAL") {
      const player = this._getPlayer(clientId);
      if (!player) return { error: "Joueur non trouvé" };
      player.hasAckReveal = true;
      if (this._allAliveAckReveal()) {
        if (this.state.winner) {
          this.state.phase = "GAME_OVER";
          this._addLog(`Partie terminée : ${this.state.winner === "majority" ? "les civils gagnent" : "les imposteurs gagnent"}`);
        } else {
          // Reset ack reveal + lancer un nouveau cycle
          this.state.players.forEach(p => { p.hasAckReveal = false; });
          this.state.roundsThisCycle = this.postVoteRounds;
          this.state.currentRound = 0;
          this._startNewRound();
        }
      }
      return {};
    }
    return { error: "Ack pas autorisé dans cette phase" };
  }

  _allAliveAck() {
    return this.state.players.every(p => !p.alive || !p.connected || p.hasAcknowledged);
  }

  _allAliveAckReveal() {
    return this.state.players.every(p => !p.alive || !p.connected || p.hasAckReveal);
  }

  _allAliveVoted() {
    return this.state.players.every(p => !p.alive || !p.connected || this.state.votes[p.clientId] !== undefined);
  }

  _handleClue(clientId, clue) {
    if (this.state.phase !== "CLUE_ROUND") return { error: "Pas en phase d'indice" };
    const player = this._getPlayer(clientId);
    if (!player) return { error: "Joueur non trouvé" };
    if (!player.alive || !player.connected) return { error: "Vous ne pouvez plus jouer" };
    if (player.seatIdx !== this.state.currentPlayerIdx) return { error: "Pas votre tour" };

    const trimmed = (clue || "").trim();
    if (trimmed.length === 0) return { error: "Indice vide" };
    if (trimmed.length > 40) return { error: "Indice trop long (max 40)" };

    // clueLog est un array aplati par round (pas de structure imbriquée par cycle
    // pour rester compatible avec le UI existant)
    const logIdx = this.state.clueLog.length - 1;
    this.state.clueLog[logIdx].push({ playerIdx: player.seatIdx, clue: trimmed, ts: Date.now() });

    this.state.lastAction = { type: "clue", playerIdx: player.seatIdx, clue: trimmed, ts: Date.now() };
    this._addLog(`R${this.state.currentRound} — ${player.clientName} : « ${trimmed} »`);

    this._advanceClueTurn();
    return {};
  }

  _advanceClueTurn() {
    // Avance au prochain joueur dans turnOrder (skippe disconnected/!alive)
    while (true) {
      this.state.turnOrderIdx++;
      if (this.state.turnOrderIdx >= this.state.turnOrder.length) break;
      const nextIdx = this.state.turnOrder[this.state.turnOrderIdx];
      const nextPlayer = this.state.players[nextIdx];
      if (nextPlayer.alive && nextPlayer.connected) {
        this.state.currentPlayerIdx = nextIdx;
        return;
      }
    }
    // Round terminé — nouveau round ou passage en vote
    if (this.state.currentRound < this.state.roundsThisCycle) {
      this._startNewRound();
    } else {
      this._goToVote();
    }
  }

  _handleVote(clientId, targetIdx) {
    if (this.state.phase !== "VOTE") return { error: "Pas en phase de vote" };
    const player = this._getPlayer(clientId);
    if (!player) return { error: "Joueur non trouvé" };
    if (!player.alive || !player.connected) return { error: "Vous ne pouvez plus voter" };
    if (targetIdx < 0 || targetIdx >= this.state.players.length) return { error: "Cible invalide" };
    if (targetIdx === player.seatIdx) return { error: "Vous ne pouvez pas voter pour vous-même" };
    const target = this.state.players[targetIdx];
    if (!target.alive) return { error: "Ce joueur est déjà éliminé" };

    this.state.votes[clientId] = targetIdx;

    if (this._allAliveVoted()) this._resolveVote();
    return {};
  }

  // ─── Flux interne ────────────────────────────────────────────────────────

  _startNewRound() {
    this.state.phase = "CLUE_ROUND";
    this.state.currentRound++;
    this.state.clueLog.push([]);

    // Ordre de parole randomisé PARMI LES JOUEURS VIVANTS ET CONNECTÉS
    const aliveIdx = this.state.players
      .map((p, i) => (p.alive && p.connected ? i : -1))
      .filter(i => i !== -1);
    shuffleInPlace(aliveIdx);
    this.state.turnOrder = aliveIdx;
    this.state.turnOrderIdx = 0;
    this.state.currentPlayerIdx = aliveIdx[0] ?? null;

    const firstName = this.state.players[aliveIdx[0]]?.clientName || "?";
    this._addLog(`Round ${this.state.currentRound}/${this.state.roundsThisCycle} — tour de ${firstName}`);
  }

  _goToVote() {
    this.state.phase = "VOTE";
    this.state.votes = {};
    this.state.currentPlayerIdx = null;
    // Reset turnOrder pour ne pas confondre le UI
    this.state.turnOrder = [];
    this.state.turnOrderIdx = 0;
    this._addLog("Phase de vote : désignez un suspect");
  }

  _resolveVote() {
    // Tally
    const tally = {};
    for (const target of Object.values(this.state.votes)) {
      tally[target] = (tally[target] || 0) + 1;
    }

    // Trouver le max
    let maxCount = 0;
    for (const count of Object.values(tally)) {
      if (count > maxCount) maxCount = count;
    }

    // Tie-break aléatoire parmi les ex-æquo (équitable)
    const tied = Object.entries(tally)
      .filter(([, c]) => c === maxCount)
      .map(([idxStr]) => parseInt(idxStr));
    const eliminatedIdx = tied.length === 1
      ? tied[0]
      : tied[Math.floor(Math.random() * tied.length)];

    this.state.eliminatedPlayerIdx = eliminatedIdx;
    const eliminated = this.state.players[eliminatedIdx];
    eliminated.alive = false;

    this.state.eliminationHistory.push({
      playerIdx: eliminatedIdx,
      clientName: eliminated.clientName,
      role: eliminated.role,
      character: eliminated.character,
      atCycle: this.state.cycleNumber
    });

    // Vérifier les conditions de victoire (règles standard du genre Loup-Garou) :
    //  - Civils gagnent si tous les imposteurs sont éliminés
    //  - Imposteurs gagnent s'ils sont ≥ civils vivants (donc intouchables)
    const alive = this.state.players.filter(p => p.alive);
    const impostorsAlive = alive.filter(p => p.role === "impostor").length;
    const majorityAlive = alive.filter(p => p.role === "majority").length;

    if (impostorsAlive === 0) {
      this.state.winner = "majority";
      this._addLog(`${eliminated.clientName} (${eliminated.character.name}) était le dernier imposteur. Les civils gagnent !`);
    } else if (impostorsAlive >= majorityAlive) {
      this.state.winner = "impostors";
      this._addLog(`${eliminated.clientName} (${eliminated.character.name}) était majorité. Les imposteurs prennent le dessus — ils gagnent !`);
    } else {
      // La partie continue : nouveau cycle après ack du reveal
      this._addLog(`${eliminated.clientName} était ${eliminated.role === "impostor" ? "imposteur" : "civil"} (${eliminated.character.name}). ${impostorsAlive} imposteur(s) restant(s).`);
    }

    this.state.phase = "REVEAL";
    this.state.cycleNumber++;
    this.state.lastAction = { type: "reveal", ts: Date.now() };
  }

  _getPlayer(clientId) {
    return this.state.players.find(p => p.clientId === clientId);
  }

  _addLog(message) {
    this.state.log.push({ round: this.state.currentRound, message, ts: Date.now() });
  }

  // ─── État public / privé ─────────────────────────────────────────────────

  /**
   * État visible par tous : ne révèle PAS les personnages ni les rôles
   * (sauf en REVEAL/GAME_OVER où on révèle tout).
   */
  getPublicState() {
    const revealPhase = this.state.phase === "REVEAL" || this.state.phase === "GAME_OVER";

    const publicPlayers = this.state.players.map(p => {
      // Un joueur éliminé a son personnage révélé dès l'élimination (via
      // eliminationHistory). Pendant le jeu normal, on ne révèle rien.
      const revealThis = revealPhase || !p.alive;
      return {
        clientId: p.clientId,
        clientName: p.clientName,
        seatIdx: p.seatIdx,
        alive: p.alive,
        connected: p.connected,
        hasAcknowledged: p.hasAcknowledged,
        hasAckReveal: p.hasAckReveal,
        ...(revealThis
          ? { character: p.character, role: p.role }
          : {})
      };
    });

    // La paire (A, B) n'est révélée qu'à partir de REVEAL
    const publicPair = revealPhase ? this.state.pair : null;

    // Les votes individuels sont masqués jusqu'au reveal
    const publicVotes = revealPhase ? this.state.votes : {};

    const aliveVoters = this.state.players.filter(p => p.alive && p.connected).length;

    return {
      phase: this.state.phase,
      difficulty: this.state.difficulty,
      rounds: this.state.rounds,
      roundsThisCycle: this.state.roundsThisCycle,
      currentRound: this.state.currentRound,
      cycleNumber: this.state.cycleNumber,
      currentPlayerIdx: this.state.currentPlayerIdx,
      turnOrder: this.state.turnOrder,
      turnOrderIdx: this.state.turnOrderIdx,
      players: publicPlayers,
      pair: publicPair,
      clueLog: this.state.clueLog,
      votes: publicVotes,
      voteCount: Object.keys(this.state.votes).length,
      aliveVoters,
      eliminatedPlayerIdx: revealPhase ? this.state.eliminatedPlayerIdx : null,
      eliminationHistory: this.state.eliminationHistory,
      winner: this.state.winner,
      hostClientId: this.hostClientId,
      lastAction: this.state.lastAction,
      log: this.state.log
    };
  }

  /**
   * État privé propre au joueur : contient SON personnage et SON rôle.
   */
  getPrivateState(clientId) {
    const player = this._getPlayer(clientId);
    if (!player) return null;
    return {
      playerIdx: player.seatIdx,
      character: player.character,
      role: player.role,
      hasVoted: this.state.votes[clientId] !== undefined,
      myVote: this.state.votes[clientId] ?? null
    };
  }
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
