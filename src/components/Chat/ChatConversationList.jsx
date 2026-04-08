import { useState, useEffect } from 'react';
import api from '../../api';
import ChatConversation from './ChatConversation';

function ChatConversationList({ user, initialUser }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = () => {
    api.get('/messages/conversations')
      .then(res => {
        setConversations(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-open conversation from Social tab
  useEffect(() => {
    if (initialUser && initialUser.id) {
      setSelectedUser({ id: initialUser.id, username: initialUser.username });
    }
  }, [initialUser]);

  const handleNewConversation = async () => {
    setShowSearch(true);
    try {
      const friendRes = await api.get('/friendships/mine');
      const friendships = friendRes.data;
      const userId = user.id;
      const friendsData = await Promise.all(
        friendships.map(async (f) => {
          const otherId = f.uid_1 === userId ? f.uid_2 : f.uid_1;
          try {
            const userRes = await api.get(`/users/${otherId}`);
            return { id: otherId, username: userRes.data.username };
          } catch { return null; }
        })
      );
      setFriends(friendsData.filter(Boolean));
    } catch {
      setFriends([]);
    }
  };

  const handleSelectFriend = (friend) => {
    setSelectedUser({ id: friend.id, username: friend.username });
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleBack = () => {
    setSelectedUser(null);
    fetchConversations();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const truncate = (text, maxLen = 40) => {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  };

  // Show single conversation view
  if (selectedUser) {
    return (
      <ChatConversation
        userId={selectedUser.id}
        username={selectedUser.username}
        onBack={handleBack}
        currentUser={user}
      />
    );
  }

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-conversations">
      {showSearch ? (
        <div className="chat-conversations__search">
          <div className="chat-conversations__search-header">
            <button type="button" className="chat-conversations__back" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <input
              type="text"
              className="chat-conversations__search-input"
              placeholder="Rechercher un ami..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="chat-conversations__friends-list">
            {filteredFriends.length === 0 && (
              <p className="chat-conversations__empty">Aucun ami trouve.</p>
            )}
            {filteredFriends.map(friend => (
              <button
                type="button"
                key={friend.id}
                className="chat-conversations__friend-item"
                onClick={() => handleSelectFriend(friend)}
              >
                <img
                  className="chat-conversations__avatar"
                  src={`https://robohash.org/${friend.username}`}
                  alt={friend.username}
                />
                <span className="chat-conversations__friend-name">{friend.username}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="chat-conversations__new-btn"
            onClick={handleNewConversation}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle conversation
          </button>

          {loading ? (
            <div className="chat-conversations__loading">Chargement...</div>
          ) : conversations.length === 0 ? (
            <div className="chat-conversations__empty">
              <p>Aucune conversation.</p>
              <p>Commencez par envoyer un message a un ami !</p>
            </div>
          ) : (
            <div className="chat-conversations__list">
              {conversations.map(conv => (
                <button
                  type="button"
                  key={conv.userId}
                  className="chat-conversations__item"
                  onClick={() => setSelectedUser({ id: conv.userId, username: conv.username })}
                >
                  <img
                    className="chat-conversations__avatar"
                    src={`https://robohash.org/${conv.username}`}
                    alt={conv.username}
                  />
                  <div className="chat-conversations__info">
                    <div className="chat-conversations__top-row">
                      <span className="chat-conversations__username">{conv.username}</span>
                      <span className="chat-conversations__time">{formatTime(conv.lastMessageAt)}</span>
                    </div>
                    <p className="chat-conversations__preview">{truncate(conv.lastMessage)}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="chat-conversations__unread">{conv.unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ChatConversationList;
