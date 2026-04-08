import { React, useState, useEffect, Fragment, useMemo, useLayoutEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from "react-router-dom";
import { Listbox, Transition, Dialog } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper';
import api from "../../api";
import { useUser } from '../Auth/useUser';
// GameImg removed - images come from database via API
import Spinner from "../UI/Spinner";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MASK_NAMES, MASK_ICONS, MASK_DESCRIPTIONS, MASK_CHIBIS } from "./Mascarade/mascaradeConstants.js";

const MASCARADE_SCENARIOS = {
  4: { A: { masks: ["juge","imperatrice","escroc","voleur","tricheur","roi"], center: 2 }, B: { masks: ["juge","imperatrice","fou","veuve","sorciere","mendiant"], center: 2 } },
  5: { A: { masks: ["juge","imperatrice","escroc","voleur","tricheur","roi"], center: 1 }, B: { masks: ["juge","imperatrice","fou","veuve","sorciere","mendiant"], center: 1 } },
  6: { A: { masks: ["escroc","princesse","juge","sorciere","mecene","tricheur"], center: 0 }, B: { masks: ["mendiant","juge","imperatrice","voleur","veuve","roi"], center: 0 } },
  7: { A: { masks: ["juge","imperatrice","fou","escroc","voleur","sorciere","mecene"], center: 0 }, B: { masks: ["escroc","roi","tricheur","veuve","juge","mendiant","princesse"], center: 0 } },
  8: { A: { masks: ["princesse","juge","espionne","escroc","voleur","tricheur","sorciere","roi"], center: 0 }, B: { masks: ["escroc","paysan","paysan","princesse","veuve","juge","marionnettiste","mendiant"], center: 0 } },
  9: { A: { masks: ["escroc","espionne","princesse","sorciere","imperatrice","juge","tricheur","voleur","mecene"], center: 0 }, B: { masks: ["mecene","marionnettiste","juge","gourou","veuve","princesse","paysan","paysan","mendiant"], center: 0 } },
  10: { A: { masks: ["escroc","espionne","princesse","sorciere","imperatrice","juge","tricheur","veuve","voleur","mecene"], center: 0 }, B: { masks: ["mendiant","veuve","mecene","sorciere","juge","princesse","gourou","paysan","paysan","escroc"], center: 0 } },
  11: { A: { masks: ["escroc","mecene","fou","paysan","paysan","imperatrice","princesse","juge","sorciere","marionnettiste","voleur"], center: 0 }, B: { masks: ["marionnettiste","tricheur","sorciere","juge","princesse","gourou","paysan","paysan","espionne","mecene","escroc"], center: 0 } },
  12: { A: { masks: ["escroc","fou","paysan","paysan","gourou","princesse","juge","sorciere","mecene","tricheur","mendiant","veuve"], center: 0 }, B: { masks: ["escroc","espionne","mecene","gourou","paysan","paysan","imperatrice","princesse","juge","sorciere","marionnettiste","tricheur"], center: 0 } },
};

const MascaradeSvg = () => (
  <svg viewBox="0 0 300 300" width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    {/* Cercle de joueurs */}
    <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(149,253,252,0.15)" strokeWidth="1" strokeDasharray="6 4" />
    {/* Cartes masques en cercle */}
    {[0,1,2,3,4,5,6,7].map((i) => {
      const angle = (2 * Math.PI * i) / 8 - Math.PI / 2;
      const x = 150 + 105 * Math.cos(angle);
      const y = 150 + 105 * Math.sin(angle);
      return (
        <g key={i} transform={`translate(${x},${y})`}>
          <rect x="-14" y="-19" width="28" height="38" rx="4" fill="#06122F" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <text x="0" y="5" textAnchor="middle" fontSize="14" fill="rgba(255,255,255,0.2)">🎭</text>
        </g>
      );
    })}
    {/* Centre — Justice */}
    <circle cx="150" cy="150" r="28" fill="rgba(255,215,0,0.08)" stroke="rgba(255,215,0,0.25)" strokeWidth="1" />
    <text x="150" y="146" textAnchor="middle" fontSize="16" fill="#ffd700">&#9878;</text>
    <text x="150" y="163" textAnchor="middle" fontSize="10" fill="rgba(255,215,0,0.6)" fontFamily="Poppins,sans-serif">Justice</text>
    {/* Glow decoratif */}
    <circle cx="150" cy="150" r="140" fill="none" stroke="url(#mascaradeGlow)" strokeWidth="2" opacity="0.3">
      <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="20s" repeatCount="indefinite"/>
    </circle>
    <defs>
      <linearGradient id="mascaradeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#95FDFC" />
        <stop offset="50%" stopColor="#FEBEFD" />
        <stop offset="100%" stopColor="#95FDFC" />
      </linearGradient>
    </defs>
  </svg>
);

export default function gameModels() {

  const user = useUser();
  const [favoriteGame, setFavoriteGame] = useState(null);

  useEffect(() => {
    if (user) {
      api.get(`/stats/${user.id}`)
        .then(res => setFavoriteGame(res.data.favoriteGame))
        .catch(() => {});
    }
  }, [user]);

  const toggleFavorite = async (slug) => {
    const newSlug = favoriteGame === slug ? null : slug;
    try {
      await api.post('/stats/favorite', { gameSlug: newSlug });
      setFavoriteGame(newSlug);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    Promise.all([getGameModels(), getPublicGames()]).finally(() => setLoading(false));

    // Rafraîchir la liste des parties toutes les 15 secondes
    const interval = setInterval(() => {
      getPublicGames();
    }, 15000);

    const gameNavLink = document.querySelector(".game-nav a");
    if (gameNavLink) gameNavLink.classList.add("active");
    return () => {
      clearInterval(interval);
      const el = document.querySelector(".game-nav a");
      if (el) el.classList.remove("active");
    };
  }, []);

  const navigate = useNavigate();
  const [numberPlayers, setNumberPlayers] = useState();

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Swiper fade in
    const swiper = document.querySelector('.gameModels-swiper');
    if (swiper) {
      gsap.fromTo(swiper,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: swiper, start: 'top 90%', toggleActions: 'play none none none' }
        }
      );
    }

    // Table des parties publiques
    const publicTable = document.querySelector('.games-public-table');
    if (publicTable) {
      gsap.fromTo(publicTable,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: publicTable, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);
  const [reach, setReach] = useState("public");
  const [selectedMode, setSelectedMode] = useState("classique");
  const [selectedVariant, setSelectedVariant] = useState("A");
  const [variantInfoOpen, setVariantInfoOpen] = useState(false);
  const checkHandler = () => {
    setReach(reach === "public" ? "private" : "public");
  }

  const [loading, setLoading] = useState(true);
  const [gameModels, setGameModels] = useState([]);
  const getGameModels = async () => {
    try {
      const response = await api.get('/gamemodels');
      setGameModels(Array.isArray(response.data) ? response.data : []);
    } catch (e) { console.error("Failed to load game models:", e); }
  }

  const [publicGames, setPublicGames] = useState([]);
  const getPublicGames = async () => {
    try {
      const response = await api.get('/games/public');
      setPublicGames(Array.isArray(response.data) ? response.data : []);
    } catch (e) { console.error("Failed to load public games:", e); }
  }

  const redirectGame = (gameModel, gameId) => {
    const model = gameModel || "tictactoe";
    navigate(`/${model}/${gameId}`);
  }

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }  

  const [gamesPage, setGamesPage] = useState(0);
  const gamesPerPage = 9;

  const pagedGames = useMemo(() => {
    return publicGames.slice(gamesPage * gamesPerPage, (gamesPage + 1) * gamesPerPage);
  }, [publicGames, gamesPage]);

  const gamesTotalPages = Math.ceil(publicGames.length / gamesPerPage);

  if (loading) {
    return (
      <div className="conteneur gameModels main-container">
        <Spinner text="Chargement des jeux..." />
      </div>
    );
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
        loop={true}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        onSlideChange={() => { setNumberPlayers(); setSelectedMode("classique"); setSelectedVariant("A"); }}
      >
      {/* Création d'un swiper qui va passer par chacun des gameModels */}
        {gameModels.map((item) => (
          (() => {
            const firstElement = item.playersMin;
            return(
              <SwiperSlide className={"gameModel game-" + item.slug} key={"game-" + item.name}>
                {user && (
                  <button
                    type="button"
                    className={`favorite-game-btn ${favoriteGame === item.slug ? 'active' : ''}`}
                    onClick={() => toggleFavorite(item.slug)}
                    title={favoriteGame === item.slug ? 'Retirer des favoris' : 'Mettre en favori'}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill={favoriteGame === item.slug ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                )}
                <div className="game-illustration">
                  {item.image ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${item.image}`}
                      alt={item.name}
                    />
                  ) : item.slug === 'mascarade' ? (
                    <MascaradeSvg />
                  ) : (
                    <div className="game-illustration-placeholder">
                      <span>🎮</span>
                    </div>
                  )}
                </div>

                <div className={"game-description "+ item.slug}>
                  <div className="game-text">
                    <h2>{item.name}</h2>
                    <div className="title-border"></div>
                    <p>{item.description}</p>
                  </div>
                  
                  <div className="game-launcher">

                    <div className="game-parameters">

                      <div className="players-input-wrap">
                        <button className="players-input-btn" onClick={() => {
                          const cur = numberPlayers || firstElement;
                          if (cur > item.playersMin) setNumberPlayers(cur - 1);
                        }}>−</button>
                        <span className="players-input-value">{numberPlayers || firstElement}</span>
                        <button className="players-input-btn" onClick={() => {
                          const cur = numberPlayers || firstElement;
                          if (cur < item.playersLimit) setNumberPlayers(cur + 1);
                        }}>+</button>
                        <span className="players-input-label">JOUEURS</span>
                      </div>

                      <div className="button-switch" id="button-switch">
                        <input type="checkbox"
                        className="checkbox"
                        onChange={checkHandler}
                        />
                        <div className="knobs">
                          <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                          </span>
                        </div>
                        <div className="layer"></div>
                      </div>

                      {item.modes && item.modes.length > 1 && (
                        <Listbox value={selectedMode} onChange={setSelectedMode}>
                          {({ open }) => (
                            <div className="tailwind-select">
                              <Listbox.Button className="selected-btn">
                                <span className="selected-text">
                                  <span>{item.modes.find(m => m.value === selectedMode)?.label || item.modes[0]?.label || "MODE"}</span>
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
                                  {item.modes.map((m) => (
                                    <Listbox.Option
                                      key={m.value}
                                      className={({ active }) =>
                                        classNames(
                                          active ? 'active-option' : 'non-active-option',
                                          'option '
                                        )
                                      }
                                      value={m.value}
                                    >
                                      {() => (
                                        <div className="flex items-center">
                                          <span className={classNames(selectedMode === m.value ? 'font-medium' : 'font-normal', 'ml-3 block truncate')}>
                                            {m.label}
                                          </span>
                                        </div>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          )}
                        </Listbox>
                      )}

                      {item.slug === "mascarade" && (
                        <div className="variant-selector">
                          <div className="variant-buttons">
                            <button
                              className={`variant-btn ${selectedVariant === "A" ? "active" : ""}`}
                              onClick={() => setSelectedVariant("A")}
                            >A</button>
                            <button
                              className={`variant-btn ${selectedVariant === "B" ? "active" : ""}`}
                              onClick={() => setSelectedVariant("B")}
                            >B</button>
                          </div>
                          <button className="variant-info-btn" onClick={() => setVariantInfoOpen(true)}>?</button>
                        </div>
                      )}

                    </div>


                    <button className="btn" onClick={() => {
                      const base = `/${item.slug}/${reach}/${numberPlayers ? numberPlayers : firstElement}`;
                      const hasCustomMode = item.modes && item.modes.length > 1 && selectedMode !== item.modes[0]?.value;
                      let url = hasCustomMode ? `${base}/${selectedMode}` : base;
                      if (item.slug === "mascarade" && selectedVariant === "B") {
                        url += (url.includes("?") ? "&" : "?") + "variant=B";
                      }
                      navigate(url);
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
      <div className="admin-table-custom games-public-table">
        <div className="admin-table-header">
          <h3>Parties publiques en cours</h3>
        </div>

        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Jeu</th>
                <th>Mode</th>
                <th>Lobby</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagedGames.length === 0 ? (
                <tr><td colSpan="5" className="empty-row">Aucune partie en cours, lancez-en une !</td></tr>
              ) : pagedGames.map((item, idx) => (
                <tr key={item.id} className="table-row-animated" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <td>
                    <div className="cell-user">
                      <img className="cell-avatar" src={'https://robohash.org/' + (item.ownerName || 'player')} alt="" />
                      <span>{item.ownerName || 'Anonyme'}</span>
                    </div>
                  </td>
                  <td><span className="slug-badge">{item?.gameModel === 'tictactoe' ? 'OXO' : item?.gameModel === 'mascarade' ? 'Mascarade' : item?.gameModel || 'Jeu'}</span></td>
                  <td className="cell-muted">{item?.gameMode ? item.gameMode.charAt(0).toUpperCase() + item.gameMode.slice(1) : '—'}</td>
                  <td className="cell-center">{item.numberPlayers + " / " + item.maxPlayers}</td>
                  <td className="cell-actions">
                    {item.status === 'pending' ? (
                      <button className="join-btn btn" onClick={() => redirectGame(item.gameModel, item.gameId)}>Rejoindre</button>
                    ) : (
                      <span className="status-badge pending">Plein</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span className="admin-table-count">Vue {publicGames.length === 0 ? 0 : gamesPage * gamesPerPage + 1}–{Math.min((gamesPage + 1) * gamesPerPage, publicGames.length)} sur {publicGames.length} éléments</span>
          {gamesTotalPages > 1 && (
            <div className="admin-pagination">
              <button disabled={gamesPage === 0} onClick={() => setGamesPage(gamesPage - 1)}>&laquo;</button>
              {Array.from({ length: gamesTotalPages }, (_, i) => (
                <button key={i} className={gamesPage === i ? 'active' : ''} onClick={() => setGamesPage(i)}>{i + 1}</button>
              ))}
              <button disabled={gamesPage >= gamesTotalPages - 1} onClick={() => setGamesPage(gamesPage + 1)}>&raquo;</button>
            </div>
          )}
        </div>
      </div>

      {/* Mascarade variant info popup */}
      <Transition.Root show={variantInfoOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setVariantInfoOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="variant-info-modal">
                  <Dialog.Title as="h3" className="variant-info-title">
                    Configuration des masques
                  </Dialog.Title>
                  <p className="variant-info-subtitle">Composition pour {numberPlayers || 4} joueurs — la variante sélectionnée est mise en avant</p>
                  <div className="variant-info-content">
                    {["A", "B"].map(v => {
                      const count = numberPlayers || 4;
                      const scenario = MASCARADE_SCENARIOS[count]?.[v];
                      if (!scenario) return null;
                      return (
                        <div key={v} className={`variant-info-block ${selectedVariant === v ? "selected" : ""}`}>
                          <h4>Variante {v}</h4>
                          <div className="variant-block-divider"></div>
                          {scenario.center > 0 && <p className="variant-center-info">{scenario.center} carte{scenario.center > 1 ? "s" : ""} au centre</p>}
                          <div className="variant-mask-list">
                            {scenario.masks.map((mask, i) => (
                              <div key={`${mask}-${i}`} className="variant-mask-item">
                                <span className="variant-mask-icon">
                                  {MASK_CHIBIS[mask] ? <img className="variant-mask-chibi" src={MASK_CHIBIS[mask]} alt={MASK_NAMES[mask] || mask} /> : (MASK_ICONS[mask] || "🎭")}
                                </span>
                                <div className="variant-mask-info">
                                  <span className="variant-mask-name">{MASK_NAMES[mask] || mask}</span>
                                  <span className="variant-mask-desc">{MASK_DESCRIPTIONS[mask] || ""}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button className="variant-info-close" onClick={() => setVariantInfoOpen(false)}>Fermer</button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
