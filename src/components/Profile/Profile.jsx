import { useState, useEffect, useContext, useLayoutEffect } from 'react'
import api from "../../api";
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../Auth/useUser';
import { Context } from '../GlobalInfo';
// Images come from database via API
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useToast } from '../UI/Toast';

export default function UserProfile() {

  const params = useParams();
  const user = useUser();
  const [state, setState] = useContext(Context);

  const { addToast } = useToast();
  const [username, setUsername] = useState(params.username || '');
  const [mail, setMail] = useState('');
  const [targetUserId, setTargetUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Friend system state
  const [friendStatus, setFriendStatus] = useState('none'); // 'none' | 'request_sent' | 'request_received' | 'friends'
  const [pendingRequest, setPendingRequest] = useState(null);
  const [friendship, setFriendship] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);

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

    if (user && user.username == username) {
      navigate(`/myprofile`);
    } else {
      getUserById();
    }
  }, []);

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
  }, [username]);

  const getUserById = async () => {
    try {
      const response = await api.get(`/users/username/${username}`);
      if (response.data.length !== 0) {
        setUsername(response.data.username);
        setMail(response.data.mail);
        setTargetUserId(response.data.id);
        // Load profile, games, stats, and friend status after getting user ID
        getProfile(response.data.id);
        getUserGames(response.data.username);
        loadStats(response.data.id);
        if (user) checkFriendStatus(response.data.id);
      } else {
        navigate(`/notfound`);
      }
    } catch (error) {
      console.error("Erreur chargement utilisateur:", error);
      navigate(`/notfound`);
    }
  };

  const getProfile = async (userId) => {
    try {
      const response = await api.get(`/profiles/user/${userId}`);
      setProfile(response.data);
    } catch (error) {
      setProfile(null);
    }
  };

  const loadStats = async (userId) => {
    try {
      const res = await api.get(`/stats/${userId}`);
      setStats(res.data);
    } catch (e) { console.error("Stats error:", e); }
  };

  // Friend system
  const checkFriendStatus = async (targetId) => {
    if (!user || !targetId) return;
    try {
      // Check pending requests
      const reqRes = await api.get('/friendrequests/mine');
      const requests = reqRes.data;
      const sentRequest = requests.find(r => r.inviterId === user.id && r.invitedId === targetId);
      const receivedRequest = requests.find(r => r.inviterId === targetId && r.invitedId === user.id);

      if (sentRequest) {
        setFriendStatus('request_sent');
        setPendingRequest(sentRequest);
        return;
      }
      if (receivedRequest) {
        setFriendStatus('request_received');
        setPendingRequest(receivedRequest);
        return;
      }

      // Check friendships
      const friendRes = await api.get('/friendships/mine');
      const friendships = friendRes.data;
      const existing = friendships.find(f =>
        (f.uid_1 === user.id && f.uid_2 === targetId) ||
        (f.uid_1 === targetId && f.uid_2 === user.id)
      );

      if (existing) {
        setFriendStatus('friends');
        setFriendship(existing);
        return;
      }

      setFriendStatus('none');
      setPendingRequest(null);
      setFriendship(null);
    } catch (error) {
      console.error("Erreur verification amitie:", error);
    }
  };

  const sendFriendRequest = async () => {
    if (!user || !targetUserId) return;
    setFriendLoading(true);
    try {
      await api.post('/friendrequests', { inviterId: user.id, invitedId: targetUserId });
      await checkFriendStatus(targetUserId);
      addToast("Demande d'ami envoyee !", "success");
    } catch (error) {
      console.error("Erreur envoi demande:", error);
      addToast("Erreur lors de l'envoi", "error");
    }
    setFriendLoading(false);
  };

  const acceptFriendRequest = async () => {
    if (!pendingRequest) return;
    setFriendLoading(true);
    try {
      await api.post('/friendships', { uid_1: pendingRequest.inviterId, uid_2: pendingRequest.invitedId });
      await api.delete(`/friendrequests/${pendingRequest.id}`);
      await checkFriendStatus(targetUserId);
      addToast("Demande acceptee !", "success");
    } catch (error) {
      console.error("Erreur acceptation demande:", error);
      addToast("Erreur lors de l'acceptation", "error");
    }
    setFriendLoading(false);
  };

  const rejectFriendRequest = async () => {
    if (!pendingRequest) return;
    setFriendLoading(true);
    try {
      await api.delete(`/friendrequests/${pendingRequest.id}`);
      await checkFriendStatus(targetUserId);
      addToast("Demande refusee", "info");
    } catch (error) {
      console.error("Erreur rejet demande:", error);
      addToast("Erreur lors du refus", "error");
    }
    setFriendLoading(false);
  };

  const removeFriend = async () => {
    if (!friendship) return;
    setFriendLoading(true);
    try {
      await api.delete(`/friendships/${friendship.id}`);
      await checkFriendStatus(targetUserId);
      addToast("Ami retire", "info");
    } catch (error) {
      console.error("Erreur suppression ami:", error);
      addToast("Erreur lors de la suppression", "error");
    }
    setFriendLoading(false);
  };

  // Game history
  const [userGames, setUserGames] = useState([]);
  const getUserGames = async (uname) => {
    try {
      const response = await api.get(`/gameplayers/username/${uname}`);
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
      <h2>Profil de {displayName}</h2>

      <div className='profile-board'>

        <div className='profile-banner'>
          <img
            src={'https://robohash.org/' + username}
            alt={username}
          />

          <div className='profile-resume'>
            <div className='profile-name'>
              <h3>{displayName}</h3>
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

          {user && (
            <div className='friend-actions'>
              {friendStatus === 'none' && (
                <button
                  type="button"
                  className='btn-add-friend'
                  onClick={sendFriendRequest}
                  disabled={friendLoading}
                  title="Ajouter en ami"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
                  </svg>
                </button>
              )}

              {friendStatus === 'request_sent' && (
                <span className='btn-pending' title="Demande envoyee">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </span>
              )}

              {friendStatus === 'request_received' && (
                <>
                  <button
                    type="button"
                    className='btn-accept'
                    onClick={acceptFriendRequest}
                    disabled={friendLoading}
                    title="Accepter"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <button
                    type="button"
                    className='btn-reject'
                    onClick={rejectFriendRequest}
                    disabled={friendLoading}
                    title="Refuser"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </>
              )}

              {friendStatus === 'friends' && (
                <>
                  <span className='btn-friends-badge' title="Amis">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>
                    </svg>
                  </span>
                  <button
                    type="button"
                    className='btn-remove-friend'
                    onClick={removeFriend}
                    disabled={friendLoading}
                    title="Retirer"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="11" x2="23" y2="11"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className='info-container'>
          <div className='left-info'>

            <div className='biography'>
              <h4>Biographie</h4>
              <div className='subtitle-border'></div>
              <p>{displayBio}</p>
              {profile?.age && <p className='profile-age'>Age : {profile.age} ans</p>}
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
                  <span className='empty-state'>Aucune partie jouee par ce joueur</span>
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

          </div>
        </div>
      </div>

    </div>
  );
}
