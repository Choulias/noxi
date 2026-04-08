import { useState, useEffect, useCallback } from 'react';
import ChatConversationList from './ChatConversationList';
import ChatGameRoom from './ChatGameRoom';
import ChatSocial from './ChatSocial';
import api from '../../api';

function ChatDrawer({ isOpen, onClose, user, gameId, wsRef, gameChatMessages, clientId }) {
  const [activeTab, setActiveTab] = useState('conversations');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [socialInitialUser, setSocialInitialUser] = useState(null);

  const hasGame = !!gameId;
  const isLoggedIn = !!user;

  // Fetch pending friend requests count (no polling — called once on mount and when drawer opens)
  const fetchPendingCount = useCallback(() => {
    if (!user) return;
    api.get('/friendrequests/mine')
      .then(res => {
        const incoming = (res.data || []).filter(r => r.invitedId === user.id);
        setPendingRequestsCount(incoming.length);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

  // Re-fetch when drawer opens or when switching to social tab
  useEffect(() => {
    if (isOpen) {
      fetchPendingCount();
    }
  }, [isOpen, fetchPendingCount]);

  useEffect(() => {
    if (activeTab === 'social') {
      fetchPendingCount();
    }
  }, [activeTab, fetchPendingCount]);

  // Auto-switch to game tab when joining a game
  useEffect(() => {
    if (hasGame) {
      setActiveTab('game');
    } else {
      setActiveTab('conversations');
    }
  }, [hasGame]);

  // When social tab triggers a conversation
  const handleOpenConversation = (userId, username) => {
    setSocialInitialUser({ id: userId, username });
    setActiveTab('conversations');
  };

  // Clear initialUser after switching away from conversations
  useEffect(() => {
    if (activeTab !== 'conversations') {
      setSocialInitialUser(null);
    }
  }, [activeTab]);

  return (
    <>
      {isOpen && <div className="chat-overlay" onClick={onClose} />}
      <div className={`chat-drawer ${isOpen ? 'chat-drawer--open' : ''}`}>
        <div className="chat-drawer__header">
          <h3 className="chat-drawer__title">Chat</h3>
          <button type="button" className="chat-drawer__close" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="chat-drawer__tabs">
          {isLoggedIn && (
            <button
              type="button"
              className={`chat-drawer__tab ${activeTab === 'conversations' ? 'active' : ''}`}
              onClick={() => setActiveTab('conversations')}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Messages</span>
              {unreadMessagesCount > 0 && <span className="chat-drawer__tab-count">{unreadMessagesCount}</span>}
            </button>
          )}
          {hasGame && (
            <button
              type="button"
              className={`chat-drawer__tab ${activeTab === 'game' ? 'active' : ''}`}
              onClick={() => setActiveTab('game')}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              <span>Partie</span>
            </button>
          )}
          {isLoggedIn && (
            <button
              type="button"
              className={`chat-drawer__tab ${activeTab === 'social' ? 'active' : ''}`}
              onClick={() => setActiveTab('social')}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Social</span>
              {pendingRequestsCount > 0 && <span className="chat-drawer__tab-badge" />}
            </button>
          )}
        </div>

        <div className="chat-drawer__content">
          {activeTab === 'conversations' && isLoggedIn && (
            <ChatConversationList user={user} initialUser={socialInitialUser} />
          )}
          {activeTab === 'game' && hasGame && (
            <ChatGameRoom
              gameId={gameId}
              wsRef={wsRef}
              messages={gameChatMessages}
              clientId={clientId}
            />
          )}
          {activeTab === 'social' && isLoggedIn && (
            <ChatSocial user={user} onOpenConversation={handleOpenConversation} />
          )}
          {!isLoggedIn && !hasGame && (
            <div className="chat-drawer__empty">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" style={{ opacity: 0.15, marginBottom: 12 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>Connectez-vous pour discuter avec d'autres joueurs.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatDrawer;
