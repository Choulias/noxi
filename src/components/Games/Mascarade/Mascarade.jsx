import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from "react";
import { useUser } from "../../Auth/useUser.jsx";
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from "../../../api";
import MascaradeBoard from "./MascaradeBoard.jsx";
import MascaradeActions from "./MascaradeActions.jsx";
import MascaradeContestation from "./MascaradeContestation.jsx";
import MascaradeLog from "./MascaradeLog.jsx";
import Card3DModal from "./Card3DModal.jsx";
import MascaradeAnimations from "./MascaradeAnimations.jsx";
import { MASK_NAMES, MASK_ICONS, MASK_DESCRIPTIONS, MASK_IMAGES, MASK_CHIBIS, CARD_VERSO } from "./mascaradeConstants.js";
import { useChat } from "../../Chat/ChatContext";
import GamingPlate from "../../../assets/img/mascarad_imgs/gaming_plate.png";
import DefeatBack from "../../../assets/img/mascarad_imgs/defeat_arriere_plan.png";
import DefeatFront from "../../../assets/img/mascarad_imgs/defeat_avant_plan.png";
import VictoryBack from "../../../assets/img/mascarad_imgs/victory_arriere_plan.png";
import VictoryFront from "../../../assets/img/mascarad_imgs/victory_avant_plan.png";
import MascaradeSong from "../../../assets/audio/mascarad_song/enchanting_masquerade.mp3";

export default function Mascarade() {
  const user = useUser();
  const { joinGame: chatJoinGame, leaveGame: chatLeaveGame, addGameMessage } = useChat();
  const { id, reach, numberplayers, mode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cancelJoinButtonRef = useRef(null);
  const existingNamesRef = useRef([]);

  const [joinOpen, setJoinOpen] = useState(false);
  const [clientName, setClientName] = useState(user ? user.username : "Utilisateur");
  const [nameError, setNameError] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(numberplayers || 4);
  const [scenario, setScenario] = useState(searchParams.get("variant") === "B" ? "B" : "A");

  // Game state
  const [gameState, setGameState] = useState(null);
  const [privateState, setPrivateState] = useState(null);
  const [gameClients, setGameClients] = useState([]);
  const [gameLog, setGameLog] = useState([]);
  const [revealData, setRevealData] = useState(null);
  const [lookResult, setLookResult] = useState(null);
  const [espionneReveal, setEspionneReveal] = useState(null);
  const [lookModal, setLookModal] = useState(null); // {mask} for look overlay
  const [contestResult, setContestResult] = useState(null); // contestation summary
  const [gamePhase, setGamePhase] = useState("WAITING");
  const [isConnected, setIsConnected] = useState(false);
  const [debugLogOpen, setDebugLogOpen] = useState(false);
  const [maskTooltip, setMaskTooltip] = useState(null); // { mask, x, y }
  const [copied, setCopied] = useState(false);
  const [cardDetailMask, setCardDetailMask] = useState(null); // mask name for detail modal
  const [cardTooltip, setCardTooltip] = useState(null); // { mask, x, y } for card hover tooltip
  const [actionCooldown, setActionCooldown] = useState(false);
  const [pickerHighlight, setPickerHighlight] = useState(null); // { type: "player"|"center", index }
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef(null);
  const musicHoverTimer = useRef(null);
  const prevGameStateRef = useRef(null);
  const boardRef = useRef(null);

  // Refs for values needed in WebSocket callbacks
  const clientIdRef = useRef(null);
  const playerIdRef = useRef(user ? user.id : null);
  const gameIdRef = useRef(id || null);
  const wsRef = useRef(null);
  const gameDbIdRef = useRef(null);
  const playersLimitRef = useRef(parseInt(numberplayers) || 4);

  // WebSocket connection
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
            // Create new game
            createGame();
          } else if (gameIdRef.current && !gameIdRef.current.includes("/")) {
            // Join existing game by ID — request player list first
            if (!user) {
              wsRef.current?.send(JSON.stringify({ method: "game_info", clientId: data.clientId, gameId: gameIdRef.current }));
            } else {
              joinGame(clientName);
            }
          }
          break;

        case "game_info": {
          // Got existing player names — generate unique default name and show dialog
          const existingNames = (data.clients || []).map(c => c.clientName?.toLowerCase()).filter(Boolean);
          let defaultName = "Utilisateur";
          if (existingNames.includes(defaultName.toLowerCase())) {
            let i = 1;
            while (existingNames.includes(`${defaultName} ${i}`.toLowerCase())) i++;
            defaultName = `${defaultName} ${i}`;
          }
          existingNamesRef.current = existingNames;
          setClientName(defaultName);
          setNameError("");
          setJoinOpen(true);
          break;
        }

        case "create":
          gameIdRef.current = data.game.id;
          // Save game to DB then join
          saveGame(data.game).then(() => {
            if (!user) {
              wsRef.current?.send(JSON.stringify({ method: "game_info", clientId: clientIdRef.current, gameId: gameIdRef.current }));
            } else {
              joinGame(clientName);
            }
          });
          break;

        case "join":
          handleJoin(data.game);
          break;

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
          setNameError(data.message || "Erreur");
          setJoinOpen(true);
          break;
      }
    };

    return () => {
      chatLeaveGame();
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // --- WebSocket send helpers ---

  const isHiddenMode = mode === "cache";

  const createGame = useCallback(() => {
    wsRef.current?.send(JSON.stringify({
      method: "create",
      clientId: clientIdRef.current,
      playerId: playerIdRef.current,
      gameModel: "mascarade",
      playersLimit: playersLimitRef.current,
      scenario: scenario,
      hiddenMode: isHiddenMode
    }));
  }, [scenario, isHiddenMode]);

  const isNameTaken = useCallback((name) => {
    return existingNamesRef.current.includes(name.trim().toLowerCase());
  }, []);

  const joinGame = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (isNameTaken(trimmed)) {
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
  }, [isNameTaken]);

  const sendAction = useCallback((action) => {
    const scrollY = window.scrollY;
    document.activeElement?.blur();
    wsRef.current?.send(JSON.stringify({
      method: "mascarade_action",
      clientId: clientIdRef.current,
      gameId: gameIdRef.current,
      action
    }));
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
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

  // --- Message handlers ---

  const handleJoin = (game) => {
    const scrollY = window.scrollY;
    setGameClients(game.clients || []);
    if (game.playersLimit) playersLimitRef.current = game.playersLimit;
    if (game.state) {
      setGameState(game.state);
      setGamePhase(game.state.phase);
      if (game.state.log) setGameLog(game.state.log);
    }
    if (game.privateState) {
      setPrivateState(game.privateState);
    }
    // Save player to DB
    if (playerIdRef.current) {
      savePlayer();
    }
    // Register game chat
    chatJoinGame(gameIdRef.current, wsRef, clientIdRef.current);
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
  };

  const handleUpdate = (game) => {
    const scrollY = window.scrollY;
    setGameClients(game.clients || []);
    if (game.playersLimit) playersLimitRef.current = game.playersLimit;
    if (game.state) {
      setGameState(game.state);
      setGamePhase(game.state.phase);
      if (game.state.log) setGameLog(game.state.log);
      // Auto-save scores when game ends
      if (game.state.phase === "GAME_OVER" && gamePhase !== "GAME_OVER") {
        endGame(game.state);
      }
    }
    if (game.privateState) {
      setPrivateState(game.privateState);
    }
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
  };

  const handlePrivateMessage = (data) => {
    switch (data.type) {
      case "look_result":
        setLookResult(data.mask);
        setLookModal(data.mask);
        break;
      case "espionne_reveal":
        setEspionneReveal(data);
        break;
      case "contestation_reveal":
        setRevealData(data);
        setContestResult(data);
        setActionCooldown(true);
        setTimeout(() => setRevealData(null), 5000);
        setTimeout(() => setContestResult(null), 5000);
        setTimeout(() => setActionCooldown(false), 5000);
        break;
      case "princesse_reveal":
        setRevealData(data);
        setActionCooldown(true);
        setTimeout(() => setRevealData(null), 6000);
        setTimeout(() => setActionCooldown(false), 6000);
        break;
      case "gourou_reveal":
        setRevealData(data);
        setActionCooldown(true);
        setTimeout(() => setRevealData(null), 6000);
        setTimeout(() => setActionCooldown(false), 6000);
        break;
    }
  };

  const handleQuit = (data) => {
    if (data.game) {
      setGameClients(data.game.clients || []);
    }
    if (data.clientId === clientIdRef.current) {
      navigate("/games");
    }
  };

  // --- REST API calls ---

  const saveGame = async (game) => {
    if (!user) return;
    try {
      const res = await api.post("/games", {
        gameId: game.id,
        ownerId: playerIdRef.current,
        numberPlayers: 1,
        maxPlayers: game.playersLimit,
        status: "pending",
        gameModel: "mascarade",
        reach: reach || "public",
        gameMode: isHiddenMode ? "cache" : "classique"
      });
      gameDbIdRef.current = res.data.id;
    } catch (e) {
      console.error("Error saving game:", e);
    }
  };

  // --- Score persistence ---

  const savePlayer = async () => {
    if (!user) return;
    try {
      await api.post("/gameplayers", {
        gameId: gameIdRef.current,
        playerId: playerIdRef.current,
        clientId: clientIdRef.current,
        clientName: clientName,
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
    } catch (e) {
      console.error("Error ending game:", e);
    }

    // Save each player's score (their final coins)
    if (finalState?.players) {
      for (const p of finalState.players) {
        try {
          await api.patch(`/gameplayers/score/${gameIdRef.current}/${p.clientId}`, {
            score: p.coins
          });
        } catch (e) {
          console.error("Error saving player score:", e);
        }
      }
    }

    // Update best score for current user
    if (playerIdRef.current && finalState) {
      const myPlayer = finalState.players.find(p => p.clientId === clientIdRef.current);
      if (myPlayer) {
        try {
          const res = await api.get(`/playerscores/slugnid/mascarade/${playerIdRef.current}`);
          if (myPlayer.coins > res.data.bestScore) {
            await api.patch(`/playerscores/slugnid/mascarade/${playerIdRef.current}`, {
              bestScore: myPlayer.coins
            });
          }
        } catch (e) {
          // Player score entry may not exist yet, ignore
        }
      }
    }
  };

  // --- Derived state ---

  const myPlayerIndex = privateState?.playerIndex ?? -1;
  const isMyTurn = gameState?.currentPlayerIndex === myPlayerIndex;
  const myColor = gameClients.find(c => c.clientId === clientIdRef.current)?.color;
  const playersReady = gameClients.length;
  const playersNeeded = playersLimitRef.current;
  const isWaiting = gamePhase === "WAITING" || playersReady < playersNeeded;
  const isOwner = gameClients[0]?.clientId === clientIdRef.current;

  // Music toggle
  const toggleMusic = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(MascaradeSong);
      audioRef.current.loop = true;
      audioRef.current.volume = musicVolume;
    }
    if (musicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setMusicPlaying(!musicPlaying);
  }, [musicPlaying, musicVolume]);

  // Volume change
  const handleVolumeChange = useCallback((e) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  // Music control hover with 1.5s delay
  const handleMusicHoverEnter = useCallback(() => {
    musicHoverTimer.current = setTimeout(() => {
      setShowVolumeSlider(true);
    }, 500);
  }, []);

  const handleMusicHoverLeave = useCallback(() => {
    clearTimeout(musicHoverTimer.current);
    setShowVolumeSlider(false);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Track previous game state for animations
  useEffect(() => {
    // Update prevGameStateRef AFTER the animation component has had a chance to compare
    const timer = setTimeout(() => {
      if (gameState) {
        prevGameStateRef.current = JSON.parse(JSON.stringify(gameState));
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [gameState]);

  // Copy game link
  const copyGameLink = () => {
    const url = `${window.location.origin}/mascarade/${gameIdRef.current}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mascarade-board">
      <div className="mascarade-container">

        {/* Sidebar */}
        <div className="mascarade-sidebar">
          <div className="mascarade-players">
            <div className="players-header">
              <span className="players-label">Joueurs</span>
              <span className="players-count"><span className="players-current">{playersReady}</span>/{playersNeeded}</span>
            </div>
            <div className="players-bar">
              <div className="players-bar-fill" style={{ width: `${(playersReady / playersNeeded) * 100}%` }} />
            </div>
            {gameClients.map((c, i) => {
              const isCurrentTurn = gameState?.players?.[gameState?.currentPlayerIndex]?.clientId === c.clientId;
              return (
                <div
                  key={c.clientId}
                  className={`mascarade-player-tag ${isCurrentTurn ? "is-current-turn" : ""}`}
                  style={{
                    color: c.color,
                    ...(isCurrentTurn ? { background: `${c.color}15`, borderColor: `${c.color}30` } : {})
                  }}
                >
                  <img className="player-tag-avatar" src={`https://robohash.org/${encodeURIComponent(c.clientName || 'Joueur')}`} alt="" />
                  <span>{c.clientName || `Joueur ${i + 1}`}</span>
                </div>
              );
            })}
          </div>

          <div className="mascarade-sidebar-buttons">
            <button type="button" onClick={copyGameLink} className={`mascarade-btn-copy ${copied ? "copied" : ""}`} title="Copier le lien">
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              )}
              <span>{copied ? "Copié !" : "Copier le lien"}</span>
            </button>
            <button type="button" onClick={quitGame} className="mascarade-btn-quit">Quitter</button>
          </div>
        </div>

        {/* Game area wrapper (main + center cards) */}
        <div className="mascarade-game-area" ref={boardRef} style={!isWaiting ? { backgroundImage: `url(${GamingPlate})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>

        {/* Main area */}
        <div className="mascarade-main">

          {/* Waiting state */}
          {isWaiting && (
            <div className="mascarade-waiting">
              <svg width="130" height="300" viewBox="0 0 260 500" fill="none" overflow="hidden" xmlns="http://www.w3.org/2000/svg">
                <use href="#mcube" x="0" y="210" strokeWidth="2" opacity="0.3">
                  <animate attributeName="stroke" dur="6s" repeatCount="indefinite"
                    values="#95FDFC;#A7F3FC;#B8E8FC;#CADEFD;#DBD3FD;#EDC9FD;#FEBEFD;#EDC9FD;#DBD3FD;#CADEFD;#B8E8FC;#A7F3FC"/>
                </use>
                <use href="#mcube" x="0" y="20" strokeWidth="2">
                  <animate attributeName="stroke" dur="6s" repeatCount="indefinite"
                    values="#95FDFC;#A7F3FC;#B8E8FC;#CADEFD;#DBD3FD;#EDC9FD;#FEBEFD;#EDC9FD;#DBD3FD;#CADEFD;#B8E8FC;#A7F3FC"/>
                </use>
                <defs>
                  <g id="mcube">
                    <use href="#mcube_outline" strokeLinejoin="round" strokeWidth="16" fill="url(#mstars)"/>
                    <use href="#mcube_base" strokeWidth=".5"/>
                    <use href="#mcube_outline" strokeLinejoin="round" strokeWidth="6" stroke="#141417"/>
                  </g>
                  <g id="mcube_outline">
                    <path>
                      <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                        keyTimes="0;0.5;0.5;1"
                        keySplines="0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9"
                        values="M10 64 L128 0 L246 64 L246 192 L128 256 L10 192Z;
                            M40 20 L216 20 L216 108 L216 236 L40 236 L40 172Z;
                            M216 20 L40 20 L40 108 L40 236 L216 236 L216 172Z;
                            M246 64 L128 0 L10 64 L10 192 L128 256 L246 192Z"/>
                    </path>
                  </g>
                  <g id="mcube_base">
                    <path fill="#fff1">
                      <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                        keyTimes="0;0.5;1"
                        keySplines="0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9"
                        values="M10 64 L128 0 L246 64 L128 128Z;
                            M40 20 L216 20 L216 108 L40 108Z;
                            M128 0 L246 64 L128 128 L10 64Z"/>
                    </path>
                    <path>
                      <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                        keyTimes="0;0.5;0.5;1"
                        keySplines="0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9"
                        values="M10 64 L128 128 L128 256 L10 192Z;
                            M40 20 L40 108 L40 236 L40 172Z;
                            M216 20 L216 108 L216 236 L216 172Z;
                            M246 64 L128 128 L128 256 L246 192Z"/>
                      <animate attributeName="fill" dur="1.5s" repeatCount="indefinite" keyTimes="0;0.5;0.5;1"
                        values="#fff0;#fff0;#fff2;#fff2"/>
                    </path>
                    <path fill="#407080">
                      <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                        keyTimes="0;0.5;1"
                        keySplines="0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9"
                        values="M246 64 L128 128 L128 256 L246 192Z;
                            M216 108 L40 108 L40 236 L216 236Z;
                            M128 128 L10 64 L10 192 L128 256Z"/>
                      <animate attributeName="fill" dur="1.5s" repeatCount="indefinite" keyTimes="0;0.5;1"
                        values="#fff2;#fff1;#fff0"/>
                    </path>
                  </g>
                  <linearGradient id="msky" gradientTransform="rotate(90)">
                    <stop offset="0.5" stopColor="#06122F"/>
                    <stop offset="1" stopColor="#06397B"/>
                  </linearGradient>
                  <pattern id="mstars" x="0" y="0" width="50%" height="50%" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                    <rect width="256" height="256" fill="url(#msky)"/>
                    <use href="#mstar01" x="24" y="32" fill="white"/>
                    <use href="#mstar01" x="64" y="96" fill="#ad9dcb" transform="rotate(90 80 112)"/>
                    <use href="#mstar01" x="224" y="102" fill="#ad9dcb"/>
                    <use href="#mstar01" x="192" y="112" fill="#E0E8EA" transform="rotate(90 80 112)"/>
                    <use href="#mstar04" x="64" y="64" fill="white"/>
                    <use href="#mstar04" x="8" y="16" fill="#ad9dcb"/>
                    <use href="#mstar04" x="110" y="96" fill="#E0E8EA"/>
                    <use href="#mstar04" x="64" y="212" fill="white"/>
                    <use href="#mstar04" x="218" y="216" fill="#ad9dcb"/>
                    <use href="#mstar03" x="96" y="16" fill="#E0E8EA"/>
                    <use href="#mstar03" x="228" y="220" fill="#E0E8EA"/>
                    <use href="#mstar03" x="24" y="140" fill="#E0E8EA"/>
                    <use href="#mstar03" x="200" y="136" fill="#E0E8EA"/>
                    <use href="#mstar02" x="16" y="64" fill="#ad9dcb"/>
                    <use href="#mstar02" x="160" y="24" fill="#ad9dcb"/>
                    <use href="#mstar02" x="140" y="128" fill="#ad9dcb"/>
                  </pattern>
                  <path id="mstar01" transform="scale(0.5)">
                    <animate attributeName="d" dur="3s" repeatCount="indefinite" calcMode="spline"
                      keyTimes="0;0.5;1" keySplines="0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9"
                      values="M16 0 Q16 16 24 16 Q16 16 16 32 Q16 16 8 16 Q16 16 16 0Z;
                          M16 8 Q16 16 32 16 Q16 16 16 24 Q16 16 0 16 Q16 16 16 8Z;
                          M16 0 Q16 16 24 16 Q16 16 16 32 Q16 16 8 16 Q16 16 16 0Z"/>
                  </path>
                  <circle id="mstar02">
                    <animate attributeName="r" dur="3s" repeatCount="indefinite" calcMode="spline"
                      keyTimes="0;0.5;1" keySplines="0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9"
                      values="0;2;0"/>
                  </circle>
                  <circle id="mstar03">
                    <animate attributeName="r" dur="6s" repeatCount="indefinite" calcMode="spline"
                      keyTimes="0;0.5;1" keySplines="0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9"
                      values="3;1;3"/>
                  </circle>
                  <circle id="mstar04" r="1"/>
                </defs>
              </svg>
              <p className="mascarade-wait-pulse">En attente de joueurs... ({playersReady}/{playersNeeded})</p>
              <p className="mascarade-wait-sub">Partagez le lien pour inviter des joueurs</p>
            </div>
          )}

          {/* Game board */}
          {!isWaiting && gameState && (
            <>
              <div className="mascarade-main-row">
                {/* Left panel: turn banner + actions */}
                <div className="mascarade-left-panel">
                  {/* Turn indicator banner */}
                  {(() => {
                    const noTurnPhases = ["MEMORIZATION", "GAME_OVER", "CONTESTATION"];
                    const powerPhases = ["POWER_TARGET", "POWER_TARGET_2", "ESPIONNE_DECISION", "FOU_SWAP_DECISION"];

                    if (noTurnPhases.includes(gamePhase)) return null;

                    // During GOUROU_GUESS, the target is the active player
                    if (gamePhase === "GOUROU_GUESS") {
                      const targetIdx = gameState.powerState?.targetIdx;
                      if (targetIdx === myPlayerIndex) {
                        return <div className="mascarade-turn-banner">Devinez votre masque !</div>;
                      }
                      return (
                        <div className="mascarade-turn-banner other-turn">
                          {gameState.players[targetIdx]?.clientName} doit deviner son masque...
                        </div>
                      );
                    }

                    // During power phases, the executor is the active player
                    if (powerPhases.includes(gamePhase)) {
                      const executorIdx = gameState.powerState?.executorIdx;
                      if (executorIdx === myPlayerIndex) {
                        return <div className="mascarade-turn-banner">Activez votre pouvoir !</div>;
                      }
                      return (
                        <div className="mascarade-turn-banner other-turn">
                          {gameState.players[executorIdx]?.clientName} active son pouvoir...
                        </div>
                      );
                    }

                    // Normal turn phases (PREPARATORY, ACTION_SELECT)
                    if (isMyTurn) {
                      return (
                        <div className="mascarade-turn-banner">
                          C'est votre tour !
                          {gameState.firstRealTurn && gamePhase === "ACTION_SELECT" && (
                            <span className="turn-banner-sub"> (Annonce interdite ce tour)</span>
                          )}
                        </div>
                      );
                    }
                    return (
                      <div className="mascarade-turn-banner other-turn">
                        Tour de {gameState.players[gameState.currentPlayerIndex]?.clientName}
                      </div>
                    );
                  })()}

                  {/* Action panel */}
                  {gamePhase === "MEMORIZATION" && isOwner && (
                    <div className="mascarade-memorization">
                      <p>Mémorisez les masques de chaque joueur !</p>
                      <button
                        type="button"
                        className="mascarade-btn-start"
                        onClick={() => sendAction({ type: "start_game" })}
                      >
                        Commencer la partie
                      </button>
                    </div>
                  )}

                  {gamePhase === "MEMORIZATION" && !isOwner && (
                    <div className="mascarade-memorization">
                      <p>Mémorisez les masques de chaque joueur !</p>
                      <p className="mascarade-wait-sub">En attente de l'hôte...</p>
                    </div>
                  )}

                  {(gamePhase === "PREPARATORY" || gamePhase === "ACTION_SELECT" ||
                    gamePhase === "POWER_TARGET" || gamePhase === "POWER_TARGET_2" ||
                    gamePhase === "FOU_SWAP_DECISION" || gamePhase === "ESPIONNE_DECISION" ||
                    gamePhase === "GOUROU_GUESS" || gamePhase === "LOOK_ACKNOWLEDGE") && (
                    <MascaradeActions
                      gameState={gameState}
                      myPlayerIndex={myPlayerIndex}
                      isMyTurn={isMyTurn}
                      sendAction={sendAction}
                      espionneReveal={espionneReveal}
                      setEspionneReveal={setEspionneReveal}
                      gameClients={gameClients}
                      onHighlight={setPickerHighlight}
                      actionCooldown={actionCooldown}
                    />
                  )}

                  {gamePhase === "CONTESTATION" && (
                    <MascaradeContestation
                      gameState={gameState}
                      myPlayerIndex={myPlayerIndex}
                      sendAction={sendAction}
                      gameClients={gameClients}
                    />
                  )}

                  {/* Contest result — inline in left panel */}
                  {contestResult && (
                    <div className="contest-result-panel">
                      <h4 className="contest-result-title">Résultat de la contestation</h4>
                      <div className="contest-result-reveals">
                        {contestResult.reveals?.map((r, i) => {
                          const client = gameClients.find(c => c.clientId === gameState.players[r.playerIndex]?.clientId);
                          return (
                            <div key={i} className={`contest-result-player ${r.mask === contestResult.announcedMask ? "is-true" : "is-liar"}`}>
                              <img className="contest-result-card-img" src={MASK_IMAGES[r.mask] || CARD_VERSO} alt={MASK_NAMES[r.mask] || r.mask} />
                              <div className="contest-result-info">
                                <span className="contest-result-name" style={{ color: client?.color }}>{gameState.players[r.playerIndex]?.clientName}</span>
                                <span className="contest-result-mask">{MASK_NAMES[r.mask]}</span>
                                {r.mask === contestResult.announcedMask
                                  ? <span className="contest-result-badge true-badge">Vrai !</span>
                                  : <span className="contest-result-badge liar-badge">-1 🪙</span>
                                }
                              </div>
                            </div>
                          );
                        })}
                        {contestResult.trueOwnerIdx === null && (
                          <p className="contest-result-nobody">Personne n'avait le masque ! Tous paient 1 pièce.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {gamePhase === "GAME_OVER" && (
                    <div className="mascarade-gameover">
                      <h3>Partie terminée !</h3>

                      {/* Players sorted: winner first, then by coins descending */}
                      <div className="gameover-ranking">
                        {[...gameState.players.map((p, i) => ({ ...p, idx: i }))]
                          .sort((a, b) => {
                            if (a.idx === gameState.winner) return -1;
                            if (b.idx === gameState.winner) return 1;
                            return b.coins - a.coins;
                          })
                          .map((p, rank) => {
                            const client = gameClients.find(c => c.clientId === p.clientId);
                            const isWinner = p.idx === gameState.winner;
                            return (
                              <div key={p.idx} className={`gameover-row ${isWinner ? "is-winner" : ""}`}>
                                <span className="gameover-rank">{isWinner ? "👑" : `#${rank + 1}`}</span>
                                <img className="gameover-card-img" src={MASK_IMAGES[p.mask] || CARD_VERSO} alt={MASK_NAMES[p.mask] || p.mask} />
                                <div className="gameover-info">
                                  <span className="gameover-name" style={{ color: client?.color }}>{p.clientName}</span>
                                  <span className="gameover-mask">{MASK_NAMES[p.mask] || p.mask}</span>
                                </div>
                                <span className="gameover-coins">{p.coins} 🪙</span>
                              </div>
                            );
                          })}
                      </div>

                      <div className="gameover-buttons">
                        <button type="button" className="action-btn look-btn" onClick={() => setDebugLogOpen(true)}>Journal complet</button>
                        <button type="button" className="action-btn announce-btn" onClick={quitGame}>Retour aux jeux</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Board */}
                <div className="mascarade-board-wrapper">
                  <MascaradeBoard
                    gameState={gameState}
                    gameClients={gameClients}
                    myPlayerIndex={myPlayerIndex}
                    revealData={revealData}
                    lookResult={lookResult}
                    onCardClick={setCardDetailMask}
                    onCardHover={(mask, rect) => setCardTooltip({ mask, x: rect.left + rect.width / 2, y: rect.top })}
                    onCardLeave={() => setCardTooltip(null)}
                    pickerHighlight={pickerHighlight}
                  />
                </div>
              </div>

              {/* Debug log modal */}
              {debugLogOpen && (
                <div className="debug-log-modal" onClick={() => setDebugLogOpen(false)}>
                  <div className="debug-log-content" onClick={(e) => e.stopPropagation()}>
                    <h3>Journal complet de la partie</h3>

                    <div className="debug-log-players">
                      <h4>Masques finaux</h4>
                      {gameState.players.map((p, i) => {
                        const client = gameClients.find(c => c.clientId === p.clientId);
                        return (
                          <div key={i} className="debug-player-row">
                            <span style={{ color: client?.color }}>{p.clientName}</span>
                            <span className="debug-mask-label">
                              {MASK_CHIBIS[p.mask] ? <img className="debug-chibi" src={MASK_CHIBIS[p.mask]} alt={MASK_NAMES[p.mask]} /> : MASK_ICONS[p.mask]} {MASK_NAMES[p.mask]}
                            </span>
                            <span>{p.coins} pièces</span>
                          </div>
                        );
                      })}
                      {gameState.centerCards && gameState.centerCards.length > 0 && (
                        <div className="debug-center-cards">
                          <strong>Centre :</strong> {gameState.centerCards.map((c, i) => (
                            <span key={i} className="debug-mask-label" style={{ marginLeft: i > 0 ? "0.5rem" : 0 }}>
                              {MASK_CHIBIS[c] ? <img className="debug-chibi" src={MASK_CHIBIS[c]} alt={MASK_NAMES[c]} /> : MASK_ICONS[c]} {MASK_NAMES[c]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="debug-log-entries">
                      <h4>Historique des tours</h4>
                      {gameLog.map((entry, i) => (
                        <div key={i} className="debug-log-entry">
                          <span className="debug-log-turn">T{entry.turn}</span>
                          <span className="debug-log-msg">{entry.message}</span>
                        </div>
                      ))}
                    </div>

                    <button type="button" className="look-modal-close" onClick={() => setDebugLogOpen(false)}>Fermer</button>
                  </div>
                </div>
              )}

              {/* Log is in the right sidebar, masks-ref between main and log */}


            </>
          )}
        </div>

        {/* Center cards — between board and masks ref */}
        {!isWaiting && gameState && gameState.centerCardCount > 0 && (
          <div className="center-cards-zone">
            <span className="center-cards-label">Centre</span>
            <div className="center-cards">
              {(gameState.phase === "MEMORIZATION" && gameState.centerCards ? gameState.centerCards : Array(gameState.centerCardCount).fill("hidden")).map((card, i) => (
                <div
                  key={i}
                  data-center-index={i}
                  className={`mask-card ${card !== "hidden" ? "face-up" : "face-down"} ${pickerHighlight?.type === "center" && pickerHighlight?.index === i ? "picker-highlighted" : ""}`}
                  onClick={card !== "hidden" ? () => setCardDetailMask(card) : undefined}
                  onMouseEnter={card !== "hidden" ? (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setCardTooltip({ mask: card, x: rect.left + rect.width / 2, y: rect.top });
                  } : undefined}
                  onMouseLeave={card !== "hidden" ? () => setCardTooltip(null) : undefined}
                  style={card !== "hidden" ? { cursor: "pointer" } : undefined}
                >
                  {card !== "hidden" ? (
                    <div className="mask-card-content">
                      <img className="mask-card-img" src={MASK_IMAGES[card]} alt={MASK_NAMES[card] || card} />
                    </div>
                  ) : (
                    <div className="mask-card-back-content">
                      <img className="mask-card-img" src={CARD_VERSO} alt="Carte cachée" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

          {/* Music control */}
          {!isWaiting && <div
            className={`mascarade-music-control ${musicPlaying ? "playing" : ""} ${showVolumeSlider ? "show-slider" : ""}`}
            onMouseEnter={handleMusicHoverEnter}
            onMouseLeave={handleMusicHoverLeave}
          >
            <button type="button" className="music-icon-btn" onClick={toggleMusic} title={musicPlaying ? "Couper la musique" : "Activer la musique"}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                {musicPlaying ? (
                  <>
                    <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
                    <circle cx="10" cy="17" r="3"/>
                  </>
                ) : (
                  <>
                    <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" opacity="0.4"/>
                    <circle cx="10" cy="17" r="3" opacity="0.4"/>
                    <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </>
                )}
              </svg>
            </button>
            <div className="music-volume-slider">
              <div className="volume-track">
                <div className="volume-fill" style={{ width: `${musicVolume * 100}%` }} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicVolume}
                  onChange={handleVolumeChange}
                  className="volume-range"
                />
              </div>
            </div>
          </div>}
          {/* Game animations overlay */}
          <MascaradeAnimations
            gameState={gameState}
            prevGameStateRef={prevGameStateRef}
            boardRef={boardRef}
            myPlayerIndex={myPlayerIndex}
          />

          {/* Victory / Defeat overlay */}
          {gamePhase === "GAME_OVER" && gameState?.winner !== undefined && (() => {
            const isWinner = myPlayerIndex === gameState.winner;
            return (
              <div className={`game-result-overlay ${isWinner ? "victory" : "defeat"}`}>
                <img className="game-result-back" src={isWinner ? VictoryBack : DefeatBack} alt="" />
                <img className="game-result-front" src={isWinner ? VictoryFront : DefeatFront} alt="" />
              </div>
            );
          })()}
        </div>{/* end mascarade-game-area */}

        {/* Masks reference — vertical strip */}
        {!isWaiting && gameState && gameState.scenarioMasks && gamePhase !== "GAME_OVER" && (
          <div className="mascarade-masks-ref">
            <h4 className="masks-ref-title">Masques</h4>
            <div className="masks-ref-scroll">
              <div className="masks-ref-list">
                {gameState.scenarioMasks.map((mask, i) => (
                  <div key={`${mask}-${i}`} className="masks-ref-item">
                    <div className="masks-ref-icon"
                      onClick={() => setCardDetailMask(mask)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMaskTooltip({ mask, x: rect.left, y: rect.top + rect.height / 2 });
                      }}
                      onMouseLeave={() => setMaskTooltip(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {MASK_CHIBIS[mask] ? <img className="masks-ref-chibi" src={MASK_CHIBIS[mask]} alt={MASK_NAMES[mask] || mask} /> : (MASK_ICONS[mask] || "🎭")}
                    </div>
                    <span className="masks-ref-name">{MASK_NAMES[mask] || mask}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right sidebar — Journal */}
        {!isWaiting && gameState && (
          <div className="mascarade-log-sidebar">
            <MascaradeLog log={gameLog} gameClients={gameClients} />
          </div>
        )}
      </div>

      {/* Mask tooltip (portal to body to escape any containing block) */}
      {maskTooltip && createPortal(
        <div className="masks-ref-tooltip-fixed" style={{ top: maskTooltip.y, left: maskTooltip.x }}>
          <strong>{MASK_NAMES[maskTooltip.mask]}</strong>
          <span>{MASK_DESCRIPTIONS[maskTooltip.mask]}</span>
        </div>,
        document.body
      )}

      {/* Card hover tooltip (portal to body) */}
      {cardTooltip && createPortal(
        <div className="card-tooltip-fixed" style={{ top: cardTooltip.y, left: cardTooltip.x }}>
          <strong>{MASK_NAMES[cardTooltip.mask]}</strong>
          <span>{MASK_DESCRIPTIONS[cardTooltip.mask]}</span>
        </div>,
        document.body
      )}

      {/* Look result modal — 3D card (portaled to escape containing block) */}
      {lookModal && createPortal(
        <Card3DModal
          mask={lookModal}
          label="Votre masque est..."
          showAcknowledge
          onClose={() => {
            sendAction({ type: "look_acknowledge" });
            setLookModal(null);
            setLookResult(null);
          }}
        />,
        document.body
      )}

      {/* Card detail modal (click on visible card) — 3D interactive */}
      {cardDetailMask && createPortal(
        <Card3DModal mask={cardDetailMask} onClose={() => setCardDetailMask(null)} />,
        document.body
      )}

      {/* Join dialog for anonymous users */}
      <Transition.Root show={joinOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" initialFocus={cancelJoinButtonRef} onClose={setJoinOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-darker border border-white border-opacity-10 px-6 py-6 text-left shadow-xl transition-all w-full max-w-sm">
                  <Dialog.Title as="h3" className="text-lg font-title font-semibold text-white mb-4">
                    Rejoindre la partie
                  </Dialog.Title>
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
                    <button
                      type="button"
                      ref={cancelJoinButtonRef}
                      className="px-4 py-2 rounded-full bg-white bg-opacity-5 text-white font-sans text-sm hover:bg-opacity-10 transition-all duration-300"
                      onClick={() => { setJoinOpen(false); navigate("/games"); }}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="main-btn"
                      onClick={() => joinGame(clientName)}
                    >
                      Rejoindre
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
