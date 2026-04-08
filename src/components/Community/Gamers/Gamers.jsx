import { React, useState, useEffect, useMemo, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const title = document.querySelector('.gamers > h2');
    const border = document.querySelector('.gamers > .title-border');
    const leaderboard = document.querySelector('.leaderboard');

    if (title) {
      gsap.fromTo(title,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: title, start: 'top 90%', toggleActions: 'play none none none' }
        }
      );
    }
    if (border) {
      gsap.fromTo(border,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.6, ease: 'power2.inOut',
          scrollTrigger: { trigger: border, start: 'top 90%', toggleActions: 'play none none none' }
        }
      );
    }
    if (leaderboard) {
      gsap.fromTo(leaderboard,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: leaderboard, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);
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

  const [page, setPage] = useState(0);
  const perPage = 9;

  const paged = useMemo(() => {
    return playerScores.slice(page * perPage, (page + 1) * perPage);
  }, [playerScores, page]);

  const totalPages = Math.ceil(playerScores.length / perPage);

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
                className={activeFilter === item.slug ? "active" : "gradient-hover"}
                onClick={() => {
                  setActiveFilter(item.slug);
                  getPlayerScores(item.slug);
                  setClientName("");
                  setPage(0);
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

        <div className="admin-table-custom">
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Joueur</th>
                  <th>Meilleur score</th>
                  <th></th>
                </tr>
              </thead>
              <tbody key={`filter-${activeFilter}`}>
                {paged.length === 0 ? (
                  <tr><td colSpan="3" className="empty-row">Aucun score enregistré</td></tr>
                ) : paged.map((item, idx) => (
                  <tr key={item.id} className="table-row-animated" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td>
                      <div className="cell-user">
                        <img className="cell-avatar" src={'https://robohash.org/' + item.clientName} alt="" />
                        <span>{item.clientName}</span>
                      </div>
                    </td>
                    <td className="cell-center cell-bold">{item.bestScore}</td>
                    <td className="cell-actions">
                      <button className="join-btn btn" onClick={() => navigate(`/profile/${item.clientName}`)}>Voir le profil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-table-footer">
            <span className="admin-table-count">Vue {playerScores.length === 0 ? 0 : page * perPage + 1}–{Math.min((page + 1) * perPage, playerScores.length)} sur {playerScores.length} éléments</span>
            {totalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={page === 0} onClick={() => setPage(page - 1)}>&laquo;</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={page === i ? 'active' : ''} onClick={() => setPage(i)}>{i + 1}</button>
                ))}
                <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>&raquo;</button>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  )
}
