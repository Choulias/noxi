import { MASK_NAMES, MASK_CHIBIS } from "./mascaradeConstants.js";

export default function MascaradeContestation({ gameState, myPlayerIndex, sendAction, gameClients }) {
  const { announcedMask, announcerIndex, contestationQueue, contestants, players } = gameState;

  const announcer = players[announcerIndex];
  const maskDisplay = MASK_NAMES[announcedMask] || announcedMask;
  const maskChibi = MASK_CHIBIS[announcedMask];
  const canIRespond = contestationQueue.includes(myPlayerIndex);
  const amIAnnouncer = announcerIndex === myPlayerIndex;
  const haveIResponded = !canIRespond && !amIAnnouncer;

  // Joueurs encore en attente de réponse
  const waitingPlayers = contestationQueue
    .map(i => players[i]?.clientName)
    .filter(Boolean);

  return (
    <div className="mascarade-contestation">
      <div className="contestation-header">
        <p className="contestation-announce">
          <strong style={{ color: gameClients.find(c => c.clientId === announcer?.clientId)?.color }}>
            {announcer?.clientName}
          </strong> annonce :
        </p>
        {maskChibi && <img className="contestation-chibi" src={maskChibi} alt={maskDisplay} />}
        <strong className="contestation-mask-name">{maskDisplay}</strong>
      </div>

      {/* Status of each player */}
      <div className="contestation-players">
        {players.map((p, i) => {
          if (i === announcerIndex) return null;
          const client = gameClients.find(c => c.clientId === p.clientId);
          const hasContested = contestants.includes(i);
          const hasPassed = !contestationQueue.includes(i) && !hasContested;
          const isWaiting = contestationQueue.includes(i);

          return (
            <div key={i} className={`contestation-player ${hasContested ? "contested" : hasPassed ? "passed" : "waiting"}`}>
              <span style={{ color: client?.color }}>{p.clientName}</span>
              <span className="contestation-status">
                {hasContested && "Conteste !"}
                {hasPassed && "Passe"}
                {isWaiting && "..."}
              </span>
            </div>
          );
        })}
      </div>

      {/* My action — visible for ALL players still in the queue */}
      {canIRespond && (
        <div className="contestation-action">
          <p>Contestez-vous ?</p>
          <div className="contestation-buttons">
            <button
              type="button"
              className="action-btn contest-btn"
              onClick={() => sendAction({ type: "contest_response", doContest: true })}
            >
              Contester
            </button>
            <button
              type="button"
              className="action-btn pass-btn"
              onClick={() => sendAction({ type: "contest_response", doContest: false })}
            >
              Passer
            </button>
          </div>
        </div>
      )}

      {/* Waiting message — shown to players who already responded or to the announcer */}
      {(haveIResponded || amIAnnouncer) && contestationQueue.length > 0 && (
        <div className="contestation-waiting">
          <p>En attente de {waitingPlayers.length > 1
            ? waitingPlayers.slice(0, -1).join(", ") + " et " + waitingPlayers[waitingPlayers.length - 1]
            : waitingPlayers[0]}...</p>
        </div>
      )}
    </div>
  );
}
