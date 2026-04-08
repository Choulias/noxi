import { useState, useEffect, useRef, useCallback } from "react";
import { CARD_VERSO, MASK_IMAGES, MASK_NAMES } from "./mascaradeConstants.js";

/**
 * Overlay component that renders game animations.
 * Uses a ref for animation storage (immune to React state resets)
 * and a counter state to trigger re-renders.
 */
export default function MascaradeAnimations({ gameState, prevGameStateRef, boardRef, myPlayerIndex }) {
  const animationsRef = useRef([]);
  const [, setTick] = useState(0);
  const animIdRef = useRef(0);
  const prevPhaseRef = useRef(null);


  const addAnimations = useCallback((newAnims) => {
    animationsRef.current = [...animationsRef.current, ...newAnims];
    setTick(t => t + 1);
    const maxDur = Math.max(...newAnims.map(a => (a.duration || 0) + (a.delay || 0)));
    setTimeout(() => {
      const ids = new Set(newAnims.map(a => a.id));
      animationsRef.current = animationsRef.current.filter(x => !ids.has(x.id));
      setTick(t => t + 1);
    }, maxDur + 200);
  }, []);

  // --- Deal animation: detect WAITING → MEMORIZATION/PREPARATORY ---
  useEffect(() => {
    if (!gameState) return;
    const currPhase = gameState.phase;
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = currPhase;

    const isDeal = (prevPhase === "WAITING" || prevPhase === null) && (currPhase === "MEMORIZATION" || currPhase === "PREPARATORY");
    if (!isDeal) return;

    const timer = setTimeout(() => {
      if (!boardRef.current) return;
      const boardRect = boardRef.current.getBoundingClientRect();
      const center = { x: boardRect.width / 2, y: boardRect.height / 2 };
      const dealAnims = [];
      const cardDuration = 800;
      const playerCount = gameState.players.length;

      // Hide all player cards before dealing
      for (let i = 0; i < playerCount; i++) {
        const cardEl = boardRef.current.querySelector(`[data-player-index="${i}"] .mask-card`);
        if (cardEl) {
          cardEl.style.opacity = "0";
          cardEl.style.transition = "opacity 0.3s ease";
        }
      }

      for (let i = 0; i < playerCount; i++) {
        const el = boardRef.current.querySelector(`[data-player-index="${i}"]`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const pos = { x: r.left + r.width / 2 - boardRect.left, y: r.top + r.height / 2 - boardRect.top };
        const id = ++animIdRef.current;
        // Sequential: each card starts when the previous one finishes
        dealAnims.push({ id, type: "card_deal", from: center, to: pos, delay: i * cardDuration, duration: cardDuration, playerIdx: i });
      }

      if (dealAnims.length > 0) {
        addAnimations(dealAnims);

        // Reveal each player's real card when their animation lands
        for (const anim of dealAnims) {
          setTimeout(() => {
            const cardEl = boardRef.current?.querySelector(`[data-player-index="${anim.playerIdx}"] .mask-card`);
            if (cardEl) cardEl.style.opacity = "1";
          }, anim.delay + anim.duration * 0.75);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [gameState?.phase]);

  // --- Main animation detection (swaps, coins, announces, etc.) ---
  useEffect(() => {
    if (!gameState || !prevGameStateRef.current || !boardRef.current) return;
    const prev = prevGameStateRef.current;
    const curr = gameState;
    if (!prev.players || !curr.players) return;

    const newAnims = [];
    const boardRect = boardRef.current.getBoundingClientRect();

    const getPlayerPos = (playerIdx) => {
      const seat = boardRef.current.querySelector(`[data-player-index="${playerIdx}"]`);
      if (!seat) return null;
      const card = seat.querySelector(".mask-card") || seat;
      const r = card.getBoundingClientRect();
      return { x: r.left + r.width / 2 - boardRect.left, y: r.top + r.height / 2 - boardRect.top };
    };

    const getCenterCardPos = (centerIdx) => {
      const el = boardRef.current.querySelector(`[data-center-index="${centerIdx}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - boardRect.left, y: r.top + r.height / 2 - boardRect.top };
      }
      return { x: boardRect.width / 2, y: boardRect.height / 2 };
    };

    const getJusticePos = () => {
      const el = boardRef.current.querySelector(".justice-board");
      if (el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - boardRect.left, y: r.top + r.height / 2 - boardRect.top };
      }
      return { x: boardRect.width / 2, y: boardRect.height / 2 };
    };

    const isNewAction = (type) =>
      curr.lastAction?.type === type &&
      (!prev.lastAction || prev.lastAction.ts !== curr.lastAction.ts);

    // Card swap: phase 1 = take card from target, phase 2 = send card back
    if (isNewAction("swap")) {
      const action = curr.lastAction;
      const playerPos = getPlayerPos(action.from);
      let targetPos = null;
      const isCenter = action.toCenter !== undefined && action.toCenter !== null;
      if (isCenter) {
        targetPos = getCenterCardPos(action.toCenter);
      } else if (action.to !== undefined) {
        targetPos = getPlayerPos(action.to);
      }
      if (playerPos && targetPos) {
        const takeDuration = 700;
        const pause = 800;
        const sendDuration = 700;

        // Hide the target card from the board
        const targetSelector = isCenter
          ? `[data-center-index="${action.toCenter}"] .mask-card, [data-center-index="${action.toCenter}"] img`
          : `[data-player-index="${action.to}"] .mask-card`;
        const targetCardEl = boardRef.current.querySelector(targetSelector);
        if (targetCardEl) {
          targetCardEl.style.opacity = "0";
          targetCardEl.style.transition = "opacity 0.2s ease";
        }

        // Phase 1: card comes FROM target TO active player
        const id1 = ++animIdRef.current;
        newAnims.push({ id: id1, type: "card_swap_take", from: targetPos, to: playerPos, delay: 0, duration: takeDuration });
        // Phase 2: card goes FROM active player BACK TO target
        const id2 = ++animIdRef.current;
        newAnims.push({ id: id2, type: "card_swap_send", from: playerPos, to: targetPos, delay: takeDuration + pause, duration: sendDuration });

        // Reveal the target card when send animation arrives
        setTimeout(() => {
          if (targetCardEl) targetCardEl.style.opacity = "1";
        }, takeDuration + pause + sendDuration * 0.75);
      }
    }

    // Card peek (look)
    if (isNewAction("look")) {
      const pos = getPlayerPos(curr.lastAction.player);
      if (pos) {
        const id = ++animIdRef.current;
        newAnims.push({ id, type: "card_peek", pos, duration: 1000 });
      }
    }

    // Mask announce
    if (isNewAction("announce")) {
      const pos = getPlayerPos(curr.lastAction.player);
      if (pos) {
        const id = ++animIdRef.current;
        newAnims.push({ id, type: "announce", pos, mask: curr.lastAction.mask, duration: 1200 });
      }
    }

    // Game over
    if (curr.phase === "GAME_OVER" && prev.phase !== "GAME_OVER" && curr.winner !== null) {
      const pos = getPlayerPos(curr.winner);
      if (pos) {
        const id = ++animIdRef.current;
        newAnims.push({ id, type: "victory", pos, duration: 2500 });
      }
    }

    // Coin changes
    if (prev.players.length === curr.players.length) {
      const diffs = [];
      for (let i = 0; i < curr.players.length; i++) {
        const prevCoins = prev.players[i].coins;
        const currCoins = curr.players[i].coins;
        if (prevCoins === undefined || currCoins === undefined) continue;
        const diff = currCoins - prevCoins;
        if (diff !== 0) diffs.push({ idx: i, diff });
      }

      const justiceChanged = curr.justiceBoard - (prev.justiceBoard || 0);
      const handled = new Set();

      const losers = diffs.filter(d => d.diff < 0 && justiceChanged === 0);
      const gainers = diffs.filter(d => d.diff > 0 && justiceChanged === 0);

      if (losers.length > 0 && gainers.length > 0) {
        for (const loser of losers) {
          for (const gainer of gainers) {
            const fromPos = getPlayerPos(loser.idx);
            const toPos = getPlayerPos(gainer.idx);
            if (fromPos && toPos) {
              const count = Math.min(Math.abs(loser.diff), gainer.diff);
              const id = ++animIdRef.current;
              newAnims.push({ id, type: "coin_fly", from: fromPos, to: toPos, count, duration: 900 });
            }
          }
          handled.add(loser.idx);
        }
        for (const gainer of gainers) handled.add(gainer.idx);
      }

      for (const { idx, diff } of diffs) {
        if (handled.has(idx)) continue;
        const playerPos = getPlayerPos(idx);
        if (!playerPos) continue;

        if (diff < 0) {
          if (justiceChanged > 0) {
            const id = ++animIdRef.current;
            newAnims.push({ id, type: "coin_fly", from: playerPos, to: getJusticePos(), count: Math.abs(diff), duration: 900 });
          } else {
            const id = ++animIdRef.current;
            newAnims.push({ id, type: "coin_loss", pos: playerPos, count: Math.abs(diff), duration: 700 });
          }
        } else {
          if (justiceChanged < 0) {
            const id = ++animIdRef.current;
            newAnims.push({ id, type: "coin_fly", from: getJusticePos(), to: playerPos, count: diff, duration: 900 });
          } else {
            const id = ++animIdRef.current;
            newAnims.push({ id, type: "coin_gain", pos: playerPos, count: diff, duration: 700 });
          }
        }
      }
    }

    if (newAnims.length > 0) {
      addAnimations(newAnims);
    }
  }, [gameState]);

  const animations = animationsRef.current;

  return (
    <div style={{
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: "none",
      zIndex: 50,
      overflow: "visible",
    }}>
      {animations.map(anim => {
        switch (anim.type) {
          case "card_deal":
            return <CardDealAnim key={anim.id} anim={anim} />;
          case "card_swap_take":
          case "card_swap_send":
            return <CardSwapPhaseAnim key={anim.id} anim={anim} />;
          case "card_peek":
            return <CardPeekAnim key={anim.id} anim={anim} />;
          case "announce":
            return <AnnounceAnim key={anim.id} anim={anim} />;
          case "victory":
            return <VictoryAnim key={anim.id} anim={anim} />;
          case "coin_fly":
            return <CoinFlyAnim key={anim.id} anim={anim} />;
          case "coin_gain":
            return <CoinPopAnim key={anim.id} anim={anim} direction="up" />;
          case "coin_loss":
            return <CoinPopAnim key={anim.id} anim={anim} direction="down" />;
          default:
            return null;
        }
      })}
    </div>
  );
}

// --- Card deal: single card flying from center to player position ---
function CardDealAnim({ anim }) {
  const { from, to, delay, duration } = anim;
  return (
    <img
      src={CARD_VERSO}
      className="anim-card-deal"
      style={{
        "--from-x": `${from.x}px`, "--from-y": `${from.y}px`,
        "--to-x": `${to.x}px`, "--to-y": `${to.y}px`,
        "--duration": `${duration}ms`,
        "--delay": `${delay}ms`,
      }}
      alt=""
    />
  );
}

// --- Card swap phase: single card flying from→to with delay ---
function CardSwapPhaseAnim({ anim }) {
  const { from, to, delay, duration } = anim;
  return (
    <img
      src={CARD_VERSO}
      className="anim-card-fly anim-card-fly-1"
      style={{
        "--from-x": `${from.x}px`, "--from-y": `${from.y}px`,
        "--to-x": `${to.x}px`, "--to-y": `${to.y}px`,
        "--duration": `${duration}ms`,
        "--delay": `${delay || 0}ms`,
      }}
      alt=""
    />
  );
}

// --- Card peek: subtle lift + glow effect on player's card ---
function CardPeekAnim({ anim }) {
  const { pos, duration } = anim;
  return (
    <div
      className="anim-card-peek"
      style={{
        "--pos-x": `${pos.x}px`,
        "--pos-y": `${pos.y}px`,
        "--duration": `${duration}ms`,
      }}
    />
  );
}

// --- Announce: mask image flash + radial glow ---
function AnnounceAnim({ anim }) {
  const { pos, mask, duration } = anim;
  const maskImg = MASK_IMAGES[mask];
  const maskName = MASK_NAMES[mask] || mask;
  return (
    <div
      className="anim-announce"
      style={{
        "--pos-x": `${pos.x}px`,
        "--pos-y": `${pos.y}px`,
        "--duration": `${duration}ms`,
      }}
    >
      {/* <span className="anim-announce-name">{maskName}</span> */}
      {maskImg && <img src={maskImg} className="anim-announce-img" alt={maskName} />}
    </div>
  );
}

// --- Victory: golden particles burst around winner ---
function VictoryAnim({ anim }) {
  const { pos, duration } = anim;
  const particles = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * 360;
    particles.push(
      <div
        key={i}
        className="anim-victory-particle"
        style={{
          "--angle": `${angle}deg`,
          "--delay": `${i * 60}ms`,
        }}
      />
    );
  }
  return (
    <div
      className="anim-victory"
      style={{
        "--pos-x": `${pos.x}px`,
        "--pos-y": `${pos.y}px`,
        "--duration": `${duration}ms`,
      }}
    >
      <div className="anim-victory-ring" />
      {particles}
      <span className="anim-victory-text">👑</span>
    </div>
  );
}

// --- Coins flying between positions (arc trajectory) ---
function CoinFlyAnim({ anim }) {
  const { from, to, count, duration } = anim;
  const coins = [];
  for (let i = 0; i < Math.min(count, 4); i++) {
    const offsetX = (i - 1) * 6;
    const offsetY = (i % 2 === 0 ? -1 : 1) * 4;
    coins.push(
      <div
        key={i}
        className="anim-coin-fly"
        style={{
          "--from-x": `${from.x + offsetX}px`, "--from-y": `${from.y}px`,
          "--to-x": `${to.x + offsetX}px`, "--to-y": `${to.y}px`,
          "--arc-y": `${offsetY - 25}px`,
          "--duration": `${duration}ms`,
          "--delay": `${i * 100}ms`,
        }}
      >
        🪙
      </div>
    );
  }
  return <>{coins}</>;
}

// --- Coin pop up (gain) or down (loss) ---
function CoinPopAnim({ anim, direction }) {
  const { pos, count, duration } = anim;
  const coins = [];
  for (let i = 0; i < Math.min(count, 3); i++) {
    coins.push(
      <div
        key={i}
        className={`anim-coin-pop ${direction === "up" ? "anim-coin-pop-up" : "anim-coin-pop-down"}`}
        style={{
          "--pos-x": `${pos.x + (i - 1) * 14}px`,
          "--pos-y": `${pos.y}px`,
          "--duration": `${duration}ms`,
          "--delay": `${i * 80}ms`,
        }}
      >
        🪙
      </div>
    );
  }
  return <>{coins}</>;
}
