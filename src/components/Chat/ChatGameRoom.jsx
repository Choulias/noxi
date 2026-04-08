import { useState, useEffect, useRef } from 'react';

function ChatGameRoom({ gameId, wsRef, messages, clientId }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    if (!wsRef?.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      method: 'chat_game',
      gameId,
      clientId,
      content,
    }));

    setInput('');
  };

  return (
    <div className="chat-gameroom">
      <div className="chat-gameroom__messages">
        {messages.length === 0 ? (
          <div className="chat-gameroom__empty">
            <p>Aucun message dans cette partie.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSystem = msg.type === 'system';

            return (
              <div
                key={index}
                className={`chat-gameroom__msg ${isSystem ? 'chat-gameroom__msg--system' : ''}`}
              >
                {isSystem ? (
                  <span className="chat-gameroom__system-text">{msg.content}</span>
                ) : (
                  <>
                    <span
                      className="chat-gameroom__player-name"
                      style={msg.color ? { color: msg.color } : undefined}
                    >
                      {msg.senderName || 'Joueur'}
                    </span>
                    <span className="chat-gameroom__msg-text">{msg.content}</span>
                  </>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-gameroom__input-bar" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-gameroom__input"
          placeholder="Message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={300}
        />
        <button type="submit" className="chat-gameroom__send" disabled={!input.trim()}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatGameRoom;
