import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { useUser } from "../Auth/useUser.jsx";
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../api";
import { useChat } from "../Chat/ChatContext";
import { useToast } from "../UI/Toast";

const GRID_SIZE = 3;
const TOTAL_SQUARES = GRID_SIZE * GRID_SIZE;

// Pure logic: check if mark wins on a flat board array
function checkWin(board, mark) {
  for (let i = 0; i < GRID_SIZE; i++) {
    let hCount = 0, vCount = 0;
    for (let j = 0; j < GRID_SIZE; j++) {
      if (board[i * GRID_SIZE + j] === mark) hCount++;
      if (board[j * GRID_SIZE + i] === mark) vCount++;
    }
    if (hCount === GRID_SIZE || vCount === GRID_SIZE) return true;
  }
  let d1 = 0, d2 = 0;
  for (let i = 0; i < GRID_SIZE; i++) {
    if (board[i * GRID_SIZE + i] === mark) d1++;
    if (board[(GRID_SIZE - 1) * (i + 1)] === mark) d2++;
  }
  return d1 === GRID_SIZE || d2 === GRID_SIZE;
}

export default function TicTacToe() {
  const user = useUser();
  const { joinGame: chatJoinGame, leaveGame: chatLeaveGame, addGameMessage } = useChat();
  const { addToast } = useToast();
  const { id, reach, numberplayers } = useParams();
  const navigate = useNavigate();

  // Refs for WebSocket values
  const wsRef = useRef(null);
  const clientIdRef = useRef(null);
  const playerIdRef = useRef(user ? user.id : null);
  const gameIdRef = useRef(id || null);

  // Game state
  const [isConnected, setIsConnected] = useState(false);
  const [gamePhase, setGamePhase] = useState("waiting"); // waiting | playing | ended
  const [players, setPlayers] = useState([]); // [{clientId, clientName, color, mark}]
  const [board, setBoard] = useState(Array(TOTAL_SQUARES).fill(null));
  const [currentTurn, setCurrentTurn] = useState("X");
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [resultMessage, setResultMessage] = useState(null);
  const [turnMessage, setTurnMessage] = useState("Bonne chance a vous deux !");
  const [copied, setCopied] = useState(false);

  // Player info
  const [clientName, setClientName] = useState(user ? user.username : "Utilisateur");
  const [nameError, setNameError] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const [maxPlayers] = useState(numberplayers || 2);

  // Derived values
  const myMark = players.find(p => p.clientId === clientIdRef.current)?.mark;
  const myColor = players.find(p => p.clientId === clientIdRef.current)?.color;
  const isMyTurn = currentTurn === myMark && gamePhase === "playing";
  const gameUrl = gameIdRef.current
    ? `${window.location.origin}/tictactoe/${gameIdRef.current}`
    : "";

  // --- WebSocket connection ---
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
            createGame(data.clientId);
          } else if (!user) {
            setJoinOpen(true);
          } else {
            joinGame(data.clientId, user.username);
          }
          break;

        case "create":
          gameIdRef.current = data.game.id;
          saveGame(data.game.id);
          joinGame(clientIdRef.current, clientName);
          break;

        case "join":
          handleJoin(data.game);
          break;

        case "update":
          handleUpdate(data.game);
          break;

        case "quit":
          handleQuit(data);
          break;

        case "chat_game":
          addGameMessage(data.message);
          break;

        case "error":
          setNameError(data.message || "Erreur");
          addToast(data.message || "Erreur", "error");
          break;
      }
    };

    const handleBeforeUnload = () => {
      quitGame();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      chatLeaveGame();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, []);

  // --- WebSocket send helpers ---
  const createGame = (cId) => {
    wsRef.current?.send(JSON.stringify({
      method: "create",
      clientId: cId,
      playerId: playerIdRef.current,
      gameModel: "tictactoe",
      squares: TOTAL_SQUARES,
      playersLimit: maxPlayers,
    }));
  };

  const joinGame = (cId, name) => {
    wsRef.current?.send(JSON.stringify({
      method: "join",
      playerId: playerIdRef.current,
      clientId: cId,
      clientName: name,
      gameId: gameIdRef.current,
    }));
  };

  const quitGame = () => {
    wsRef.current?.send(JSON.stringify({
      method: "quit",
      playerId: playerIdRef.current,
      clientId: clientIdRef.current,
      clientName,
      gameId: gameIdRef.current,
    }));
  };

  const sendPlay = (squareId) => {
    if (!isMyTurn || board[squareId] !== null) return;
    wsRef.current?.send(JSON.stringify({
      method: "play",
      clientId: clientIdRef.current,
      playerId: playerIdRef.current,
      gameId: gameIdRef.current,
      squareId: `square_${squareId}`,
      color: myColor,
      mark: myMark,
    }));
  };

  const sendReset = () => {
    wsRef.current?.send(JSON.stringify({
      method: "reset",
      gameId: gameIdRef.current,
    }));
  };

  // --- Handlers ---
  const handleJoin = (game) => {
    setPlayers(game.clients || []);

    // Register chat
    chatJoinGame(gameIdRef.current, wsRef, clientIdRef.current);

    // Save to DB if this is us joining
    const lastClient = game.clients[game.clients.length - 1];
    if (lastClient?.clientId === clientIdRef.current && playerIdRef.current) {
      savePlayer();
    }

    if (game.clients.length === game.playersLimit) {
      setGamePhase("playing");
      updateGameDb(game.clients.length, game.playersLimit);
      setTurnMessage("Bonne chance a vous deux !");
    } else {
      updateGameDb(game.clients.length, game.playersLimit);
    }
  };

  const handleUpdate = (game) => {
    if (!game.state) return;
    const { turn, board: serverBoard } = game.state;
    const newClients = game.clients || players;

    // Convert server board (object with square_N keys) to array
    const newBoard = Array(TOTAL_SQUARES).fill(null);
    if (serverBoard) {
      Object.entries(serverBoard).forEach(([key, mark]) => {
        const idx = parseInt(key.replace("square_", ""));
        if (!isNaN(idx)) newBoard[idx] = mark;
      });
    }

    const filledCount = newBoard.filter(c => c !== null).length;
    if (filledCount === 0) {
      // Board was reset, just update state
      setBoard(newBoard);
      setCurrentTurn(turn);
      setPlayers(newClients);
      return;
    }

    setBoard(newBoard);
    setCurrentTurn(turn);
    setPlayers(newClients);

    // Check win/draw locally
    const xWin = checkWin(newBoard, "X");
    const oWin = checkWin(newBoard, "O");

    if (xWin || oWin) {
      const winner = xWin ? "X" : "O";
      setScores(prev => {
        const updated = { ...prev, [winner]: prev[winner] + 1 };
        // Save score
        const myMarkNow = newClients.find(p => p.clientId === clientIdRef.current)?.mark;
        const myScore = myMarkNow === "X" ? updated.X : updated.O;
        saveScore(myScore);
        if (playerIdRef.current) {
          managePlayerBestScore("tictactoe", myScore);
        }
        return updated;
      });

      const winnerName = newClients.find(c => c.mark === (xWin ? "X" : "O"))?.clientName || "?";
      setResultMessage({ type: "win", mark: xWin ? "X" : "O", name: winnerName });

      setTimeout(() => {
        setResultMessage(null);
        sendReset();
      }, 2500);
    } else if (filledCount >= TOTAL_SQUARES) {
      setResultMessage({ type: "draw" });
      setTimeout(() => {
        setResultMessage(null);
        sendReset();
      }, 2500);
    } else {
      // Update turn message
      const turnPlayer = newClients.find(c => c.mark === turn);
      if (turnPlayer) {
        if (turnPlayer.clientId === clientIdRef.current) {
          setTurnMessage("C'est a vous de jouer !");
        } else {
          setTurnMessage(`C'est au tour de ${turnPlayer.clientName}`);
        }
      }
    }
  };

  const handleQuit = (data) => {
    const remaining = data.game?.clients || [];
    setPlayers(remaining);
    updateGameDb(remaining.length, data.game?.playersLimit || maxPlayers);

    if (remaining.length === 0) {
      endGame();
    }

    if (data.clientId === clientIdRef.current) {
      chatLeaveGame();
      navigate("/games");
    } else {
      addToast(`${data.clientName || "Un joueur"} a quitte la partie`, "info");
      setGamePhase("waiting");
    }
  };

  // --- DB helpers ---
  const saveGame = async (gId) => {
    if (!playerIdRef.current) return;
    try {
      await api.post('/games', {
        gameId: gId,
        ownerId: playerIdRef.current,
        maxPlayers,
        status: "pending",
        gameModel: "tictactoe",
        reach,
      });
    } catch (e) { console.error("saveGame error:", e); }
  };

  const savePlayer = async () => {
    if (!playerIdRef.current) return;
    try {
      await api.post('/gameplayers', {
        gameId: gameIdRef.current,
        playerId: playerIdRef.current,
        clientId: clientIdRef.current,
        clientName,
        score: 0,
      });
    } catch (e) { console.error("savePlayer error:", e); }
  };

  const updateGameDb = async (numPlayers, limit) => {
    try {
      await api.patch(`/games/${gameIdRef.current}`, {
        numberPlayers: numPlayers,
        status: numPlayers >= limit ? "in progress" : "pending",
      });
    } catch (e) { console.error("updateGame error:", e); }
  };

  const endGame = async () => {
    try {
      if (gamePhase === "waiting") {
        await api.delete(`/games/gameid/${gameIdRef.current}`);
      } else {
        await api.patch(`/games/${gameIdRef.current}`, { status: "ended" });
      }
    } catch (e) { console.error("endGame error:", e); }
  };

  const saveScore = async (score) => {
    try {
      await api.patch(`/gameplayers/score/${gameIdRef.current}/${clientIdRef.current}`, { score });
    } catch (e) { console.error("saveScore error:", e); }
  };

  const managePlayerBestScore = async (slug, playerScore) => {
    try {
      const response = await api.get(`/playerscores/slugnid/${slug}/${playerIdRef.current}`);
      if (playerScore > response.data.bestScore) {
        await api.patch(`/playerscores/slugnid/${slug}/${playerIdRef.current}`, { bestScore: playerScore });
      }
    } catch (e) { console.error("bestScore error:", e); }
  };

  // --- Join modal for guests ---
  const handleGuestJoin = () => {
    if (!clientName.trim()) {
      setNameError("Veuillez entrer un pseudo");
      return;
    }
    setJoinOpen(false);
    setNameError("");
    joinGame(clientIdRef.current, clientName);
  };

  // --- Copy link ---
  const copyLink = () => {
    navigator.clipboard.writeText(gameUrl);
    setCopied(true);
    addToast("Lien copie !", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Render ---
  const renderBoard = () => {
    const rows = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      const cells = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        const idx = i * GRID_SIZE + j;
        const mark = board[idx];
        const isClickable = isMyTurn && mark === null && gamePhase === "playing";
        cells.push(
          <td
            key={idx}
            id={`square_${idx}`}
            className={`${mark || ''} ${isClickable ? 'clickable' : ''}`}
            onClick={() => isClickable && sendPlay(idx)}
          >
            {mark}
          </td>
        );
      }
      rows.push(<tr key={i}>{cells}</tr>);
    }
    return (
      <table id="tic-tac-toe" align="center">
        <tbody>{rows}</tbody>
      </table>
    );
  };

  return (
    <div className="board conteneur">
      <div id="oxoBoard">

        {/* Left panel: Players + buttons */}
        <div className="boardinfo">
          <div className="players">
            <h4>Joueurs</h4>
            <div id="divPlayers">
              {players.map((p, i) => (
                <div
                  key={p.clientId}
                  className={`oxo-player ${i % 2 === 0 ? 'oxo-player--primary' : 'oxo-player--secondary'}`}
                >
                  <div className="oxo-player__left">
                    <img
                      className="oxo-player__avatar"
                      src={`https://robohash.org/${p.clientName !== "Utilisateur" ? p.clientName : "player"}`}
                      alt={p.clientName}
                    />
                    <div className="oxo-player__info">
                      <h5 className="oxo-player__name">{p.clientName}</h5>
                      <span className="oxo-player__score" style={{ color: p.color }}>
                        Score : {p.mark === "X" ? scores.X : scores.O}
                      </span>
                    </div>
                  </div>
                  <div className="oxo-player__dot" style={{ background: p.color }}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="boardbuttons">
            <button type="button" className="copy-btn" onClick={copyLink}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="12" height="12" rx="2" />
                <path d="M4 14V4a2 2 0 0 1 2-2h10" />
              </svg>
              <span>{copied ? "Copie !" : "Copier le lien"}</span>
            </button>

            <button
              type="button"
              className="quit-btn btn"
              onClick={() => {
                quitGame();
                chatLeaveGame();
                navigate("/games");
              }}
            >
              Quitter la partie
            </button>
          </div>
        </div>

        {/* Right panel: Board */}
        <div className="boardholder">
          {gamePhase === "waiting" ? (
            <div id="waitholder">
              <span className="oxo-waiting-text">En attente des joueurs...</span>
              <svg width="130" height="300" viewBox="0 0 260 500" fill="none" overflow="hidden" xmlns="http://www.w3.org/2000/svg">
                <use href="#cube" x="0" y="210" strokeWidth="2" opacity="0.3">
                  <animate attributeName="stroke" dur="6s" repeatCount="indefinite"
                    values="#95FDFC;#A7F3FC;#B8E8FC;#CADEFD;#DBD3FD;#EDC9FD;#FEBEFD;#EDC9FD;#DBD3FD;#CADEFD;#B8E8FC;#A7F3FC"/>
                </use>
                <use href="#cube" x="0" y="20" strokeWidth="2">
                  <animate attributeName="stroke" dur="6s" repeatCount="indefinite"
                    values="#95FDFC;#A7F3FC;#B8E8FC;#CADEFD;#DBD3FD;#EDC9FD;#FEBEFD;#EDC9FD;#DBD3FD;#CADEFD;#B8E8FC;#A7F3FC"/>
                </use>
                <defs>
                  <g id="cube">
                    <use href="#cube_outline" strokeLinejoin="round" strokeWidth="16" fill="url(#stars)"/>
                    <use href="#cube_base" strokeWidth=".5"/>
                    <use href="#cube_outline" strokeLinejoin="round" strokeWidth="6" stroke="#141417"/>
                  </g>
                  <g id="cube_outline">
                    <path>
                      <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                        keyTimes="0;0.5;0.5;1"
                        keySplines="0.8 0.2 0.6 0.9;0.8 0.2 0.6 0.9;0.8 0.2 0.6 0.9"
                        values="M10 64 L128 0 L246 64 L246 192 L128 256 L10 192Z;M40 20 L216 20 L216 108 L216 236 L40 236 L40 172Z;M216 20 L40 20 L40 108 L40 236 L216 236 L216 172Z;M246 64 L128 0 L10 64 L10 192 L128 256 L246 192Z"/>
                    </path>
                  </g>
                  <g id="cube_base">
                    <path fill="#fff1">
                      <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                        keyTimes="0;0.5;1" keySplines="0.8 0.2 0.6 0.9;0.8 0.2 0.6 0.9"
                        values="M10 64 L128 0 L246 64 L128 128Z;M40 20 L216 20 L216 108 L40 108Z;M128 0 L246 64 L128 128 L10 64Z"/>
                    </path>
                    <path>
                      <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                        keyTimes="0;0.5;0.5;1"
                        keySplines="0.8 0.2 0.6 0.9;0.8 0.2 0.6 0.9;0.8 0.2 0.6 0.9"
                        values="M10 64 L128 128 L128 256 L10 192Z;M40 20 L40 108 L40 236 L40 172Z;M216 20 L216 108 L216 236 L216 172Z;M246 64 L128 128 L128 256 L246 192Z"/>
                      <animate attributeName="fill" dur="1.5s" repeatCount="indefinite" keyTimes="0;0.5;0.5;1"
                        values="#fff0;#fff0;#fff2;#fff2"/>
                    </path>
                    <path fill="#407080">
                      <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                        keyTimes="0;0.5;1" keySplines="0.8 0.2 0.6 0.9;0.8 0.2 0.6 0.9"
                        values="M246 64 L128 128 L128 256 L246 192Z;M216 108 L40 108 L40 236 L216 236Z;M128 128 L10 64 L10 192 L128 256Z"/>
                      <animate attributeName="fill" dur="1.5s" repeatCount="indefinite" keyTimes="0;0.5;1"
                        values="#fff2;#fff1;#fff0"/>
                    </path>
                  </g>
                  <linearGradient id="fade" gradientTransform="rotate(90)">
                    <stop offset="0" stopColor="#06122F00"/>
                    <stop offset="0.25" stopColor="#06122Fff"/>
                  </linearGradient>
                  <linearGradient id="sky" gradientTransform="rotate(90)">
                    <stop offset="0.5" stopColor="#06122F"/>
                    <stop offset="1" stopColor="#06397B"/>
                  </linearGradient>
                  <pattern id="stars" x="0" y="0" width="50%" height="50%" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                    <rect width="256" height="256" fill="url(#sky)"/>
                    <circle cx="24" cy="32" r="1" fill="white"/>
                    <circle cx="64" cy="96" r="1.5" fill="#ad9dcb"/>
                    <circle cx="224" cy="102" r="1" fill="#ad9dcb"/>
                    <circle cx="192" cy="112" r="1.5" fill="#E0E8EA"/>
                    <circle cx="96" cy="16" r="2" fill="#E0E8EA"/>
                    <circle cx="64" cy="64" r="1" fill="white"/>
                    <circle cx="160" cy="24" r="1.5" fill="#ad9dcb"/>
                    <circle cx="196" cy="60" r="2" fill="#E0E8EA"/>
                    <circle cx="64" cy="212" r="1" fill="white"/>
                    <circle cx="218" cy="216" r="1" fill="#ad9dcb"/>
                    <circle cx="140" cy="128" r="1.5" fill="#ad9dcb"/>
                    <circle cx="24" cy="140" r="2" fill="#E0E8EA"/>
                    <circle cx="95" cy="160" r="1" fill="white"/>
                    <circle cx="180" cy="128" r="1" fill="#ad9dcb"/>
                  </pattern>
                </defs>
              </svg>
            </div>
          ) : (
            <>
              {renderBoard()}
              <div className="alert">
                <div id="turnAlert">
                  {turnMessage}
                </div>
                <div id="winnerAlert">
                  {resultMessage && resultMessage.type === "win" && (
                    <span>
                      Les <span style={{ color: resultMessage.mark === "X" ? "#FEBEFD" : "#95FDFC", fontWeight: 600 }}>
                        {resultMessage.mark}
                      </span> ont gagne le point !
                    </span>
                  )}
                  {resultMessage && resultMessage.type === "draw" && (
                    <span>C'est une egalite !</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Guest join modal */}
      <Transition.Root className='pop-up' show={joinOpen} as={Fragment}>
        <Dialog as="div" onClose={() => setJoinOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="pop-up-background" />
          </Transition.Child>

          <div className="pop-up-content">
            <div className="pop-up-window">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="pop-up-panel">
                  <div className="content-container">
                    <div className="content">
                      <div className="content-text">
                        <Dialog.Title as="h3">
                          Choisissez un pseudo pour rejoindre
                        </Dialog.Title>
                        <form className="text-bloc" onSubmit={(e) => { e.preventDefault(); handleGuestJoin(); }}>
                          <div className="field">
                            <label className="label">Pseudonyme</label>
                            <input
                              className="input"
                              type="text"
                              placeholder="Votre pseudo"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              maxLength={30}
                              autoFocus
                            />
                            {nameError && <p className="fail">{nameError}</p>}
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="btn-container">
                    <button type="button" className="btn-continue" onClick={handleGuestJoin}>
                      Rejoindre
                    </button>
                    <button type="button" className="btn-cancel" onClick={() => { setJoinOpen(false); navigate("/games"); }}>
                      Annuler
                    </button>
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
