import { MASK_NAMES, MASK_IMAGES, CARD_VERSO } from "./mascaradeConstants.js";

export default function MascaradePlayerCard({ player, index, color, isCurrentTurn, isMe, shownMask, position, onCardClick, onCardHover, onCardLeave, highlighted }) {
  return (
    <div
      className={`player-seat ${isCurrentTurn ? "current-turn" : ""} ${isMe ? "is-me" : ""} ${highlighted ? "picker-highlighted" : ""}`}
      style={{ left: position.left + "px", top: position.top + "px" }}
      data-player-index={index}
    >
      {/* Card */}
      <div
        className={`mask-card ${shownMask ? "face-up revealing" : "face-down"}`}
        onClick={shownMask && onCardClick ? () => onCardClick(shownMask) : undefined}
        onMouseEnter={shownMask && onCardHover ? (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onCardHover(shownMask, rect);
        } : undefined}
        onMouseLeave={shownMask && onCardLeave ? onCardLeave : undefined}
        style={shownMask ? { cursor: "pointer" } : undefined}
      >
        {shownMask ? (
          <div className="mask-card-content">
            <img className="mask-card-img" src={MASK_IMAGES[shownMask]} alt={MASK_NAMES[shownMask] || shownMask} />
          </div>
        ) : (
          <div className="mask-card-back-content">
            <img className="mask-card-img" src={CARD_VERSO} alt="Carte cachée" />
          </div>
        )}
      </div>

      {/* Player info */}
      <div className="player-info-card">
        <div className="player-info-top">
          <img className="player-avatar" src={`https://robohash.org/${encodeURIComponent(player.clientName || 'Joueur')}`} alt="" />
          <span className="player-name" style={{ color }}>
            {isMe ? "Vous" : player.clientName}
          </span>
        </div>
        <div className="player-coins-row">
          <span className="coin-icon">&#x1FA99;</span>
          <span className="coin-value">{player.coins}</span>
        </div>
      </div>
    </div>
  );
}
