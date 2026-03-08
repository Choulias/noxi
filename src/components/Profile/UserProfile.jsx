import { useState, useEffect, useContext } from 'react'
import api from "../../api";
import { useNavigate, useParams } from 'react-router-dom';
import { useToken } from '../Auth/useToken';
import { useUser } from '../Auth/useUser';
import { Context } from '../GlobalInfo';
import GameImg from "../../assets/img/tictactoe.png"

export default function UserProfile() {

  const user = useUser();
  const [token, setToken] = useToken();
  const [state, setState] = useContext(Context);

  const tokenId =  user.id;
  const tokenName = user.username;
  const tokenMail = user.mail;
  const tokenRole = user.role;
  const tokenStatus = user.status;

  const [username, setUsername] = useState(tokenName || '');
  const [password, setPassword] = useState('');
  const [mail, setMail] = useState(tokenMail || '');
  const navigate = useNavigate();
  const id = tokenId;


  useEffect(() => {
    if(user && state.userInfo.connected === 0){
    // J'actualise les données seulement s'il n'étaient pas mis a jour précedemment
      setState({ userInfo: { 
        connected : 1,
        id: user.id,
        username: user.username,
        mail: user.mail,
        role: user.role,
        image: user.image
      }});
    }

    getUserById();
    getUserGames();
  }, []);

  const updateUser = async (e) => {
    e.preventDefault();
    try{
        const response = await api.patch(`/users/${id}`, {
        username: username,
        password: password,
        mail: mail,
      });

      const { token : newToken} = response.data;
      setToken(newToken);
      navigate("/users");
    }catch(error){
      console.log("CATCH ERREUR" + error);
    }
    
  };

  const logOut = (e) =>{
    e.preventDefault();
    localStorage.removeItem('token');
    navigate("/login");
  }

  const getUserById = async () => {
    const response = await api.get(`/users/${id}`);
    setUsername(response.data.username);
    setPassword(response.data.password);
    setMail(response.data.mail);
  };

  const [userGames, setUserGames] = useState([]);
  const getUserGames = async () => {
    const response = await api.get(`/gameplayers/username/${username}`)
    const reversed = response.data.reverse();
    await getGamePlayers(reversed);
    await getGameModel(reversed);
    setUserGames(reversed);
    // await axios.get(`http://localhost:5000/gameplayers/username/${username}`)
    // .then(async(response) => {
    //   return getGamePlayers(response.data)
    // })
    // .then(async(gameplayers) => {
    //   return getGameModel(gameplayers);
    // })
    // .then(function(gamemodel){
    //   setUserGames(gamemodel);
    // })

    // const games =  axios.get(`http://localhost:5000/gameplayers/username/${username}`);
    // const gameplayers = games.then(function(response) {
    //     return getGamePlayers(response.data);
    // });

    // const gamemodel = gameplayers.then(function(gameplayers) {
    //   return getGameModel(gameplayers);
    // });

    // return Promise.all([games, gameplayers, gamemodel]).then(function(values) {
    //     setUserGames(values[2]);
    // });
}

  // const getGamePlayers = async (games) => {
  //   games.forEach(async (game) => {
  //     axios.get(`http://localhost:5000/gameplayers/gameid/${game.gameId}`)
  //     .then(function(res) {
  //       game.players = res.data;
  //     });
  //   });

  //   return games;
  // };

  // const getGameModel = async (games) => {
  //   console.log(games);
  //   games.forEach(async (game) => {
  //     axios.get(`http://localhost:5000/games/gameid/${game.gameId}`)
  //     .then(function(res) {
  //       game.gamemodel = res.data.gameModel;
  //     });
  //   });

  //   return games;
  // };

  const [gamesPlayers, setGamesPlayers] = useState([]);
  const getGamePlayers = async (games) => {
    let gamesplayers = [];
    games.forEach(async (game) => {
      await api.get(`/gameplayers/gameid/${game.gameId}`)
      .then(function(res) {
        gamesplayers.push(res.data);
        setGamesPlayers(gamesplayers)
      });
    });
  };

  const [gamesModel, setGamesModels] = useState([]);
  const getGameModel = async (games) => {
    let gamesmodel = [];
    games.forEach(async (game) => {
      await api.get(`/games/gameid/${game.gameId}`)
      .then(function(res) {
        gamesmodel.push(res.data.gameModel);
        setGamesModels(gamesmodel);
      });
    });
  };

  
  function PlayersNames(props) {
    const iteration = props.iteration;

    return (
      <div className='players-list'>
          {(gamesPlayers[iteration]).map(function(element, index){
              return <li key={ index }>{element.clientName}</li>;
          })}
      </div>
    );
  }

  function PlayersList(props) {
    const iteration = props.iteration;
    if (gamesPlayers[iteration] !== undefined) {
      return <PlayersNames iteration={iteration}/>;
    }
    return;
  }

  function PlayerResult(props) {
    const iteration = props.iteration;
    const clientName = props.clientName;
    let bestScore = 0;
    let playerScore = 0;
    if (gamesPlayers[iteration] !== undefined) {
      {(gamesPlayers[iteration]).map(function(element, index){
        if(element.clientName !== clientName){
          bestScore = element.score;
        }else{
          playerScore = element.score;
        }
      })}

      if(playerScore > bestScore){
        return <span className='result victory'>Victoire</span>
      }else if(playerScore < bestScore){
        return <span className='result defeat'>Défaite</span>
      }else{
        return <span className='result even'>Egalité</span>
      }
    }
    return;
  }

  return (
    <div className='conteneur main-container profil'>
      <h2>Mon profil</h2>
      <div className="title-border"></div>

      <div className='profile-board'>

        <div className='profile-banner'>
          <img
            className=""
            src={ ('https://robohash.org/'+ username)}
            alt=""
          />

          <div className='profile-resume'>
            <div className='profile-name'>
              <h3>Rochdi</h3>
              <span>{"@" + username}</span>
            </div>
            
            <div className='profile-level'>
              <span>Niveau 0</span>
              <div className='barre'>
                <div className="filled"></div>
              </div>
            </div>
          </div>
        </div>

        <div className='info-container'>
          <div className='left-info'>
            
              <div className='biography'>
                <h4>Biographie</h4>
                <div className='subtitle-border'></div>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean venenatis nisl sed justo scelerisque, eu commodo nisl bibendum. Fusce venenatis, massa a congue dictum, ante metus pulvinar mauris, id consequat ante sem et purus. Suspendisse sodales velit dui, eu convallis ipsum feugiat et.</p>
              </div>

              <div className='history'>
                <h4>Historique des Parties</h4>
                <div className='subtitle-border'></div>
                <div className='history-container'>
                  {userGames.map((game, i) => (
                    <div key={game.id} className='history-bloc'> 
                      <img
                          src={GameImg}
                          alt={''}
                      />

                      <div className='history-lines'>
                        <div className='top-line'>
                          {/* <span>Jeu : {((gamesModel[i] !== undefined) && (gamesModel[i] == "tictactoe") ) ? "Plateau OXO" : "Jeu test"}</span> */}
                          <p><span className='subsub'>Jeu :</span> Plateau OXO </p>
                          <p><span className='subsub'>Résultat : </span><PlayerResult iteration={i} clientName={game.clientName}/></p>
                        </div>
    
                        <div className='bottom-line'>
                          <span className='subsub'>Joueurs : </span>
                          <PlayersList iteration={i} />

                          <p><span className='subsub'>Score :</span> {game.score}</p>
                        </div>
                      </div>
                    
                    </div>
                  ))}
                </div>
              </div>
          </div>

          <div className='right-info'>

            <div className='best-game'>
              <h4>Jeu Préféré</h4>
              <div className='subtitle-border'></div>
              
                {(userGames.length > 0) ? 
                  <div className='game-line'>
                    <img
                      src={GameImg}
                      alt={''}
                    /> 
                    <span>Plateau OXO</span>
                  </div>
                : 
                  <span>Aucune partie n'a été joué par le joueur</span>
                }
            </div>

            <div className='badge'>
              <h4>Badges</h4>
              <div className='subtitle-border'></div>
              <span>Aucun badge pour le moment</span>
            </div>

          </div>
        </div>
        
        {/* {tokenStatus == "pending" && <div className="fail">Vous ne pourrez pas effectuer de changements tant que vous n'avez pas verifier votre mail</div>}
        <form onSubmit={updateUser}>
          <div className="field">
            <label className="label">Username</label>
            <input
              className="input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Password</label>
            <input
              className="input"
              type="text"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Mail</label>
            <input
              className="input"
              type="text"
              placeholder="Mail"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
            />
          </div>

          <div className="field">
            <button className="button is-primary">Update</button>
          </div>
        </form> */}

        {/* <button
          onClick={logOut}
          className="btn btn-primary"
          >
          Se deconnecter
        </button> */}
      </div>
      
    </div>
  );
}
