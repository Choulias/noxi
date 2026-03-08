import { useState, useEffect, useContext } from 'react'
import api from "../../api";
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../Auth/useUser';
import { Context } from '../GlobalInfo';
import GameImg from "../../assets/img/tictactoe.png"

export default function UserProfile() {

  const params = useParams();
  const user = useUser();
  const [state, setState] = useContext(Context);

  const [username, setUsername] = useState(params.username || '');
  const [mail, setMail] = useState('');
  const navigate = useNavigate();

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

    if(user && user.username == username){
      navigate(`/myprofile`);
    }else{
      getUserById();
      getUserGames();
    }
  }, []);

  const getUserById = async () => {
    const response = await api.get(`/users/username/${username}`);
    
    if(response.data.length !== 0){
      setUsername(response.data.username)
      setMail(response.data.mail);
    }else{
      navigate(`/notfound`);
    }
  };

  const [userGames, setUserGames] = useState([]);
  const getUserGames = async () => {
    const response = await api.get(`/gameplayers/username/${username}`)
    await getGamePlayers(response.data);
    await getGameModel(response.data);
    setUserGames(response.data);
  }

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
      <h2>Profil de {username}</h2>
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
                  {(userGames.length > 0) ? 
                    userGames.map((game, i) => (
                      <div key={game.id} className='history-bloc'> 
                        <img
                            src={GameImg}
                            alt={''}
                        />

                        <div className='history-lines'>
                          <div className='top-line'>
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
                    ))
                  : 
                    <span>Aucune partie n'a été joué par le joueur</span>
                  }
                  
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
      </div>
      
    </div>
  );
}
