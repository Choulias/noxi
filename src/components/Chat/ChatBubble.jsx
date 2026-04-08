import { useEffect, useRef } from 'react';
import api from '../../api';

function ChatBubble({ isOpen, onToggle, user, unreadCount, setUnreadCount }) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = () => {
      Promise.all([
        api.get('/messages/unread-count').catch(() => ({ data: { unreadCount: 0 } })),
        api.get('/friendrequests/mine').catch(() => ({ data: [] }))
      ]).then(([msgRes, frRes]) => {
        const unreadMessages = msgRes.data.unreadCount || 0;
        const pendingRequests = (frRes.data || []).filter(r => r.invitedId === user.id).length;
        setUnreadCount(unreadMessages + pendingRequests);
      });
    };

    fetchUnread();
    intervalRef.current = setInterval(fetchUnread, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, setUnreadCount]);

  return (
    <button
      type="button"
      className={`chat-bubble ${isOpen ? 'chat-bubble--open' : ''}`}
      onClick={onToggle}
      aria-label="Ouvrir le chat"
    >
      <svg
        className="chat-bubble__icon"
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      {unreadCount > 0 && (
        <span className="chat-bubble__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
      )}
    </button>
  );
}

export default ChatBubble;
