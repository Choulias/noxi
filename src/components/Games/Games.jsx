import { React, useState, useEffect, Fragment } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from "react-router-dom";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { NativeSelect } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Select from '@mui/material/Select';
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper';
import api from "../../api";
import GameImg from "../../assets/img/tictactoe.png"

export default function gameModels() {

  useEffect(() => {
    getGameModels();
    getPublicGames();

    document.querySelector(".game-nav a").classList.add("active");
    return () => {
      document.querySelector(".game-nav a").classList.remove("active");
    };
  }, []);

  const navigate = useNavigate();
  const [numberPlayers, setNumberPlayers] = useState();
  const [reach, setReach] = useState("public");
  const [gameId, setGameId] = useState("");

  const checkHandler = () => {
    setReach(reach === "public" ? "private" : "public");
  }

  const [gameModels, setGameModels] = useState([]);
  const getGameModels = async () => {
    const response = await api.get('/gamemodels');
    setGameModels(response.data);
  }

  const [publicGames, setPublicGames] = useState([]);
  const getPublicGames = async () => {
    const response = await api.get('/games/public');
    setPublicGames(response.data);
    await getPublicGamesUsers(response.data);
    // await getPublicGamesModels(response.data);
  }

  const [publicGamesUsers, setPublicGamesUsers] = useState([]);
  const getPublicGamesUsers = async (publicGames) => {
    let gamesUsers = [];
    publicGames.forEach( async (element) => {
      let response = await api.get(`/users/${element.ownerId}`);
      gamesUsers.push(response.data);
      setPublicGamesUsers(gamesUsers);
    });
  }

  const getPublicGamesUser = async (ownerId) => {
    let response = await api.get(`/users/${ownerId}`);
    return response.data;
  }

  const [publicGamesModels, setPublicGamesModels] = useState([]);
  const getPublicGamesModels = async (publicGames) => {
    let gamesModels = [];
    publicGames.forEach( async (element) => {
      let response = await api.get(`/gamemodels/slug/${element.gameModel}`);
      gamesModels.push(response.data);
      setPublicGamesModels(gamesModels);
    });
  }

  const tryRequire = (path) => {
    try {
     return require(`${path}`);
    } catch (err) {
     return null;
    }
  };

  const redirectGame = async (id) => {
    const response = await api.get(`/games/${id}`);
    setGameId(response.data.gameId);
    navigate("/tictactoe/" + response.data.gameId);
  }

  const joinGame = (params) => {
    return (
      <button
        type="button"
        className="join-btn btn"
        onClick={() => {
          redirectGame(params.row.id);
        }}
        >Rejoindre
      </button>
    )
  }

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }  

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'gameId', headerName: "ID de la partie", width: 200 },
    { field: 'numberPlayers', headerName: 'Nombre de joueurs Max', width: 200 },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'deletePlayer', headerName: "Supprimer", width: 100, renderCell: joinGame, sortable: false, filterable: false}
  ];

  const UserNameSpan = async (props) => {
    const userId = props.userId;
    const gameUser = await getPublicGamesUser(userId);
    return (<span>{gameUser.username}</span>);
  }

  function AutomaticNameSpan() {
    return (<span>Utilisateur Anonyme</span>);
  }

  function UserNameText(props) {
    const userId = props.userId;

    if ( userId !== null) {
      return <UserNameSpan userId={userId}/>;
    }
    return <AutomaticNameSpan/>;
  }

  return (
    <div className="conteneur gameModels main-container">

      {/* SLIDER DES DIFFERENTS JEUX ---------------------------------------- */}

      <Swiper className="gameModels-swiper"
        style={{
          "--swiper-pagination-color": "#95FDFC",
          "--swiper-pagination-bullet-inactive-color": "#FFFFFF",
          "--swiper-pagination-bullet-inactive-opacity": "0.3",
          "--swiper-pagination-bullet-size": "11px",
          "--swiper-pagination-bullet-horizontal-gap": "6px"
        }}
        
        spaceBetween={50}
        slidesPerView={1}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        onSlideChange={() => setNumberPlayers()}
      >
      {/* Création d'un swiper qui va passer par chacun des gameModels */}
        {gameModels.map((item) => (
          (() => {
            const numberPlayersList = []
            let firstElement;
            // Chaque GameModels a un un nombre de joueurs min/max différents
            // Fonction anonyme qui permet de déterminer cette info et le met dans une liste [] qui sera utilisé dans le Select
            for (let i = item.playersMin; i <= item.playersLimit; i++) {
              if(i === item.playersMin){
                firstElement = i;
              }
              numberPlayersList.push(i);
            }
            return(
              <SwiperSlide className={"gameModel game-" + item.slug} key={"game-" + item.name}>
                <div className="game-illustration">
                  
                  <img
                    src={GameImg}
                    alt={item.name}
                  />
                </div>

                <div className={"game-description "+ item.slug}>
                  <div className="game-text">
                    <h2>{item.name}</h2>
                    <div className="title-border"></div>
                    <p>{item.description}</p>
                  </div>
                  
                  <div className="game-launcher">

                    <div className="game-parameters">

                      <Listbox
                        value={numberPlayers ? numberPlayers : firstElement}
                        onChange={
                          setNumberPlayers
                        }>
                        {({ open }) => (
                          <>
                            <div className="tailwind-select">
                              <Listbox.Button className="selected-btn">
                                <span className="selected-text">
                                  <span> {numberPlayers ? (numberPlayers + " JOUEURS") : (firstElement + " JOUEURS")}</span>
                                </span>
                                <span className="selected-icon">
                                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                              </Listbox.Button>

                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="tailwind-options">
                                  {numberPlayersList.map((numberPlayer) => (
                                    <Listbox.Option
                                      key={"numberPlayer-" + numberPlayer}
                                      className={({ active }) =>
                                        classNames(
                                          active ? 'active-option' : 'non-active-option',
                                          'option '
                                        )
                                      }
                                      value={numberPlayer}
                                    >
                                      {() => (
                                        <>
                                          <div className="flex items-center">
                                            <span
                                              className={classNames((numberPlayers ? numberPlayers : firstElement) ? 'font-medium' : 'font-normal', 'ml-3 block truncate')}
                                            >
                                              {numberPlayer + " JOUEURS"}
                                            </span>
                                          </div>
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Listbox>

                      <div className="button-switch" id="button-switch">
                        <input type="checkbox"
                        className="checkbox"
                        onChange={checkHandler}
                        />
                        <div className="knobs">
                          <span>PUBLIQUE</span>
                        </div>    
                        <div className="layer"></div>
                      </div>

                    </div>
                    

                    <button className="btn" onClick={() => {
                      // Creer fonction qui va ajouter la partie dans la BDD
                      // Mettre en param les infos tels que : Nombre de joueurs, etc.
                      navigate(`/${item.slug}/${reach}/${numberPlayers ? numberPlayers : firstElement}`);
                    }}>
                      DEMARRER
                    </button>
                  </div>
                  
                </div>
            </SwiperSlide>
            )
          })()
        ))}
      </Swiper>

      {/* LISTE DES PARTIES PUBLIQUES DISPONIBLES ---------------------------------------- */}
      <h2>Parties publiques en cours</h2>
      <div className="title-border"></div>

      {/* <div className="games-table" style={{ height: 400, width: '100%' }}>
          <DataGrid
          rows={publicGames}
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
            {(publicGames.length > 0) ? (
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

                  <tbody>
                    {publicGames.map((item, i) => (
                      <tr key={item.id}>
                        <td>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <img
                                className="w-full h-full rounded-full"
                                src={((publicGamesUsers[i] !== undefined) && (publicGamesUsers[i] !== '')) ? ('https://robohash.org/'+ publicGamesUsers[i].username) : 'https://robohash.org/player'}
                                alt=""
                              />
                            </div>

                            <div className="ml-3">
                              <p className="whitespace-no-wrap">
                                {((publicGamesUsers[i] !== undefined) && (publicGamesUsers[i] !== '')) ? (publicGamesUsers[i].username) : 'Utilisateur anonyme'}
                                {/* {((item !== undefined) && (item.ownerId !== null)) ? (getPublicGamesUser(item.ownerId)) : ('Utilisateur anonyme')} */}
                                {/* <UserNameText userId={item.ownerId} /> */}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>
                          {((item !== undefined) && (item.gameModel === 'tictactoe')) ? ('Plateau OXO') : 'Le jeu test'}
                          {/* {(publicGamesModels[i] !== undefined) ? (publicGamesModels[i].name) : 'Jeu non défini'} */}
                        </td>

                        <td >
                          <p>{item.numberPlayers + " / " + item.maxPlayers}</p>
                        </td>

                        <td >
                          {((item !== undefined) && (item.status === 'pending')) ?
                          (<button
                            type="button"
                            className="join-btn btn"
                            onClick={() => {
                              redirectGame(item.id);
                            }}
                            >Rejoindre
                          </button>) : 
                          (<span>Plein</span>)
                          
                          }
                          
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
  );
}
