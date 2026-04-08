import MascaradePlayerCard from "./MascaradePlayerCard.jsx";
import { MASK_NAMES, MASK_IMAGES, CARD_VERSO } from "./mascaradeConstants.js";
import PlateauImg from "../../../assets/img/mascarad_imgs/plateau.png";

export default function MascaradeBoard({ gameState, gameClients, myPlayerIndex, revealData, lookResult, onCardClick, onCardHover, onCardLeave, pickerHighlight }) {
  if (!gameState || !gameState.players) return null;

  const players = gameState.players;
  const playerCount = players.length;
  const isMemorization = gameState.phase === "MEMORIZATION";

  // Rounded rectangle layout — "me" always at bottom center
  const halfW = Math.min(300, 170 + playerCount * 14);
  const halfH = Math.min(200, 130 + playerCount * 9);
  const cornerR = Math.min(halfW, halfH) * 0.45;
  const centerX = halfW + 60;
  const centerY = halfH + 80;

  // Perimeter segments: bottom, right, top, left (starting bottom-center, clockwise)
  const straightH = (halfW - cornerR) * 2;
  const straightV = (halfH - cornerR) * 2;
  const cornerArc = (Math.PI / 2) * cornerR;
  const perimeter = 2 * straightH + 2 * straightV + 4 * cornerArc;

  const getPosition = (index) => {
    const offset = myPlayerIndex >= 0 ? myPlayerIndex : 0;
    let t = ((index - offset + playerCount) % playerCount) / playerCount;
    let d = t * perimeter;

    // Segments in order: bottom edge, bottom-right corner, right edge, top-right corner, top edge, top-left corner, left edge, bottom-left corner
    const segments = [
      { len: straightH / 2, calc: (s) => ({ x: s,                             y: halfH }) },                                                            // bottom-center → bottom-right
      { len: cornerArc,     calc: (s) => ({ x: halfW - cornerR + Math.sin(s / cornerR) * cornerR, y: halfH - cornerR + Math.cos(s / cornerR) * cornerR }) }, // bottom-right corner
      { len: straightV,     calc: (s) => ({ x: halfW,                          y: halfH - cornerR - s }) },                                              // right edge (going up)
      { len: cornerArc,     calc: (s) => ({ x: halfW - cornerR + Math.cos(s / cornerR) * cornerR, y: -halfH + cornerR - Math.sin(s / cornerR) * cornerR }) }, // top-right corner
      { len: straightH,     calc: (s) => ({ x: halfW - cornerR - s,           y: -halfH }) },                                                           // top edge (going left)
      { len: cornerArc,     calc: (s) => ({ x: -halfW + cornerR - Math.sin(s / cornerR) * cornerR, y: -halfH + cornerR - Math.cos(s / cornerR) * cornerR }) }, // top-left corner
      { len: straightV,     calc: (s) => ({ x: -halfW,                         y: -halfH + cornerR + s }) },                                             // left edge (going down)
      { len: cornerArc,     calc: (s) => ({ x: -halfW + cornerR - Math.cos(s / cornerR) * cornerR, y: halfH - cornerR + Math.sin(s / cornerR) * cornerR }) }, // bottom-left corner
      { len: straightH / 2, calc: (s) => ({ x: -halfW + cornerR + s,          y: halfH }) },                                                            // bottom-left → bottom-center (unused, wraps)
    ];

    for (const seg of segments) {
      if (d <= seg.len) {
        const pt = seg.calc(d);
        return { left: centerX + pt.x - 50, top: centerY + pt.y - 45 };
      }
      d -= seg.len;
    }
    // Fallback (wrap)
    return { left: centerX - 50, top: centerY + halfH - 45 };
  };

  // Build reveal map from contestation/princesse/gourou reveals
  const revealMap = {};
  if (revealData?.type === "contestation_reveal" && revealData.reveals) {
    revealData.reveals.forEach(r => {
      revealMap[r.playerIndex] = r.mask;
    });
  }
  if (revealData?.type === "princesse_reveal") {
    revealMap[revealData.targetIndex] = revealData.mask;
  }
  if (revealData?.type === "gourou_reveal") {
    revealMap[revealData.playerIndex] = revealData.mask;
  }

  return (
    <div className="mascarade-table" style={{ width: (centerX + halfW + 60) + "px", height: (centerY + halfH + 60) + "px" }}>
      {/* Golden particles */}
      <div className="board-particles">
        {Array(5).fill(null).map((_, i) => (
          <span key={i} className="particle" style={{
            left: `${8 + Math.random() * 84}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }} />
        ))}
      </div>
      {/* Twinkling stars */}
      <div className="board-stars">
        {Array(15).fill(null).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }} />
        ))}
      </div>
      {/* Player seats */}
      {players.map((player, i) => {
        const pos = getPosition(i);
        const client = gameClients.find(c => c.clientId === player.clientId);
        const color = client?.color || "#FFFFFF";
        const isCurrentTurn = i === gameState.currentPlayerIndex;
        const isMe = i === myPlayerIndex;

        // Determine if mask should be shown
        let shownMask = null;
        if (isMemorization && gameState.revealedMasks) {
          shownMask = gameState.revealedMasks[i];
        }
        if (revealMap[i]) {
          shownMask = revealMap[i];
        }
        if (isMe && lookResult) {
          shownMask = lookResult;
        }

        return (
          <MascaradePlayerCard
            key={player.clientId}
            player={player}
            index={i}
            color={color}
            isCurrentTurn={isCurrentTurn}
            isMe={isMe}
            shownMask={shownMask}
            position={pos}
            onCardClick={onCardClick}
            onCardHover={onCardHover}
            onCardLeave={onCardLeave}
            highlighted={pickerHighlight?.type === "player" && pickerHighlight?.index === i}
          />
        );
      })}

      {/* Center — Justice board */}
      <div className="mascarade-center" style={{ left: centerX - 70, top: centerY - 50 }}>
        <div className="justice-board">
          <img className="justice-plateau-img" src={PlateauImg} alt="Plateau Justice" />
          <div className="justice-overlay">
            <div className="justice-ring" />
            <div className="justice-coin-big">
              <span className="justice-coins">{gameState.justiceBoard}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
