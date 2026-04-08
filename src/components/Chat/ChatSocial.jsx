import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api';
import { useToast } from '../UI/Toast';

function ChatSocial({ user, onOpenConversation }) {
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requestUsernames, setRequestUsernames] = useState({});

  const debounceRef = useRef(null);
  const pollRef = useRef(null);

  // Fetch friend requests
  const fetchFriendRequests = useCallback(async () => {
    try {
      const res = await api.get('/friendrequests/mine');
      const all = res.data || [];
      setFriendRequests(all);

      // Resolve usernames for incoming requests via batch endpoint
      const incoming = all.filter(r => r.invitedId === user.id);
      const inviterIds = incoming.map(r => r.inviterId).filter(id => !requestUsernames[id]);
      if (inviterIds.length > 0) {
        const usersRes = await api.post('/users/batch', { ids: inviterIds });
        const names = { ...requestUsernames };
        usersRes.data.forEach(u => { names[u.id] = u.username; });
        setRequestUsernames(names);
      }
    } catch { /* ignore */ }
  }, [user.id]);

  // Fetch friendships
  const fetchFriendships = useCallback(async () => {
    try {
      const res = await api.get('/friendships/mine');
      const data = res.data || [];
      setFriendships(data);

      // Resolve friend usernames via batch endpoint
      const otherIds = data.map(f => f.uid_1 === user.id ? f.uid_2 : f.uid_1);
      if (otherIds.length > 0) {
        const usersRes = await api.post('/users/batch', { ids: otherIds });
        const usersMap = {};
        usersRes.data.forEach(u => { usersMap[u.id] = u.username; });
        const friendsData = data.map(f => {
          const otherId = f.uid_1 === user.id ? f.uid_2 : f.uid_1;
          return { friendshipId: f.id, id: otherId, username: usersMap[otherId] || 'Inconnu' };
        });
        setFriends(friendsData);
      } else {
        setFriends([]);
      }
    } catch { /* ignore */ }
  }, [user.id]);

  // Initial fetch + polling
  useEffect(() => {
    fetchFriendRequests();
    fetchFriendships();

    pollRef.current = setInterval(() => {
      fetchFriendRequests();
    }, 60000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchFriendRequests, fetchFriendships]);

  // Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.length < 2) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search/${encodeURIComponent(val)}`);
        setSearchResults(res.data || []);
      } catch {
        setSearchResults([]);
      }
    }, 300);
  };

  // Determine relationship status for a search result user
  const getRelationStatus = (userId) => {
    // Already friends?
    const isFriend = friends.some(f => f.id === userId);
    if (isFriend) return 'friend';

    // Request sent by me?
    const sentByMe = friendRequests.find(r => r.inviterId === user.id && r.invitedId === userId);
    if (sentByMe) return 'pending_sent';

    // Request received from them?
    const receivedFromThem = friendRequests.find(r => r.inviterId === userId && r.invitedId === user.id);
    if (receivedFromThem) return 'pending_received';

    return 'none';
  };

  // Send friend request
  const handleSendRequest = async (targetId) => {
    try {
      await api.post('/friendrequests', { inviterId: user.id, invitedId: targetId });
      addToast('Demande envoyee !', 'success');
      fetchFriendRequests();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  // Accept friend request
  const handleAccept = async (request) => {
    try {
      await api.post('/friendships', { uid_1: request.inviterId, uid_2: request.invitedId });
      await api.delete(`/friendrequests/${request.id}`);
      addToast('Ami ajoute !', 'success');
      fetchFriendRequests();
      fetchFriendships();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  // Reject friend request
  const handleReject = async (request) => {
    try {
      await api.delete(`/friendrequests/${request.id}`);
      addToast('Demande refusee.', 'info');
      fetchFriendRequests();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  // Accept from search results
  const handleAcceptFromSearch = async (userId) => {
    const request = friendRequests.find(r => r.inviterId === userId && r.invitedId === user.id);
    if (request) await handleAccept(request);
  };

  // Reject from search results
  const handleRejectFromSearch = async (userId) => {
    const request = friendRequests.find(r => r.inviterId === userId && r.invitedId === user.id);
    if (request) await handleReject(request);
  };

  // Remove friend
  const handleRemoveFriend = async (friend) => {
    try {
      await api.delete(`/friendships/${friend.friendshipId}`);
      addToast('Ami retire.', 'info');
      fetchFriendships();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  const incomingRequests = friendRequests.filter(r => r.invitedId === user.id);

  return (
    <div className="chat-social">
      {/* Search */}
      <div className="chat-social__search">
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="chat-social__search-results">
          {searchResults.map(u => {
            const status = getRelationStatus(u.id);
            return (
              <div key={u.id} className="chat-social__search-item">
                <img
                  className="chat-social__search-avatar"
                  src={`https://robohash.org/${u.username}`}
                  alt={u.username}
                />
                <span className="chat-social__search-name">{u.username}</span>
                <div className="chat-social__search-action">
                  {status === 'none' && (
                    <button type="button" className="chat-social__btn-add" onClick={() => handleSendRequest(u.id)} title="Ajouter en ami">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
                      </svg>
                    </button>
                  )}
                  {status === 'friend' && (
                    <span className="chat-social__btn-friend-badge" title="Deja amis">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>
                      </svg>
                    </span>
                  )}
                  {status === 'pending_sent' && (
                    <span className="chat-social__btn-pending" title="Demande envoyee">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </span>
                  )}
                  {status === 'pending_received' && (
                    <div className="chat-social__request-actions">
                      <button type="button" className="chat-social__btn-accept" onClick={() => handleAcceptFromSearch(u.id)} title="Accepter">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      <button type="button" className="chat-social__btn-reject" onClick={() => handleRejectFromSearch(u.id)} title="Refuser">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="chat-social__scrollable">
        {/* Friend Requests Section */}
        {incomingRequests.length > 0 && (
          <div className="chat-social__section">
            <div className="chat-social__section-header">
              <h4>Demandes d'amis</h4>
              <span className="chat-social__section-badge">{incomingRequests.length}</span>
            </div>
            {incomingRequests.map(r => {
              const username = requestUsernames[r.inviterId] || '...';
              return (
                <div key={r.id} className="chat-social__request-item">
                  <img
                    className="chat-social__request-avatar"
                    src={`https://robohash.org/${username}`}
                    alt={username}
                  />
                  <span
                    className="chat-social__request-name"
                    onClick={() => onOpenConversation(r.inviterId, username)}
                  >
                    {username}
                  </span>
                  <div className="chat-social__request-actions">
                    <button type="button" className="chat-social__btn-accept" onClick={() => handleAccept(r)} title="Accepter">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button type="button" className="chat-social__btn-reject" onClick={() => handleReject(r)} title="Refuser">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Friends List Section */}
        <div className="chat-social__section">
          <div className="chat-social__section-header">
            <h4>Amis</h4>
          </div>
          {friends.length === 0 ? (
            <div className="chat-social__empty">
              <div className="chat-social__empty-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
                </svg>
              </div>
              <p>Aucun ami pour le moment.</p>
              <p style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>Recherchez un joueur ci-dessus pour l'ajouter</p>
            </div>
          ) : (
            friends.map(f => (
              <div key={f.id} className="chat-social__friend-item">
                <img
                  className="chat-social__friend-avatar"
                  src={`https://robohash.org/${f.username}`}
                  alt={f.username}
                />
                <span
                  className="chat-social__friend-name"
                  onClick={() => onOpenConversation(f.id, f.username)}
                >
                  {f.username}
                </span>
                <button type="button" className="chat-social__btn-remove" onClick={() => handleRemoveFriend(f)} title="Retirer">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="11" x2="23" y2="11"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatSocial;
