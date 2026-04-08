import { useState, useEffect } from "react";
import { MASK_NAMES, MASK_DESCRIPTIONS, MASK_ICONS, MASK_IMAGES, CARD_VERSO } from "./mascaradeConstants.js";

function PlayerPicker({ players, myPlayerIndex, gameClients, validTargets, onPick, label, onHighlight }) {
  return (
    <div className="mascarade-picker">
      <p className="picker-label">{label}</p>
      <div className="picker-grid">
        {players.map((p, i) => {
          const isValid = validTargets ? validTargets.includes(i) : i !== myPlayerIndex;
          if (!isValid) return null;
          const client = gameClients.find(c => c.clientId === p.clientId);
          return (
            <button
              type="button"
              key={i}
              className="picker-player"
              style={{ borderColor: client?.color || "#fff" }}
              onClick={() => onPick(i)}
              onMouseEnter={() => onHighlight?.({ type: "player", index: i })}
              onMouseLeave={() => onHighlight?.(null)}
            >
              <img className="picker-avatar" src={`https://robohash.org/${encodeURIComponent(p.clientName || 'Joueur')}`} alt="" />
              {p.clientName}
              <span className="picker-coins">{p.coins} pi&egrave;ces</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SwapConfirm({ onConfirm }) {
  return (
    <div className="mascarade-swap-confirm">
      <p>Que voulez-vous faire ?</p>
      <div className="swap-buttons">
        <button type="button" className="action-btn swap-btn" onClick={() => onConfirm(true)}>Échanger</button>
        <button type="button" className="action-btn pretend-btn" onClick={() => onConfirm(false)}>Faire semblant</button>
      </div>
    </div>
  );
}

function CenterCardPicker({ centerCardCount, onPick, label, onHighlight }) {
  return (
    <div className="mascarade-picker">
      <p className="picker-label">{label}</p>
      <div className="picker-grid">
        {Array(centerCardCount).fill(null).map((_, i) => (
          <button
            type="button"
            key={i}
            className="picker-center-card"
            onClick={() => onPick(i)}
            onMouseEnter={() => onHighlight?.({ type: "center", index: i })}
            onMouseLeave={() => onHighlight?.(null)}
          >
            <img className="picker-center-img" src={CARD_VERSO} alt="Carte cachée" />
            <span className="picker-center-label">#{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MaskPicker({ scenarioMasks, onPick, label }) {
  return (
    <div className="mascarade-picker">
      <p className="picker-label">{label}</p>
      <div className="mask-grid">
        {(scenarioMasks || []).map((mask, i) => (
          <button type="button" key={`${mask}-${i}`} className="mask-option" onClick={() => onPick(mask)}>
            <img className="mask-option-img" src={MASK_IMAGES[mask]} alt={MASK_NAMES[mask] || mask} />
            <span className="mask-option-name">{MASK_NAMES[mask] || mask}</span>
            <span className="mask-option-desc">{MASK_DESCRIPTIONS[mask] || ""}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function WaitingForPlayer({ playerIdx, color, name, avatarName, label, onHighlight }) {
  return (
    <div className="mascarade-actions">
      <div className="waiting-for-player">
        {label && <p className="waiting-label">{label}</p>}
        <div className="waiting-player-card"
          onMouseEnter={() => onHighlight?.({ type: "player", index: playerIdx })}
          onMouseLeave={() => onHighlight?.(null)}
        >
          <img
            className="waiting-avatar"
            src={`https://robohash.org/${encodeURIComponent(avatarName || 'Joueur')}`}
            alt=""
          />
          <span className="waiting-name" style={{ color }}>{name}</span>
        </div>
      </div>
    </div>
  );
}

function HoverName({ playerIdx, color, name, onHighlight }) {
  return (
    <strong
      style={{ color, cursor: "pointer" }}
      onMouseEnter={() => onHighlight?.({ type: "player", index: playerIdx })}
      onMouseLeave={() => onHighlight?.(null)}
    >
      {name}
    </strong>
  );
}

export default function MascaradeActions({ gameState, myPlayerIndex, isMyTurn, sendAction, espionneReveal, setEspionneReveal, gameClients, onHighlight, actionCooldown }) {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedTarget2, setSelectedTarget2] = useState(null);
  const [swapChoice, setSwapChoice] = useState(null); // "swap" or "pretend"
  const [actionStep, setActionStep] = useState(null); // null, "pick_target", "swap_confirm", "pick_mask", "pick_target_2"

  const phase = gameState.phase;
  const players = gameState.players;
  const currentPlayer = players[gameState.currentPlayerIndex];
  const myPlayer = players[myPlayerIndex];

  const resetState = () => {
    setSelectedTarget(null);
    setSelectedTarget2(null);
    setSwapChoice(null);
    setActionStep(null);
  };

  // Reset local state when phase or current player changes
  useEffect(() => {
    resetState();
  }, [phase, gameState.currentPlayerIndex]);

  const hasCenterCards = gameState.centerCardCount > 0;

  const isHiddenMode = gameState.hiddenMode;

  const currentPlayerIdx = gameState.currentPlayerIndex;
  const currentColor = gameClients.find(c => c.clientId === currentPlayer.clientId)?.color;

  // Common props for PlayerPicker
  const pickerProps = { players, myPlayerIndex, gameClients, onHighlight };

  // Block actions during cooldown (e.g. after contestation reveal)
  if (actionCooldown && isMyTurn) {
    return (
      <div className="mascarade-actions">
        <p className="action-info action-cooldown">Veuillez patienter...</p>
      </div>
    );
  }

  // --- PREPARATORY PHASE ---
  if (phase === "PREPARATORY") {
    if (!isMyTurn) {
      return (
        <WaitingForPlayer
          playerIdx={currentPlayerIdx}
          color={currentColor}
          name={currentPlayer.clientName}
          avatarName={currentPlayer.clientName}
          label="Phase préparatoire"
          onHighlight={onHighlight}
        />
      );
    }

    if (!actionStep) {
      return (
        <div className="mascarade-actions">
          <p className="action-info">
            {isHiddenMode
              ? "Phase préparatoire — Regardez votre carte ou échangez"
              : "Phase préparatoire — Choisissez un joueur avec qui échanger (ou faire semblant)"}
          </p>
          {isHiddenMode && (
            <div className="action-buttons" style={{ marginBottom: "0.5rem" }}>
              <button type="button" className="action-btn look-btn" onClick={() => { sendAction({ type: "preparatory_look" }); }}>
                Regarder mon masque
              </button>
            </div>
          )}
          <PlayerPicker
            {...pickerProps}
            onPick={(idx) => { setSelectedTarget(idx); setActionStep("swap_confirm"); }}
            label="Choisissez un joueur"
          />
          {hasCenterCards && (
            <CenterCardPicker
              centerCardCount={gameState.centerCardCount}
              onPick={(idx) => { setSelectedTarget(idx); setActionStep("swap_confirm_center"); }}
              label="Ou une carte du centre"
              onHighlight={onHighlight}
            />
          )}
        </div>
      );
    }

    if (actionStep === "swap_confirm") {
      return (
        <div className="mascarade-actions">
          <p className="action-info">Échangez avec {players[selectedTarget]?.clientName} ?</p>
          <SwapConfirm onConfirm={(didSwap) => {
            sendAction({ type: "preparatory_swap", targetIndex: selectedTarget, didSwap });
            resetState();
          }} />
          <button type="button" className="action-btn-back" onClick={resetState}>Retour</button>
        </div>
      );
    }

    if (actionStep === "swap_confirm_center") {
      return (
        <div className="mascarade-actions">
          <p className="action-info">Échangez avec la carte du centre {selectedTarget + 1} ?</p>
          <SwapConfirm onConfirm={(didSwap) => {
            sendAction({ type: "preparatory_swap", targetIndex: selectedTarget, didSwap, isCenter: true });
            resetState();
          }} />
          <button type="button" className="action-btn-back" onClick={resetState}>Retour</button>
        </div>
      );
    }
  }

  // --- ACTION SELECT PHASE ---
  if (phase === "ACTION_SELECT") {
    if (!isMyTurn) {
      return (
        <WaitingForPlayer
          playerIdx={currentPlayerIdx}
          color={currentColor}
          name={currentPlayer.clientName}
          avatarName={currentPlayer.clientName}
          onHighlight={onHighlight}
        />
      );
    }

    // Must look
    if (myPlayer.mustLookNextTurn) {
      return (
        <div className="mascarade-actions">
          <p className="action-info">Vous devez regarder votre masque ce tour-ci</p>
          <button type="button" className="action-btn look-btn" onClick={() => { sendAction({ type: "look" }); resetState(); }}>
            Regarder mon masque
          </button>
        </div>
      );
    }

    // Choose action
    if (!actionStep) {
      return (
        <div className="mascarade-actions">
          <p className="action-info">Choisissez votre action</p>
          <div className="action-buttons">
            <button type="button" className="action-btn look-btn" onClick={() => { sendAction({ type: "look" }); resetState(); }}>
              Regarder
            </button>
            <button type="button" className="action-btn swap-btn" onClick={() => setActionStep("pick_target")}>
              Échanger
            </button>
            {!myPlayer.cannotAnnounceThisTurn && !gameState.firstRealTurn && (
              <button type="button" className="action-btn announce-btn" onClick={() => setActionStep("pick_mask")}>
                Annoncer
              </button>
            )}
          </div>
        </div>
      );
    }

    // Pick target for swap
    if (actionStep === "pick_target") {
      return (
        <div className="mascarade-actions">
          <PlayerPicker
            {...pickerProps}
            onPick={(idx) => { setSelectedTarget(idx); setActionStep("swap_confirm_action"); }}
            label="Choisissez un joueur pour l'échange"
          />
          {hasCenterCards && (
            <CenterCardPicker
              centerCardCount={gameState.centerCardCount}
              onPick={(idx) => { setSelectedTarget(idx); setActionStep("swap_confirm_center_action"); }}
              label="Ou une carte du centre"
              onHighlight={onHighlight}
            />
          )}
          <button type="button" className="action-btn-back" onClick={resetState}>Retour</button>
        </div>
      );
    }

    // Confirm swap with player
    if (actionStep === "swap_confirm_action") {
      return (
        <div className="mascarade-actions">
          <p className="action-info">Échangez avec {players[selectedTarget]?.clientName} ?</p>
          <SwapConfirm onConfirm={(didSwap) => {
            sendAction({ type: "swap", targetIndex: selectedTarget, didSwap });
            resetState();
          }} />
          <button type="button" className="action-btn-back" onClick={resetState}>Retour</button>
        </div>
      );
    }

    // Confirm swap with center card
    if (actionStep === "swap_confirm_center_action") {
      return (
        <div className="mascarade-actions">
          <p className="action-info">Échangez avec la carte du centre {selectedTarget + 1} ?</p>
          <SwapConfirm onConfirm={(didSwap) => {
            sendAction({ type: "swap_center", centerIndex: selectedTarget, didSwap });
            resetState();
          }} />
          <button type="button" className="action-btn-back" onClick={resetState}>Retour</button>
        </div>
      );
    }

    // Pick mask to announce — full-screen popup overlay
    if (actionStep === "pick_mask") {
      return (
        <>
          <div className="mascarade-actions">
            <p className="action-info">Choisissez un masque à annoncer...</p>
          </div>
          <div className="mask-picker-overlay" onClick={resetState}>
            <div className="mask-picker-popup" onClick={(e) => e.stopPropagation()}>
              <h3 className="mask-picker-title">Quel masque annoncez-vous ?</h3>
              <div className="mask-picker-grid">
                {(gameState.scenarioMasks || []).map((mask, i) => (
                  <button
                    type="button"
                    key={`${mask}-${i}`}
                    className="mask-picker-card"
                    onClick={() => { sendAction({ type: "announce", maskName: mask }); resetState(); }}
                  >
                    <img className="mask-picker-card-img" src={MASK_IMAGES[mask]} alt={MASK_NAMES[mask] || mask} />
                    {/* <span className="mask-picker-card-name">{MASK_NAMES[mask] || mask}</span> */}
                    <span className="mask-picker-card-desc">{MASK_DESCRIPTIONS[mask] || ""}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="mask-picker-back" onClick={resetState}>Retour</button>
            </div>
          </div>
        </>
      );
    }
  }

  // --- POWER TARGET PHASE ---
  if (phase === "POWER_TARGET") {
    const ps = gameState.powerState;
    if (!ps || ps.executorIdx !== myPlayerIndex) {
      const exIdx = ps?.executorIdx;
      const exColor = gameClients.find(c => c.clientId === players[exIdx]?.clientId)?.color;
      return (
        <div className="mascarade-actions">
          <p className="action-info">
            <HoverName playerIdx={exIdx} color={exColor} name={players[exIdx]?.clientName} onHighlight={onHighlight} /> choisit une cible...
          </p>
        </div>
      );
    }

    return (
      <div className="mascarade-actions">
        <PlayerPicker
          {...pickerProps}
          validTargets={ps.validTargets}
          onPick={(idx) => { sendAction({ type: "power_target", targetIndex: idx }); resetState(); }}
          label="Choisissez une cible pour votre pouvoir"
        />
      </div>
    );
  }

  // --- POWER TARGET 2 (2 targets needed) ---
  if (phase === "POWER_TARGET_2") {
    const ps = gameState.powerState;
    if (!ps || ps.executorIdx !== myPlayerIndex) {
      const exIdx = ps?.executorIdx;
      const exColor = gameClients.find(c => c.clientId === players[exIdx]?.clientId)?.color;
      return (
        <div className="mascarade-actions">
          <p className="action-info">
            <HoverName playerIdx={exIdx} color={exColor} name={players[exIdx]?.clientName} onHighlight={onHighlight} /> choisit ses cibles...
          </p>
        </div>
      );
    }

    const selected = ps.selectedTargets || [];
    return (
      <div className="mascarade-actions">
        <PlayerPicker
          {...pickerProps}
          validTargets={ps.validTargets?.filter(t => !selected.includes(t))}
          onPick={(idx) => { sendAction({ type: "power_targets", targetIndex: idx }); }}
          label={`Choisissez une cible (${selected.length + 1}/2)`}
        />
      </div>
    );
  }

  // --- FOU SWAP DECISION ---
  if (phase === "FOU_SWAP_DECISION") {
    const ps = gameState.powerState;
    if (!ps || ps.executorIdx !== myPlayerIndex) {
      return <div className="mascarade-actions"><p className="action-info">Le Fou décide...</p></div>;
    }

    return (
      <div className="mascarade-actions">
        <p className="action-info">Échangez les cartes des deux joueurs sélectionnés ?</p>
        <SwapConfirm onConfirm={(didSwap) => {
          sendAction({ type: "fou_swap", didSwap });
          resetState();
        }} />
      </div>
    );
  }

  // --- ESPIONNE DECISION ---
  if (phase === "ESPIONNE_DECISION") {
    const ps = gameState.powerState;
    if (!ps || ps.executorIdx !== myPlayerIndex) {
      return <div className="mascarade-actions"><p className="action-info">L'Espionne décide...</p></div>;
    }

    return (
      <div className="mascarade-actions">
        {espionneReveal && (
          <div className="espionne-reveal">
            <p>Votre masque : <strong>{MASK_NAMES[espionneReveal.yourMask]}</strong></p>
            <p>Masque de {players[espionneReveal.targetIndex]?.clientName} : <strong>{MASK_NAMES[espionneReveal.targetMask]}</strong></p>
          </div>
        )}
        <p className="action-info">Voulez-vous échanger ?</p>
        <div className="swap-buttons">
          <button type="button" className="action-btn swap-btn" onClick={() => {
            sendAction({ type: "espionne_decision", doSwap: true });
            setEspionneReveal(null);
            resetState();
          }}>Échanger</button>
          <button type="button" className="action-btn pretend-btn" onClick={() => {
            sendAction({ type: "espionne_decision", doSwap: false });
            setEspionneReveal(null);
            resetState();
          }}>Ne pas échanger</button>
        </div>
      </div>
    );
  }

  // --- LOOK ACKNOWLEDGE (game paused while player views their card) ---
  if (phase === "LOOK_ACKNOWLEDGE") {
    if (gameState.lookAckPlayerIdx === myPlayerIndex) {
      return null; // The Card3DModal is shown as an overlay
    }
    const lookPlayer = players[gameState.lookAckPlayerIdx];
    const lookColor = gameClients.find(c => c.clientId === lookPlayer?.clientId)?.color;
    return (
      <div className="mascarade-actions">
        <p className="action-info">
          <HoverName playerIdx={gameState.lookAckPlayerIdx} color={lookColor} name={lookPlayer?.clientName} onHighlight={onHighlight} /> regarde son masque...
        </p>
      </div>
    );
  }

  // --- GOUROU GUESS ---
  if (phase === "GOUROU_GUESS") {
    const ps = gameState.powerState;
    if (!ps || ps.targetIdx !== myPlayerIndex) {
      return <div className="mascarade-actions"><p className="action-info">La cible du Gourou doit deviner son masque...</p></div>;
    }

    return (
      <div className="mascarade-actions">
        <MaskPicker
          scenarioMasks={gameState.scenarioMasks}
          onPick={(mask) => { sendAction({ type: "gourou_guess", guessedMask: mask }); resetState(); }}
          label="Le Gourou vous désigne ! Devinez votre masque :"
        />
      </div>
    );
  }

  return null;
}
