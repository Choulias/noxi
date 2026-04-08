import { useEffect, useRef, useMemo } from "react";

function highlightNames(message, clientMap) {
  if (!clientMap || clientMap.length === 0) return message;

  // Sort by name length descending to match longer names first
  const sorted = [...clientMap].sort((a, b) => b.name.length - a.name.length);

  // Also match center card references like "la carte #1 du centre"
  const centerCardRegex = /la carte #\d+ du centre/g;

  const parts = [];
  let remaining = message;

  while (remaining.length > 0) {
    let earliestIdx = remaining.length;
    let matchedClient = null;
    let centerMatch = null;

    // Check player names
    for (const client of sorted) {
      const idx = remaining.indexOf(client.name);
      if (idx !== -1 && idx < earliestIdx) {
        earliestIdx = idx;
        matchedClient = client;
        centerMatch = null;
      }
    }

    // Check center card references
    const cMatch = centerCardRegex.exec(remaining);
    centerCardRegex.lastIndex = 0;
    if (cMatch && cMatch.index < earliestIdx) {
      earliestIdx = cMatch.index;
      matchedClient = null;
      centerMatch = cMatch[0];
    }

    if (!matchedClient && !centerMatch) {
      parts.push(remaining);
      break;
    }

    if (earliestIdx > 0) {
      parts.push(remaining.slice(0, earliestIdx));
    }

    if (matchedClient) {
      parts.push(
        <strong key={parts.length} style={{ color: matchedClient.color }}>
          {matchedClient.name}
        </strong>
      );
      remaining = remaining.slice(earliestIdx + matchedClient.name.length);
    } else {
      parts.push(
        <strong key={parts.length} style={{ color: "#d4a830" }}>
          {centerMatch}
        </strong>
      );
      remaining = remaining.slice(earliestIdx + centerMatch.length);
    }
  }

  return parts;
}

export default function MascaradeLog({ log, gameClients }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const clientMap = useMemo(() => {
    if (!gameClients) return [];
    return gameClients
      .filter(c => c.clientName)
      .map(c => ({ name: c.clientName, color: c.color || "#FFFFFF" }));
  }, [gameClients]);

  if (!log || log.length === 0) return null;

  return (
    <div className="mascarade-log">
      <h4 className="log-title">Journal</h4>
      <div className="log-entries">
        {log.map((entry, i) => (
          <div key={i} className="log-entry">
            <span className="log-turn">T{entry.turn}</span>
            <span className="log-message">{highlightNames(entry.message, clientMap)}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
