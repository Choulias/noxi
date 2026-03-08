import { React, useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from "react-router-dom";
import api from "../../../api";

export default function Gamers() {

  useEffect(() => {
    getGameModels();
    getPlayerScores("tictactoe");

    document.querySelector(".dropdown-btn").classList.add("active");
    return () => {
      document.querySelector(".dropdown-btn").classList.remove("active");
    };
  }, []);

  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("tictactoe");
  const [clientName, setClientName] = useState("");
  
  const [playerScores, setPlayerScores] = useState([]);
  const getPlayerScores = async (slug) => {
      const response = await api.get(`/playerscores/slug/${slug}`);
      setPlayerScores(response.data);
  }

  const [games, setGames] = useState([]);
  const getGameModels = async () => {
    const response = await api.get('/gamemodels');
    setGames(response.data);
  }

  const searchPlayer = (event) =>{
    setClientName(event.target.value);
    findPlayer(event.target.value);
  }

  const findPlayer = async (clientName) => {
    if(clientName.length > 0){
      const response = await api.get(`/playerscores/slugntext/${activeFilter}/${clientName}`);
      setPlayerScores(response.data);
    }
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'gameSlug', headerName: "Slug de la partie", width: 200 },
    { field: 'playerId', headerName: 'Id du joueur', width: 200 },
    { field: 'clientName', headerName: 'Nom du joueur', width: 130 },
    { field: 'bestScore', headerName: 'Score du joueur', width: 130 }
  ];

  return (
    <div className='conteneur gamers'>
      <h2>Classements et joueurs</h2>
      <div className="title-border"></div>

      <div className="leaderboard">
        <div className="player-finder">
          <div className="game-filter">
            {games.map((item) => (
              <button
                key={item.slug}
                type="button"
                className={activeFilter === item.slug ? "active" : ""}
                onClick={() => {
                  setActiveFilter(item.slug);
                  getPlayerScores(item.slug);
                  setClientName("");
                }}
                >{item.name}
              </button>
            ))}
          </div>

          <div className="player-search">
            <input value={clientName} name="ClientName" onChange={searchPlayer} />
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 33.086 33.086">
              <path id="search" d="M24.1,24.1l7.366,7.366M27.782,14.891A12.891,12.891,0,1,1,14.891,2,12.891,12.891,0,0,1,27.782,14.891Z" transform="translate(-0.5 -0.5)" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"/>
            </svg>
          </div>
        </div>

        {/* <div style={{ height: 400, width: '100%' }}>
          <DataGrid
          rows={playerScores}
          columns={columns}
          initialState={{
              pagination: {
              paginationModel: { page: 0, pageSize: 5 },
              },
          }}
          pageSizeOptions={[5, 10]}
          // checkboxSelection
          />
        </div> */}

        <div className="games-table">
          <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
            {(playerScores.length > 0) ? (
              <div className="fond-table">
                <table>
                  <thead>
                    <tr>
                      <th>Joueurs</th>
                      <th>Meilleurs scores</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {playerScores.map((item, i) => (
                      <tr key={item.id}>
                        <td>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <img
                                className="w-full h-full rounded-full"
                                src={'https://robohash.org/'+ item.clientName }
                                alt=""
                              />
                            </div>

                            <div className="ml-3">
                              <p className="whitespace-no-wrap">
                                {item.clientName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td >
                          <p>{item.bestScore}</p>
                        </td>

                        <td >
                          <button
                            type="button"
                            className="join-btn btn"
                            onClick={() => {
                              navigate(`/profile/${item.clientName}`)
                            }}
                            >Voir le profil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="fond-table">
                <table>
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th >Jeu</th>
                      <th>Lobby</th>
                      <th></th>
                    </tr>
                  </thead>
                </table>
                <div className="empty-table">
                  <span>Il n'y a malheureusement aucune partie en cours, lancez-en une !</span>
                </div>
              </div>
            )   
          }
          </div>
        </div>
      </div>
      
    </div>
  )
}
