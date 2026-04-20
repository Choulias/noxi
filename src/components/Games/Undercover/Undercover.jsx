import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { createPortal } from "react-dom";
import { Dialog, Transition } from "@headlessui/react";
import { useUser } from "../../Auth/useUser.jsx";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api";
import { useChat } from "../../Chat/ChatContext";

const DIFFICULTY_LABELS = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
  hardcore: "Hardcore"
};

export default function Undercover() {
  const user = useUser();
  const { joinGame: chatJoinGame, leaveGame: chatLeaveGame, addGameMessage } = useChat();
  const { id, reach, numberplayers, difficulty } = useParams();
  const navigate = useNavigate();
  const cancelJoinButtonRef = useRef(null);
  const existingNamesRef = useRef([]);

  // Dialog d'entrée de pseudo
  const [joinOpen, setJoinOpen] = useState(false);
  const [clientName, setClientName] = useState(user ? user.username : "Utilisateur");
  const [nameError, setNameError] = useState("");

  // Game state
  const [gameState, setGameState] = useState(null);
  const [privateState, setPrivateState] = useState(null);
  const [gameClients, setGameClients] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [cardRevealData, setCardRevealData] = useState(null); // { character, role } du DEAL
  const [clueDraft, setClueDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Refs
  const clientIdRef = useRef(null);
  const playerIdRef = useRef(user ? user.id : null);
  const gameIdRef = useRef(id || null);
  const wsRef = useRef(null);
  const gameDbIdRef = useRef(null);
  const playersLimitRef = useRef(parseInt(numberplayers) || 5);
  const difficultyRef = useRef(difficulty || "medium");
  const hasRecordedStatsRef = useRef(false);
  const hasJoinedChatRef = useRef(false);

  // ─── WebSocket connection ────────────────────────────────────────────────
  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:9090");
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      switch (data.method) {
        case "connect":
          clientIdRef.current = data.clientId;
          if (!gameIdRef.current) {
            createGame();
          } else if (gameIdRef.current && !gameIdRef.current.includes("/")) {
            if (!user) {
              wsRef.current?.send(JSON.stringify({ method: "game_info", clientId: data.clientId, gameId: gameIdRef.current }));
            } else {
              joinGame(clientName);
            }
          }
          break;

        case "game_info": {
          const existing = (data.clients || []).map(c => c.clientName?.toLowerCase()).filter(Boolean);
          existingNamesRef.current = existing;
          let defaultName = "Utilisateur";
          if (existing.includes(defaultName.toLowerCase())) {
            let i = 1;
            while (existing.includes(`${defaultName} ${i}`.toLowerCase())) i++;
            defaultName = `${defaultName} ${i}`;
          }
          setClientName(defaultName);
          setNameError("");
          setJoinOpen(true);
          break;
        }

        case "create":
          gameIdRef.current = data.game.id;
          saveGame(data.game).then(() => {
            if (!user) {
              wsRef.current?.send(JSON.stringify({ method: "game_info", clientId: clientIdRef.current, gameId: gameIdRef.current }));
            } else {
              joinGame(clientName);
            }
          });
          break;

        case "join":
        case "update":
          handleUpdate(data.game);
          break;

        case "private":
          handlePrivateMessage(data.data);
          break;

        case "quit":
          handleQuit(data);
          break;

        case "chat_game":
          addGameMessage(data.message);
          break;

        case "error":
          setErrorMsg(data.message || "Erreur");
          setTimeout(() => setErrorMsg(""), 3000);
          // Si l'erreur concerne le pseudo, rouvrir le dialog
          if (data.message?.includes("pseudo")) {
            setNameError(data.message);
            setJoinOpen(true);
          }
          break;
      }
    };

    return () => {
      chatLeaveGame();
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Actions WebSocket ───────────────────────────────────────────────────

  const createGame = useCallback(() => {
    wsRef.current?.send(JSON.stringify({
      method: "create",
      clientId: clientIdRef.current,
      playerId: playerIdRef.current,
      gameModel: "undercover",
      playersLimit: playersLimitRef.current,
      difficulty: difficultyRef.current
    }));
  }, []);

  const joinGame = useCallback((name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    if (existingNamesRef.current.includes(trimmed.toLowerCase())) {
      setNameError("Ce pseudo est déjà utilisé dans cette partie");
      return;
    }
    setNameError("");
    setJoinOpen(false);
    wsRef.current?.send(JSON.stringify({
      method: "join",
      clientId: clientIdRef.current,
      playerId: playerIdRef.current,
      clientName: trimmed,
      gameId: gameIdRef.current
    }));
  }, []);

  const sendAction = useCallback((action) => {
    wsRef.current?.send(JSON.stringify({
      method: "undercover_action",
      clientId: clientIdRef.current,
      gameId: gameIdRef.current,
      action
    }));
  }, []);

  const quitGame = useCallback(() => {
    wsRef.current?.send(JSON.stringify({
      method: "quit",
      clientId: clientIdRef.current,
      playerId: playerIdRef.current,
      clientName: clientName,
      gameId: gameIdRef.current
    }));
    navigate("/games");
  }, [clientName, navigate]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleUpdate = (game) => {
    setGameClients(game.clients || []);
    if (game.playersLimit) playersLimitRef.current = game.playersLimit;
    if (game.state) setGameState(game.state);
    if (game.privateState) setPrivateState(game.privateState);

    // Premier update après join : enregistrer le chat et le joueur.
    // On utilise une ref (pas le state) pour éviter le stale closure.
    if (!hasJoinedChatRef.current && game.clients?.length > 0) {
      hasJoinedChatRef.current = true;
      if (playerIdRef.current) savePlayer();
      chatJoinGame(gameIdRef.current, wsRef, clientIdRef.current);
    }

    // Stats : uniquement quand la partie est vraiment finie (winner défini).
    // Les REVEAL intermédiaires (multi-imposteur) ont winner=null et ne déclenchent rien.
    const isFinal = game.state?.winner && !hasRecordedStatsRef.current;
    if (isFinal) {
      hasRecordedStatsRef.current = true;
      endGame(game.state);
    }
  };

  const handlePrivateMessage = (data) => {
    if (data.type === "card_reveal") {
      setCardRevealData({ character: data.character, role: data.role });
    }
  };

  const handleQuit = (data) => {
    if (data.game) setGameClients(data.game.clients || []);
    if (data.clientId === clientIdRef.current) navigate("/games");
  };

  // ─── REST API ────────────────────────────────────────────────────────────

  const saveGame = async (game) => {
    if (!user) return;
    try {
      const res = await api.post("/games", {
        gameId: game.id,
        ownerId: playerIdRef.current,
        numberPlayers: 1,
        maxPlayers: game.playersLimit,
        status: "pending",
        gameModel: "undercover",
        reach: reach || "public",
        gameMode: difficultyRef.current
      });
      gameDbIdRef.current = res.data.id;
    } catch (e) {
      console.error("Error saving game:", e);
    }
  };

  const savePlayer = async () => {
    if (!user) return;
    try {
      await api.post("/gameplayers", {
        gameId: gameIdRef.current,
        playerId: playerIdRef.current,
        clientId: clientIdRef.current,
        clientName,
        score: 0
      });
    } catch (e) {
      console.error("Error saving player:", e);
    }
  };

  const endGame = async (finalState) => {
    if (!user) return;
    try {
      await api.patch(`/games/${gameIdRef.current}`, { status: "ended" });
    } catch (e) { console.error("Error ending game:", e); }

    // Stats : chaque joueur enregistre son résultat
    const myPlayer = finalState.players?.find(p => p.clientId === clientIdRef.current);
    if (myPlayer) {
      const iWon = (myPlayer.role === "majority" && finalState.winner === "majority")
        || (myPlayer.role === "impostor" && finalState.winner === "impostors");
      try {
        await api.post("/stats/record", {
          gameSlug: "undercover",
          result: iWon ? "win" : "loss"
        });
      } catch (e) { /* endpoint peut-être pas encore en prod */ }
    }
  };

  // ─── Derived ─────────────────────────────────────────────────────────────

  const myPlayerIdx = privateState?.playerIdx ?? -1;
  const isHost = gameState?.hostClientId === clientIdRef.current;
  const isMyTurn = gameState?.currentPlayerIdx === myPlayerIdx;
  const phase = gameState?.phase || "WAITING";
  const playersReady = gameClients.length;
  const playersNeeded = playersLimitRef.current;
  const allCanStart = playersReady >= 3;

  const copyGameLink = () => {
    const url = `${window.location.origin}/undercover/${gameIdRef.current}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="undercover-board">
      <div className="undercover-container">

        {/* Sidebar */}
        <aside className="undercover-sidebar">
          <div className="undercover-players">
            <div className="players-header">
              <span className="players-label">Joueurs</span>
              <span className="players-count">
                <span className="players-current">{playersReady}</span>/{playersNeeded}
              </span>
            </div>
            <div className="players-bar">
              <div className="players-bar-fill" style={{ width: `${(playersReady / playersNeeded) * 100}%` }} />
            </div>
            {gameClients.map((c, i) => {
              const isCurrent = gameState?.currentPlayerIdx === i;
              return (
                <div
                  key={c.clientId}
                  className={`undercover-player-tag ${isCurrent ? "is-current-turn" : ""}`}
                  style={{
                    color: c.color,
                    ...(isCurrent ? { background: `${c.color}15`, borderColor: `${c.color}30` } : {})
                  }}
                >
                  <img className="player-tag-avatar" src={`https://robohash.org/${encodeURIComponent(c.clientName || "Joueur")}`} alt="" />
                  <span>{c.clientName || `Joueur ${i + 1}`}</span>
                  {gameState?.hostClientId === c.clientId && <span className="host-badge" title="Hôte">👑</span>}
                </div>
              );
            })}
          </div>

          <div className="undercover-sidebar-info">
            <div className="info-row">
              <span className="info-label">Difficulté</span>
              <span className="info-value">{DIFFICULTY_LABELS[gameState?.difficulty || difficultyRef.current]}</span>
            </div>
            {phase !== "WAITING" && (
              <div className="info-row">
                <span className="info-label">Phase</span>
                <span className="info-value">{phaseLabel(phase, gameState)}</span>
              </div>
            )}
          </div>

          <div className="undercover-sidebar-buttons">
            <button type="button" onClick={copyGameLink} className={`undercover-btn-copy ${copied ? "copied" : ""}`} title="Copier le lien">
              {copied ? "Copié !" : "Copier le lien"}
            </button>
            <button type="button" onClick={quitGame} className="undercover-btn-quit">Quitter</button>
          </div>
        </aside>

        {/* Main area */}
        <main className="undercover-main">
          {errorMsg && <div className="undercover-error-toast">{errorMsg}</div>}

          {phase === "WAITING" && (
            <Lobby
              gameState={gameState}
              gameClients={gameClients}
              isHost={isHost}
              allCanStart={allCanStart}
              playersReady={playersReady}
              playersNeeded={playersNeeded}
              sendAction={sendAction}
            />
          )}

          {phase === "MEMORIZATION" && (
            <Memorize
              privateState={privateState}
              gameState={gameState}
              gameClients={gameClients}
              myPlayerIdx={myPlayerIdx}
              clientIdRef={clientIdRef}
              sendAction={sendAction}
            />
          )}

          {phase === "CLUE_ROUND" && (
            <ClueBoard
              gameState={gameState}
              privateState={privateState}
              gameClients={gameClients}
              myPlayerIdx={myPlayerIdx}
              isMyTurn={isMyTurn}
              clueDraft={clueDraft}
              setClueDraft={setClueDraft}
              sendAction={sendAction}
            />
          )}

          {phase === "VOTE" && (
            <VotePanel
              gameState={gameState}
              privateState={privateState}
              gameClients={gameClients}
              myPlayerIdx={myPlayerIdx}
              clientIdRef={clientIdRef}
              sendAction={sendAction}
            />
          )}

          {(phase === "REVEAL" || phase === "GAME_OVER") && (
            <Reveal
              gameState={gameState}
              gameClients={gameClients}
              myPlayerIdx={myPlayerIdx}
              privateState={privateState}
              clientIdRef={clientIdRef}
              sendAction={sendAction}
              onQuit={quitGame}
              onReplay={() => {
                // Recréer une nouvelle partie avec les mêmes paramètres
                const base = `/undercover/${reach || "public"}/${playersLimitRef.current}/${difficultyRef.current}`;
                navigate(base);
                // Force un reload du composant pour ré-init la WS
                setTimeout(() => window.location.reload(), 50);
              }}
            />
          )}
        </main>
      </div>

      {/* Card reveal modal — apparaît au début de MEMORIZATION */}
      {cardRevealData && phase === "MEMORIZATION" && createPortal(
        <CardRevealModal
          character={cardRevealData.character}
          role={cardRevealData.role}
          onClose={() => {
            sendAction({ type: "acknowledge_card" });
            setCardRevealData(null);
          }}
        />,
        document.body
      )}

      {/* Join dialog anonyme */}
      <Transition.Root show={joinOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" initialFocus={cancelJoinButtonRef} onClose={setJoinOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-darker border border-white border-opacity-10 px-6 py-6 text-left shadow-xl transition-all w-full max-w-sm">
                  <Dialog.Title as="h3" className="text-lg font-title font-semibold text-white mb-4">Rejoindre la partie</Dialog.Title>
                  <div>
                    <label className="block text-sm font-sans text-gray-300 mb-2">Votre pseudo</label>
                    <input
                      type="text"
                      className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg px-3 py-2 text-white font-sans focus:outline-none focus:border-main"
                      value={clientName}
                      onChange={(e) => { setClientName(e.target.value); setNameError(""); }}
                      placeholder="Entrez votre pseudo"
                      onKeyDown={(e) => { if (e.key === "Enter") joinGame(clientName); }}
                    />
                    {nameError && <p className="text-red-400 text-xs mt-1 font-sans">{nameError}</p>}
                  </div>
                  <div className="mt-4 flex gap-3 justify-end">
                    <button type="button" ref={cancelJoinButtonRef}
                      className="px-4 py-2 rounded-full bg-white bg-opacity-5 text-white font-sans text-sm hover:bg-opacity-10 transition-all duration-300"
                      onClick={() => { setJoinOpen(false); navigate("/games"); }}>
                      Annuler
                    </button>
                    <button type="button" className="main-btn" onClick={() => joinGame(clientName)}>Rejoindre</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────

function phaseLabel(phase, state) {
  switch (phase) {
    case "WAITING": return "Attente";
    case "MEMORIZATION": return "Mémorisation";
    case "CLUE_ROUND": return `Indice ${state?.currentRound || 1}/${state?.roundsThisCycle || state?.rounds || 3}`;
    case "VOTE": return "Vote";
    case "REVEAL": return "Résultat";
    default: return phase;
  }
}

function Lobby({ gameState, gameClients, isHost, allCanStart, playersReady, playersNeeded, sendAction }) {
  return (
    <div className="undercover-lobby">
      <h2 className="lobby-title">Salle d'attente</h2>
      <p className="lobby-sub">En attente de joueurs... ({playersReady}/{playersNeeded})</p>
      <p className="lobby-help">Partagez le lien pour inviter. Minimum 3 joueurs pour démarrer.</p>

      {isHost && (
        <div className="lobby-host-actions">
          <button type="button" className="lobby-btn lobby-btn-reroll"
            onClick={() => sendAction({ type: "reroll_pair" })}>
            Re-tirer la paire de personnages
          </button>
          <button type="button" className="lobby-btn lobby-btn-start main-btn"
            disabled={!allCanStart}
            onClick={() => sendAction({ type: "start_game" })}>
            Démarrer la partie
          </button>
        </div>
      )}

      {!isHost && <p className="lobby-wait">En attente de l'hôte...</p>}
    </div>
  );
}

function Memorize({ privateState, gameState, gameClients, myPlayerIdx, clientIdRef, sendAction }) {
  const readyCount = gameState?.players?.filter(p => p.hasAcknowledged).length || 0;
  const total = gameState?.players?.length || 0;
  const me = gameState?.players?.find(p => p.clientId === clientIdRef.current);
  const iAcknowledged = me?.hasAcknowledged;

  return (
    <div className="undercover-memorize">
      <h2 className="memorize-title">Mémorisez votre personnage</h2>
      {iAcknowledged ? (
        <p className="memorize-sub">En attente des autres joueurs... ({readyCount}/{total})</p>
      ) : (
        <p className="memorize-sub">Cliquez sur votre carte pour voir qui vous êtes, puis validez.</p>
      )}
      {privateState?.character && !iAcknowledged && (
        <button type="button" className="main-btn memorize-reveal-btn"
          onClick={() => sendAction({ type: "acknowledge_card" })}>
          J'ai mémorisé
        </button>
      )}
    </div>
  );
}

function ClueBoard({ gameState, privateState, gameClients, myPlayerIdx, isMyTurn, clueDraft, setClueDraft, sendAction }) {
  const currentPlayer = gameState.players[gameState.currentPlayerIdx];
  const myCharacter = privateState?.character;

  const submit = () => {
    const trimmed = clueDraft.trim();
    if (!trimmed) return;
    sendAction({ type: "submit_clue", clue: trimmed });
    setClueDraft("");
  };

  return (
    <div className="undercover-clueboard">
      <div className="clueboard-header">
        <h2>Round {gameState.currentRound} / {gameState.roundsThisCycle || gameState.rounds}</h2>
        {isMyTurn ? (
          <p className="clueboard-turn-mine">C'est votre tour — donnez un indice (1 mot / expression courte) sur votre personnage.</p>
        ) : (
          <p className="clueboard-turn-other">Tour de <strong>{currentPlayer?.clientName}</strong></p>
        )}
      </div>

      {myCharacter && (
        <div className="clueboard-my-card">
          <span className="my-card-label">Votre personnage :</span>
          <strong style={{ marginLeft: 8 }}>{myCharacter.name}</strong>
          {myCharacter.anime && <em style={{ marginLeft: 8, opacity: 0.7 }}>({myCharacter.anime})</em>}
        </div>
      )}

      {isMyTurn && (
        <div className="clueboard-input-row">
          <input
            type="text"
            className="clueboard-input"
            value={clueDraft}
            onChange={(e) => setClueDraft(e.target.value)}
            placeholder="Votre indice..."
            maxLength={40}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
          <button type="button" className="main-btn" onClick={submit} disabled={!clueDraft.trim()}>
            Envoyer
          </button>
        </div>
      )}

      <div className="clueboard-rounds">
        {gameState.clueLog.map((roundEntries, rIdx) => (
          <div key={rIdx} className="clueboard-round">
            <h3 className="round-title">Round {rIdx + 1}</h3>
            <div className="round-entries">
              {roundEntries.map((entry, i) => {
                const player = gameClients.find(c => c.clientId === gameState.players[entry.playerIdx]?.clientId);
                return (
                  <div key={i} className="round-entry">
                    <span className="entry-player" style={{ color: player?.color }}>{gameState.players[entry.playerIdx]?.clientName}</span>
                    <span className="entry-clue">« {entry.clue} »</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VotePanel({ gameState, privateState, gameClients, myPlayerIdx, clientIdRef, sendAction }) {
  const hasVoted = privateState?.hasVoted;
  const voteCount = gameState.voteCount || 0;
  const total = gameState.players?.length || 0;

  return (
    <div className="undercover-vote">
      <h2>Votez pour le suspect</h2>
      {hasVoted ? (
        <p className="vote-sub">Vote enregistré. En attente des autres ({voteCount}/{total})</p>
      ) : (
        <p className="vote-sub">Qui pensez-vous être un imposteur ?</p>
      )}

      <div className="vote-grid">
        {gameState.players.map((p, i) => {
          const client = gameClients.find(c => c.clientId === p.clientId);
          const isMe = p.clientId === clientIdRef.current;
          return (
            <button
              key={p.clientId}
              type="button"
              className={`vote-target ${hasVoted ? "disabled" : ""} ${isMe ? "is-me" : ""}`}
              disabled={hasVoted || isMe}
              onClick={() => sendAction({ type: "cast_vote", targetIdx: i })}
              style={{ borderColor: client?.color }}
            >
              <img className="vote-avatar" src={`https://robohash.org/${encodeURIComponent(p.clientName || "Joueur")}`} alt="" />
              <span className="vote-name" style={{ color: client?.color }}>{p.clientName}</span>
              {isMe && <span className="vote-me-tag">(vous)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Reveal({ gameState, gameClients, myPlayerIdx, privateState, clientIdRef, sendAction, onQuit, onReplay }) {
  const eliminated = gameState.players[gameState.eliminatedPlayerIdx];
  const winnerSet = gameState.winner !== null && gameState.winner !== undefined;
  const gameIsOver = gameState.phase === "GAME_OVER";
  const winnerIsMajority = gameState.winner === "majority";
  const myRole = privateState?.role;
  const iWon = winnerSet && ((myRole === "majority" && winnerIsMajority) || (myRole === "impostor" && !winnerIsMajority));

  // Cas 1 : REVEAL intermédiaire (partie en cours, plusieurs imposteurs)
  if (gameState.phase === "REVEAL" && !winnerSet) {
    const me = gameState.players.find(p => p.clientId === clientIdRef.current);
    const iAcknowledged = me?.hasAckReveal;
    const ackCount = gameState.players.filter(p => p.alive && p.connected && p.hasAckReveal).length;
    const totalAlive = gameState.players.filter(p => p.alive && p.connected).length;

    const impostorsAlive = gameState.players.filter(p => p.alive && p.role === "impostor").length;

    return (
      <div className="undercover-reveal undercover-reveal-midgame">
        <h2 className="reveal-banner intermediate">Élimination</h2>
        <div className="reveal-eliminated">
          <h3>Éliminé : {eliminated?.clientName}</h3>
          <p className="reveal-char-name">
            Personnage : <strong>{eliminated?.character?.name}</strong>
            {eliminated?.character?.anime && <em style={{ marginLeft: 8, opacity: 0.6 }}>({eliminated.character.anime})</em>}
          </p>
          <p className={`reveal-role ${eliminated?.role === "impostor" ? "role-impostor" : "role-majority"}`}>
            Rôle : {eliminated?.role === "impostor" ? "Imposteur" : "Majorité"}
          </p>
        </div>
        <p className="reveal-verdict">
          {impostorsAlive > 0
            ? `Il reste ${impostorsAlive} imposteur${impostorsAlive > 1 ? "s" : ""} à démasquer.`
            : "Tous les imposteurs ont été démasqués."}
        </p>
        <div className="reveal-buttons">
          <button type="button" className="main-btn"
            disabled={iAcknowledged}
            onClick={() => sendAction({ type: "acknowledge_reveal" })}>
            {iAcknowledged ? `En attente... (${ackCount}/${totalAlive})` : "Continuer"}
          </button>
        </div>
      </div>
    );
  }

  // Cas 2 : GAME_OVER (ou REVEAL avec winner set, transition en cours)
  return (
    <div className="undercover-reveal">
      <h2 className={`reveal-banner ${iWon ? "won" : "lost"}`}>
        {iWon ? "Victoire !" : "Défaite"}
      </h2>

      {eliminated && (
        <div className="reveal-eliminated">
          <h3>Dernier éliminé : {eliminated.clientName}</h3>
          <p className="reveal-char-name">
            Personnage : <strong>{eliminated.character?.name}</strong>
          </p>
          <p className={`reveal-role ${eliminated.role === "impostor" ? "role-impostor" : "role-majority"}`}>
            Rôle : {eliminated.role === "impostor" ? "Imposteur" : "Majorité"}
          </p>
        </div>
      )}

      <p className="reveal-verdict">
        {winnerIsMajority
          ? "Les civils ont démasqué tous les imposteurs !"
          : "Les imposteurs ont survécu — ils gagnent."}
      </p>

      <div className="reveal-pair">
        <h4>La paire du jeu :</h4>
        <p>
          <strong>Majorité</strong> : {gameState.pair?.A?.name}
          <br/>
          <strong>Imposteur(s)</strong> : {gameState.pair?.B?.name}
        </p>
      </div>

      <div className="reveal-all-players">
        <h4>Tous les joueurs</h4>
        <div className="reveal-players-list">
          {gameState.players.map(p => {
            const client = gameClients.find(c => c.clientId === p.clientId);
            return (
              <div key={p.clientId} className={`reveal-player-row ${p.role}`}>
                <span className="reveal-player-name" style={{ color: client?.color }}>
                  {p.clientName}{!p.alive && <span className="eliminated-tag"> ✖</span>}
                </span>
                <span className="reveal-player-char">{p.character?.name}</span>
                <span className={`reveal-player-role ${p.role === "impostor" ? "role-impostor" : "role-majority"}`}>
                  {p.role === "impostor" ? "Imposteur" : "Majorité"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="reveal-buttons">
        {onReplay && (
          <button type="button" className="main-btn" onClick={onReplay}>Rejouer</button>
        )}
        <button type="button" className="undercover-btn-quit" onClick={onQuit}>Retour aux jeux</button>
      </div>
    </div>
  );
}

function CardRevealModal({ character, role, onClose }) {
  const [imgOk, setImgOk] = useState(true);
  const initials = (character?.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="undercover-card-modal-overlay" onClick={onClose}>
      <div className="undercover-card-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`undercover-card ${role === "impostor" ? "is-impostor" : "is-majority"}`}>
          <div className="card-role-banner">
            {role === "impostor" ? "Vous êtes IMPOSTEUR" : "Vous êtes MAJORITÉ"}
          </div>
          {character?.image && imgOk ? (
            <img className="card-image" src={character.image} alt={character.name}
              onError={() => setImgOk(false)} />
          ) : (
            <div className="card-image-fallback">
              <span className="fallback-initials">{initials}</span>
            </div>
          )}
          <h3 className="card-name">{character?.name}</h3>
          {character?.anime && <p className="card-anime">{character.anime}</p>}
          <div className="card-hint">
            {role === "impostor"
              ? "Un ou plusieurs autres joueurs ont le même rôle. Les autres ont un personnage DIFFÉRENT mais similaire."
              : "La plupart des joueurs ont le même personnage que vous. Un ou plusieurs ont un personnage DIFFÉRENT à démasquer."}
          </div>
        </div>
        <button type="button" className="main-btn card-modal-ok" onClick={onClose}>
          J'ai mémorisé !
        </button>
      </div>
    </div>
  );
}
