import { useState, useEffect, useRef } from 'react';
import api from '../../api';

function ChatConversation({ userId, username, onBack, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = () => {
    api.get(`/messages/${userId}`)
      .then(res => {
        // API returns DESC, reverse to show oldest first
        const msgs = res.data || [];
        setMessages(msgs.reverse());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Mark messages as read
  const markAsRead = () => {
    api.patch(`/messages/read/${userId}`).catch(() => {});
  };

  useEffect(() => {
    fetchMessages();
    markAsRead();

    // Poll for new messages every 15 seconds (markAsRead already called once above)
    pollRef.current = setInterval(fetchMessages, 15000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;

    // Optimistic update
    const tempMessage = {
      id: Date.now(),
      senderId: currentUser.id,
      receiverId: userId,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);
    setInput('');

    api.post('/messages', { receiverId: userId, content })
      .then(() => {
        fetchMessages();
      })
      .catch(() => {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSeparator = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Group messages by date
  const getDateKey = (dateStr) => new Date(dateStr).toDateString();

  let lastDateKey = null;

  return (
    <div className="chat-conversation">
      <div className="chat-conversation__header">
        <button type="button" className="chat-conversation__back" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <img
          className="chat-conversation__avatar"
          src={`https://robohash.org/${username}`}
          alt={username}
        />
        <span className="chat-conversation__username">{username}</span>
      </div>

      <div className="chat-conversation__messages">
        {loading ? (
          <div className="chat-conversation__loading">Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="chat-conversation__empty">
            <p>Aucun message. Dites bonjour !</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const dateKey = getDateKey(msg.createdAt);
            const showDate = dateKey !== lastDateKey;
            lastDateKey = dateKey;
            const isMine = msg.senderId === currentUser.id;
            // Show avatar only on last message of a consecutive group from same sender
            const nextMsg = messages[idx + 1];
            const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || getDateKey(nextMsg.createdAt) !== dateKey;

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="chat-conversation__date-separator">
                    <span>{formatDateSeparator(msg.createdAt)}</span>
                  </div>
                )}
                <div className={`chat-conversation__msg ${isMine ? 'chat-conversation__msg--sent' : 'chat-conversation__msg--received'}`}>
                  {!isMine && (
                    isLastInGroup
                      ? <img className="chat-conversation__msg-avatar" src={`https://robohash.org/${username}`} alt="" />
                      : <div className="chat-conversation__msg-avatar-spacer" />
                  )}
                  <div className="chat-conversation__msg-content">
                    <p>{msg.content}</p>
                    <span className="chat-conversation__msg-time">
                      {formatTime(msg.createdAt)}
                      {isMine && (
                        <span className={`chat-conversation__msg-status ${msg.read ? 'read' : ''}`}>
                          {msg.read ? (
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1 12 5 16 12 6" /><polyline points="7 12 11 16 18 6" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="4 12 8 16 16 6" />
                            </svg>
                          )}
                        </span>
                      )}
                    </span>
                  </div>
                  {isMine && (
                    isLastInGroup
                      ? <img className="chat-conversation__msg-avatar" src={`https://robohash.org/${currentUser.username}`} alt="" />
                      : <div className="chat-conversation__msg-avatar-spacer" />
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-conversation__input-bar" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-conversation__input"
          placeholder="Votre message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={500}
        />
        <button type="submit" className="chat-conversation__send" disabled={!input.trim()}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatConversation;
