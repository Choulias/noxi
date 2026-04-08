import { useState, useEffect, useContext, useLayoutEffect } from 'react'
import api from "../../api";
import { useNavigate } from 'react-router-dom';
import { useToken } from '../Auth/useToken';
import { useUser } from '../Auth/useUser';
import { Context } from '../GlobalInfo';
// Images come from database via API
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useToast } from '../UI/Toast';

export default function UserProfile() {

  const user = useUser();
  const [token, setToken] = useToken();
  const [state, setState] = useContext(Context);

  const { addToast } = useToast();
  const tokenId = user.id;
  const tokenName = user.username;
  const tokenMail = user.mail;

  const [username, setUsername] = useState(tokenName || '');
  const [mail, setMail] = useState(tokenMail || '');
  const navigate = useNavigate();
  const id = tokenId;

  // Stats data
  const [stats, setStats] = useState(null);

  // Profile data
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAge, setEditAge] = useState('');

  // Friends data
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    if (user && state.userInfo.connected === 0) {
      setState({
        userInfo: {
          connected: 1,
          id: user.id,
          username: user.username,
          mail: user.mail,
          role: user.role,
          image: user.image
        }
      });
    }

    getUserById();
    getProfile();
    getUserGames();
    loadFriends();
    loadFriendRequests();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get(`/stats/${id}`);
      setStats(res.data);
    } catch (e) { console.error("Stats error:", e); }
  };

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const title = document.querySelector('.profil > h2');
    const banner = document.querySelector('.profile-banner');
    const leftInfo = document.querySelector('.left-info');
    const rightInfo = document.querySelector('.right-info');

    if (title) {
      gsap.fromTo(title, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: title, start: 'top 90%', toggleActions: 'play none none none' }
      });
    }
    if (banner) {
      gsap.fromTo(banner, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: banner, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }
    if (leftInfo) {
      gsap.fromTo(leftInfo, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: leftInfo, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }
    if (rightInfo) {
      gsap.fromTo(rightInfo, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: rightInfo, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  const getUserById = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setUsername(response.data.username);
      setMail(response.data.mail);
    } catch (error) {
      console.error("Erreur chargement utilisateur:", error);
    }
  };

  const getProfile = async () => {
    try {
      const response = await api.get(`/profiles/user/${id}`);
      setProfile(response.data);
      setEditNickname(response.data.nickname || '');
      setEditBio(response.data.bio || '');
      setEditAge(response.data.age || '');
    } catch (error) {
      // Pas de profil encore
      setProfile(null);
    }
  };

  const saveProfile = async () => {
    try {
      if (profile) {
        await api.patch(`/profiles/${profile.id}`, {
          nickname: editNickname,
          bio: editBio,
          age: editAge || null,
        });
      } else {
        await api.post(`/profiles`, {
          userId: id,
          nickname: editNickname,
          bio: editBio,
          age: editAge || null,
        });
      }
      await getProfile();
      setIsEditing(false);
      addToast("Profil sauvegarde !", "success");
    } catch (error) {
      console.error("Erreur sauvegarde profil:", error);
      addToast("Erreur lors de la sauvegarde", "error");
    }
  };

  const startEditing = () => {
    setEditNickname(profile?.nickname || username);
    setEditBio(profile?.bio || '');
    setEditAge(profile?.age || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditNickname(profile?.nickname || username);
    setEditBio(profile?.bio || '');
    setEditAge(profile?.age || '');
    setIsEditing(false);
  };

  // Friends system
  const loadFriends = async () => {
    try {
      const res = await api.get('/friendships/mine');
      const friendships = res.data;
      const otherIds = friendships.map(f => f.uid_1 === id ? f.uid_2 : f.uid_1);
      if (otherIds.length > 0) {
        const usersRes = await api.post('/users/batch', { ids: otherIds });
        const usersMap = {};
        usersRes.data.forEach(u => { usersMap[u.id] = u.username; });
        const friendsData = friendships.map(f => {
          const otherId = f.uid_1 === id ? f.uid_2 : f.uid_1;
          return {
            friendshipId: f.id,
            userId: otherId,
            username: usersMap[otherId] || 'Utilisateur inconnu',
            image: null,
          };
        });
        setFriends(friendsData);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Erreur chargement amis:", error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const res = await api.get('/friendrequests/mine');
      const requests = res.data.filter(r => r.invitedId === id);
      const inviterIds = requests.map(r => r.inviterId);
      if (inviterIds.length > 0) {
        const usersRes = await api.post('/users/batch', { ids: inviterIds });
        const usersMap = {};
        usersRes.data.forEach(u => { usersMap[u.id] = u.username; });
        const requestsData = requests.map(r => ({
          requestId: r.id,
          inviterId: r.inviterId,
          username: usersMap[r.inviterId] || 'Utilisateur inconnu',
          image: null,
        }));
        setFriendRequests(requestsData);
      } else {
        setFriendRequests([]);
      }
    } catch (error) {
      console.error("Erreur chargement demandes:", error);
    }
  };

  const acceptRequest = async (request) => {
    try {
      await api.post('/friendships', { uid_1: request.inviterId, uid_2: id });
      await api.delete(`/friendrequests/${request.requestId}`);
      await loadFriends();
      await loadFriendRequests();
      addToast(`${request.username} est maintenant votre ami !`, "success");
    } catch (error) {
      console.error("Erreur acceptation:", error);
      addToast("Erreur lors de l'acceptation", "error");
    }
  };

  const rejectRequest = async (request) => {
    try {
      await api.delete(`/friendrequests/${request.requestId}`);
      await loadFriendRequests();
    } catch (error) {
      console.error("Erreur rejet:", error);
    }
  };

  const removeFriend = async (friendshipId) => {
    try {
      await api.delete(`/friendships/${friendshipId}`);
      await loadFriends();
    } catch (error) {
      console.error("Erreur suppression ami:", error);
    }
  };

  const logOut = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate("/login");
  };

  // Game history
  const [userGames, setUserGames] = useState([]);
  const getUserGames = async () => {
    try {
      const response = await api.get(`/gameplayers/username/${tokenName}`);
      const reversed = response.data.reverse();
      await getGamePlayers(reversed);
      await getGameModel(reversed);
      setUserGames(reversed);
    } catch (error) {
      console.error("Erreur chargement parties:", error);
    }
  };

  const [gamesPlayers, setGamesPlayers] = useState([]);
  const getGamePlayers = async (games) => {
    const results = await Promise.all(
      games.map(game => api.get(`/gameplayers/gameid/${game.gameId}`))
    );
    setGamesPlayers(results.map(r => r.data));
  };

  const [gamesModel, setGamesModels] = useState([]);
  const getGameModel = async (games) => {
    const results = await Promise.all(
      games.map(game => api.get(`/games/gameid/${game.gameId}`))
    );
    setGamesModels(results.map(r => r.data.gameModel));
  };

  function PlayersNames(props) {
    const iteration = props.iteration;
    return (
      <div className='players-list'>
        {(gamesPlayers[iteration]).map(function (element, index) {
          return <li key={index}>{element.clientName}</li>;
        })}
      </div>
    );
  }

  function PlayersList(props) {
    const iteration = props.iteration;
    if (gamesPlayers[iteration] !== undefined) {
      return <PlayersNames iteration={iteration} />;
    }
    return null;
  }

  function PlayerResult(props) {
    const iteration = props.iteration;
    const clientName = props.clientName;
    let bestScore = 0;
    let playerScore = 0;
    if (gamesPlayers[iteration] !== undefined) {
      (gamesPlayers[iteration]).map(function (element) {
        if (element.clientName !== clientName) {
          bestScore = element.score;
        } else {
          playerScore = element.score;
        }
      });

      if (playerScore > bestScore) {
        return <span className='result victory'>Victoire</span>
      } else if (playerScore < bestScore) {
        return <span className='result defeat'>Defaite</span>
      } else {
        return <span className='result even'>Egalite</span>
      }
    }
    return null;
  }

  const displayName = profile?.nickname || username;
  const displayBio = profile?.bio || "Aucune biographie pour le moment.";

  const getGameDisplayName = (slug) => {
    const names = { tictactoe: "Tic Tac Toe", board: "Board Game", mascarade: "Mascarade" };
    return names[slug] || slug || "Jeu";
  };

  // XP formula matching backend: level^2 * 50
  const xpForLevel = (lvl) => lvl <= 1 ? 0 : Math.floor(lvl * lvl * 50);
  const currentLevel = stats?.level || 1;
  const currentXP = stats?.xp || 0;
  const currentThreshold = xpForLevel(currentLevel);
  const nextThreshold = xpForLevel(currentLevel + 1);
  const xpProgress = nextThreshold > currentThreshold ? Math.min(100, ((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100) : 100;

  const getResultClass = (i, clientName) => {
    if (!gamesPlayers[i]) return '';
    let myScore = 0, bestOpponent = 0;
    gamesPlayers[i].forEach(el => {
      if (el.clientName === clientName) myScore = el.score;
      else if (el.score > bestOpponent) bestOpponent = el.score;
    });
    if (myScore > bestOpponent) return 'result-victory';
    if (myScore < bestOpponent) return 'result-defeat';
    return 'result-draw';
  };

  return (
    <div className='conteneur main-container profil'>
      <h2>Mon profil</h2>

      <div className='profile-board'>

        <div className='profile-banner'>
          <img
            src={'https://robohash.org/' + username}
            alt={username}
          />

          <div className='profile-resume'>
            <div className='profile-name'>
              {isEditing ? (
                <input
                  className='inline-edit-name'
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  placeholder="Votre pseudo"
                  maxLength={50}
                  autoFocus
                />
              ) : (
                <h3>{displayName}</h3>
              )}
              <span>{"@" + username}</span>
            </div>

            <div className='profile-level'>
              <span>Niveau {stats?.level || 1}</span>
              <div className='barre' title={`${currentXP} / ${nextThreshold} XP`}>
                <div className="filled" style={{ width: `${xpProgress}%` }}></div>
                <span className='barre-tooltip'>{currentXP} / {nextThreshold} XP</span>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <button type="button" className='btn-profile-edit-icon' onClick={startEditing} title="Modifier le profil">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          ) : (
            <div className='profile-edit-actions-inline'>
              <button type="button" className='btn-save-icon' onClick={saveProfile} title="Sauvegarder">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
              <button type="button" className='btn-cancel-icon' onClick={cancelEditing} title="Annuler">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          )}
        </div>

        <div className='info-container'>
          <div className='left-info'>

            <div className='biography'>
              <h4>Biographie</h4>
              <div className='subtitle-border'></div>
              {isEditing ? (
                <textarea
                  className='inline-edit-bio'
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Parlez de vous..."
                  maxLength={255}
                  rows={3}
                />
              ) : (
                <p className={!profile?.bio ? 'empty-state' : ''}>{displayBio}</p>
              )}
              {!isEditing && profile?.age && <p className='profile-age'>Age : {profile.age} ans</p>}
            </div>

            <div className='profile-stats'>
              <h4>Statistiques</h4>
              <div className='subtitle-border'></div>
              <div className='stats-grid'>
                <div className='stat-item'>
                  <span className='stat-value'>{stats?.totalGames || 0}</span>
                  <span className='stat-label'>Parties</span>
                </div>
                <div className='stat-item stat-win'>
                  <span className='stat-value'>{stats?.wins || 0}</span>
                  <span className='stat-label'>Victoires</span>
                </div>
                <div className='stat-item stat-loss'>
                  <span className='stat-value'>{stats?.losses || 0}</span>
                  <span className='stat-label'>Defaites</span>
                </div>
                <div className='stat-item'>
                  <span className='stat-value'>{stats?.winRate || 0}%</span>
                  <span className='stat-label'>Win Rate</span>
                </div>
              </div>
            </div>

            <div className='history'>
              <h4>Historique des Parties</h4>
              <div className='subtitle-border'></div>
              <div className='history-container'>
                {(userGames.length > 0) ?
                  userGames.map((game, i) => (
                    <div key={game.id} className={`history-bloc ${getResultClass(i, game.clientName)}`}>
                      <div className='history-game-icon'>
                        <span>{getGameDisplayName(gamesModel[i]) === "Mascarade" ? "🎭" : "🎮"}</span>
                      </div>

                      <div className='history-lines'>
                        <div className='top-line'>
                          <p><span className='subsub'>Resultat : </span><PlayerResult iteration={i} clientName={game.clientName} /></p>
                        </div>

                        <div className='bottom-line'>
                          <span className='subsub'>Joueurs : </span>
                          <PlayersList iteration={i} />
                          <p><span className='subsub'>Score :</span> {game.score}</p>
                        </div>
                      </div>

                    </div>
                  ))
                  :
                  <span className='empty-state'>Aucune partie jouee pour le moment</span>
                }
              </div>
            </div>
          </div>

          <div className='right-info'>

            <div className='best-game'>
              <h4>Jeu Prefere</h4>
              <div className='subtitle-border'></div>
              {(stats?.favoriteGame || stats?.mostPlayed) ? (
                <div className='game-line'>
                  <div className='history-game-icon'>
                    <span>{(stats.favoriteGame || stats.mostPlayed) === 'mascarade' ? '🎭' : '🎮'}</span>
                  </div>
                  <span>{getGameDisplayName(stats.favoriteGame || stats.mostPlayed)}</span>
                </div>
              ) : (
                <span className='empty-state'>Aucune partie jouee</span>
              )}
            </div>

            <div className='badge'>
              <h4>Badges</h4>
              <div className='subtitle-border'></div>
              {stats?.badges && stats.badges.length > 0 ? (
                <div className='badges-grid'>
                  {stats.badges.map(b => (
                    <div key={b.id} className='badge-item' title={b.description}>
                      <span className='badge-icon'>{b.icon}</span>
                      <span className='badge-name'>{b.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className='empty-state'>Aucun badge pour le moment</span>
              )}
            </div>

            {friendRequests.length > 0 && (
              <div className='friend-requests-section'>
                <h4>Demandes d'amis</h4>
                <div className='subtitle-border'></div>
                <div className='requests-list'>
                  {friendRequests.map((req) => (
                    <div key={req.requestId} className='request-item'>
                      <div className='request-user' onClick={() => navigate(`/profile/${req.username}`)} role="button" tabIndex={0}>
                        <img
                          src={'https://robohash.org/' + req.username}
                          alt={req.username}
                        />
                        <span>{req.username}</span>
                      </div>
                      <div className='request-actions'>
                        <button type="button" className='btn-accept' onClick={() => acceptRequest(req)}>Accepter</button>
                        <button type="button" className='btn-reject' onClick={() => rejectRequest(req)}>Refuser</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='friends-section'>
              <h4>Mes amis</h4>
              <div className='subtitle-border'></div>
              {friends.length > 0 ? (
                <div className='friends-list'>
                  {friends.map((friend) => (
                    <div
                      key={friend.friendshipId}
                      className='friend-item'
                      onClick={() => navigate(`/profile/${friend.username}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <img
                        src={'https://robohash.org/' + friend.username}
                        alt={friend.username}
                      />
                      <span>{friend.username}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className='empty-state'>Aucun ami pour le moment</span>
              )}
            </div>

          </div>
        </div>

        <div className='profile-footer'>
          <button type="button" className='btn-profile-logout' onClick={logOut}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Se deconnecter
          </button>
        </div>
      </div>

    </div>
  );
}
