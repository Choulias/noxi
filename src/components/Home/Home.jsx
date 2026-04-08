import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { useLocation, useNavigate} from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import api from '../../api'
import Img1 from "../../assets/img/img1.png";
import Img2 from "../../assets/img/img2.png";
import Img3 from "../../assets/img/img3.png";
import Fond from "../../assets/img/fond.png";
import FondVideo from "../../assets/img/Fond_Video.mp4";
import Layer1 from "../../assets/img/layer_1.png";
import Layer2 from "../../assets/img/layer_2.png";

const USE_VIDEO_BACKGROUND = false;


export default function Home() {

    const parallaxRef = useRef(null);
    const countersTriggered = useRef(false);
    const [stats, setStats] = useState({ players: 0, games: 0, parties: 0 });
    const [displayCounts, setDisplayCounts] = useState({ players: 0, games: 0, parties: 0 });
    const [discordMembers, setDiscordMembers] = useState(null);

    // Fetch real stats
    useEffect(() => {
      const fetchStats = async () => {
        try {
          const [usersRes, modelsRes, partiesRes] = await Promise.all([
            api.get('/users/count').catch(() => ({ data: { count: 0 } })),
            api.get('/gamemodels').catch(() => ({ data: [] })),
            api.get('/games/count').catch(() => ({ data: { count: 0 } })),
          ]);
          const realParties = partiesRes.data?.count || 0;
          setStats({
            players: usersRes.data?.count || 0,
            games: Array.isArray(modelsRes.data) ? modelsRes.data.length : 0,
            parties: Math.max(realParties, 500),
          });
        } catch (e) {
          console.error("Stats fetch error:", e);
        }
      };
      fetchStats();

      // Fetch Discord member count via invite API
      fetch('https://discord.com/api/v9/invites/FEMtGpTcz9?with_counts=true')
        .then(res => res.json())
        .then(data => {
          if (data.approximate_member_count) setDiscordMembers(data.approximate_member_count);
        })
        .catch(() => {});
    }, []);

    useEffect(() => {
      const handleScroll = () => {
        if (!parallaxRef.current) return;
        const scrollY = window.scrollY;
        const layer2 = parallaxRef.current.querySelector('.parallax-layer2');
        const layer1 = parallaxRef.current.querySelector('.parallax-layer1');
        const text = parallaxRef.current.querySelector('.home-title');
        const fond = parallaxRef.current.querySelector('.parallax-fond');
        const scrollRatio = scrollY / window.innerHeight;
        const bottomStop = Math.max(40, 100 - scrollRatio * 120);
        const mask = scrollY > 10
          ? `linear-gradient(to bottom, white 0%, white ${bottomStop}%, transparent 100%)`
          : 'none';
        if (layer2) { layer2.style.transform = `translateY(-${scrollY * 0.4}px)`; layer2.style.maskImage = mask; layer2.style.webkitMaskImage = mask; }
        if (layer1) { layer1.style.transform = `translateY(-${scrollY * 0.4}px)`; layer1.style.maskImage = mask; layer1.style.webkitMaskImage = mask; }
        if (text) text.style.transform = `translateY(${scrollY * 0.15}px)`;
        const fondStop = Math.max(10, 100 - scrollRatio * 250);
        const fondMask = scrollY > 10
          ? `linear-gradient(to bottom, white ${fondStop}%, transparent 100%)`
          : 'none';
        if (fond) { fond.style.opacity = Math.max(0, 1 - scrollY / (window.innerHeight * 0.5)); fond.style.maskImage = fondMask; fond.style.webkitMaskImage = fondMask; }
        const content = document.querySelector('.home-content');
        const maxShift = window.innerHeight * 0.12;
        const shift = Math.min(scrollY * 0.15, maxShift);
        if (content) content.style.marginTop = `-${shift}px`;
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll animations pour les blocs home-paragraph
    useLayoutEffect(() => {
      gsap.registerPlugin(ScrollTrigger);

      const paragraphs = document.querySelectorAll('.home-paragraph');

      paragraphs.forEach((paragraph, index) => {
        const text = paragraph.querySelector('.paragraph-text');
        const image = paragraph.querySelector('.paragraph-image img');
        const circle = paragraph.querySelector('.paragraph-image .gradient-circle');
        const subtitle = paragraph.querySelector('.subtitle');
        const title = paragraph.querySelector('h2');
        const titleBorder = paragraph.querySelector('.title-border');
        const desc = paragraph.querySelector('p');
        const btn = paragraph.querySelector('.btn');

        // Direction : les blocs pairs (index 1) sont en row-reverse
        const isReversed = index % 2 === 1;
        const imageFromX = isReversed ? -80 : 80;
        const textFromX = isReversed ? 40 : -40;

        // Timeline pour le texte
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: paragraph,
            start: 'top 80%',
            end: 'top 30%',
            toggleActions: 'play none none none',
          }
        });

        // Subtitle fade in
        if (subtitle) {
          tl.fromTo(subtitle,
            { opacity: 0, x: textFromX * 0.5 },
            { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
            0
          );
        }

        // Titre slide in
        if (title) {
          tl.fromTo(title,
            { opacity: 0, x: textFromX },
            { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
            0.1
          );
        }

        // Title border width reveal
        if (titleBorder) {
          tl.fromTo(titleBorder,
            { scaleX: 0, transformOrigin: isReversed ? 'right center' : 'left center' },
            { scaleX: 1, duration: 0.6, ease: 'power2.inOut' },
            0.2
          );
        }

        // Paragraphe fade in up
        if (desc) {
          tl.fromTo(desc,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            0.3
          );
        }

        // Bouton fade in
        if (btn) {
          tl.fromTo(btn,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'transform' },
            0.45
          );
        }

        // Cercle gradient : scale up
        if (circle) {
          gsap.fromTo(circle,
            { opacity: 0, scale: 0.7 },
            {
              opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out',
              scrollTrigger: {
                trigger: paragraph,
                start: 'top 80%',
                toggleActions: 'play none none none',
              }
            }
          );
        }

        // Image : glisse depuis l'extérieur vers sa position
        if (image) {
          gsap.fromTo(image,
            { opacity: 0, x: imageFromX, y: -30 },
            {
              opacity: 1, x: 0, y: 0, duration: 0.9, ease: 'power3.out',
              scrollTrigger: {
                trigger: paragraph,
                start: 'top 75%',
                toggleActions: 'play none none none',
              }
            }
          );
        }
      });

      // Animation pour la citation
      const quote = document.querySelector('.game-quote');
      if (quote) {
        gsap.fromTo(quote,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: {
              trigger: quote,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        );
      }

      return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    }, []);

    // Counter scroll trigger - depends on stats
    useEffect(() => {
      gsap.registerPlugin(ScrollTrigger);
      const countersSection = document.querySelector('.home-content-counter');
      if (!countersSection) return;

      const trigger = ScrollTrigger.create({
        trigger: countersSection,
        start: 'top 85%',
        onEnter: () => {
          if (!countersTriggered.current && (stats.players > 0 || stats.games > 0 || stats.parties > 0)) {
            countersTriggered.current = true;
            animateCounter('players', stats.players);
            animateCounter('games', stats.games);
            animateCounter('parties', stats.parties);
          }
        }
      });

      gsap.fromTo(countersSection,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: {
            trigger: countersSection,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );

      return () => { trigger.kill(); };
    }, [stats]);

    let btns = document.querySelectorAll('.btn');
    btns.forEach((btn) => {
      btn.onmousemove = function (e) {
          var x = e.pageX - btn.offsetLeft
          var y = e.pageY - btn.offsetTop
          btn.style.setProperty('--x', x + 'px')
          btn.style.setProperty('--y', y + 'px')
      }
    })

    const location = useLocation();
    const navigate = useNavigate();

    function starsParticles(bool){
      if(bool){
        const RANDOM = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
        const PARTICLES = document.querySelectorAll('.star')
        PARTICLES.forEach(P => {
          P.setAttribute('style', `
            --angle: ${RANDOM(0, 360)};
            --duration: ${RANDOM(6, 20)};
            --delay: ${RANDOM(1, 10)};
            --alpha: ${RANDOM(40, 90) / 100};
            --size: ${RANDOM(2, 6)};
            --distance: ${RANDOM(40, 200)};
          `)
        })
      }else{
        return
      }
    }
    
    // Counter animation triggered by ScrollTrigger
    const animateCounter = (key, target) => {
      const duration = 1500;
      const start = Date.now();
      const step = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayCounts(prev => ({ ...prev, [key]: Math.floor(eased * target) }));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

  return (
    <div className='home'>
        <div className='home-parralax' ref={parallaxRef}>
          {/* Calque 0 : Fond (vidéo ou image) */}
          {USE_VIDEO_BACKGROUND ? (
            <video className='parallax-fond' autoPlay muted loop playsInline>
              <source src={FondVideo} type="video/mp4" />
            </video>
          ) : (
            <div className='parallax-fond parallax-fond-img' style={{ backgroundImage: `url(${Fond})` }}></div>
          )}

          {/* Calque 1 : Montagnes arrière-plan - remonte lentement */}
          <img className='parallax-layer2' src={Layer2} alt="" />

          {/* Calque 2 : Texte - entre les layers */}
          <div className='home-title conteneur'>
            <h1>NOXI, VOTRE PLATEFORME <br/> LUDIQUE NOCTURNE ...</h1>
            <h3>DECOUVREZ NOS DIFFERENTS JEUX ET <br/> AMUSEZ VOUS AVEC VOS AMIS !</h3>

            <div className="galaxy-button"
              onMouseEnter={() => starsParticles(true)}
              onMouseLeave={() => starsParticles(false)}>
              <button className='galaxy-btn'
              onClick={() => navigate("/games")}
              >
                <span className="backdrop"></span>
                <span className="galaxy__container">
                  <span className="star star--static"></span>
                  <span className="star star--static"></span>
                  <span className="star star--static"></span>
                  <span className="star star--static"></span>
                </span>
                <span className="galaxy">
                  <span className="galaxy__ring">
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                    <span className="star"></span>
                  </span>
                </span>
                <span className="text">EXPLORER</span>
              </button>
            </div>
          </div>

          {/* Calque 3 : Colline avant-plan - remonte vite, passe devant le texte */}
          <img className='parallax-layer1' src={Layer1} alt="" />

          <div className='home-gradient-transition'></div>
        </div>

        <div className='home-content'>
          <div className='home-content-child conteneur'>

            <div className='home-paragraph'>
              <div className='paragraph-text'>

                <div className="subtitle">
                  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="7" height="7" viewBox="0 0 7 7">
                    <defs>
                      <linearGradient id="linear-gradient" x1="0.882" y1="0.113" x2="0.153" y2="0.88" gradientUnits="objectBoundingBox">
                        <stop offset="0" stopColor="#febefd"/>
                        <stop offset="1" stopColor="#95fdfc"/>
                      </linearGradient>
                    </defs>
                    <circle id="circle_1" data-name="Ellipse 63" cx="3.5" cy="3.5" r="3.5" fill="url(#linear-gradient)"/>
                  </svg>

                  <h5>Notre histoire</h5>
                </div>

                <h2>Qui sommes nous ?</h2>
                <div className="title-border"></div>
                <p>
                  Bienvenue sur Noxi, la plateforme de jeu multijoueur qui offre une expérience de jeu en ligne unique et passionnante.<br/><br/>
                  Nous sommes déterminés à créer une communauté de joueurs qui partagent la même passion pour les jeux multijoueurs en ligne, où la compétition et l'amusement se rejoignent !<br/>
                </p>
                
                <button className='btn'
                  onClick={() => navigate("/support")}
                >
                  EN APPRENDRE PLUS
                </button>

              </div>

              <div className='paragraph-image'>
                <svg className="gradient-circle" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 510 510">
                  <defs>
                    <linearGradient id="linear-gradient" x1="0.921" y1="0.07" x2="0.045" y2="0.96" gradientUnits="objectBoundingBox">
                      <stop offset="0" stopColor="#95fdfc"/>
                      <stop offset="0" stopColor="#febefd"/>
                      <stop offset="1" stopColor="#95fdfc"/>
                      <stop offset="1" stopColor="#4b7f7e" stopOpacity="0"/>
                    </linearGradient>
                    <filter id="Ellipse_19" x="0" y="0" width="510" height="510" filterUnits="userSpaceOnUse">
                      <feOffset dy="3" input="SourceAlpha"/>
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feFlood floodOpacity="0.161"/>
                      <feComposite operator="in" in2="blur"/>
                      <feComposite in="SourceGraphic"/>
                    </filter>
                  </defs>
                  <g transform="matrix(1, 0, 0, 1, 0, 0)" filter="url(#Ellipse_19)">
                    <circle id="Ellipse_19-2" data-name="Ellipse 19" cx="246" cy="246" r="246" transform="translate(9 6)" fill="url(#linear-gradient)"/>
                  </g>
                </svg>

                <img
                  src={Img1}
                  alt="Manette Noxi"
                />

              </div>
             
            </div>


            <div className='home-paragraph'>
              <div className='paragraph-text'>
                <div className="subtitle">
                  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="7" height="7" viewBox="0 0 7 7">
                    <defs>
                      <linearGradient id="linear-gradient" x1="0.882" y1="0.113" x2="0.153" y2="0.88" gradientUnits="objectBoundingBox">
                        <stop offset="0" stopColor="#febefd"/>
                        <stop offset="1" stopColor="#95fdfc"/>
                      </linearGradient>
                    </defs>
                    <circle id="circle_1" data-name="Ellipse 63" cx="3.5" cy="3.5" r="3.5" fill="url(#linear-gradient)"/>
                  </svg>

                  <h5>Votre personnalisation</h5>
                </div>
                <h2>Personnalisez votre profil !</h2>
                <div className="title-border"></div>
                <p>
                  Inscrivez vous afin de pouvoir personnalisé votre profil !<br/>
                  Ayez votre propre nom d'utilisateur ainsi qu'une photo de profil de votre choix.<br/><br/>
                  Collectionnez des badges et apparaissez dans le classement pour prouver votre don pour les jeux vidéos !<br/>
                  Vous pourrez ainsi également rejoindre les parties de vos amis.<br/>
                </p>
                
                <button className='btn'
                onClick={() => navigate("/signup")}
                >
                  S'INSCRIRE
                </button>
              </div>

              <div className='paragraph-image'>
                <svg className="gradient-circle" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 510 510">
                  <defs>
                    <linearGradient id="linear-gradient" x1="0.921" y1="0.07" x2="0.045" y2="0.96" gradientUnits="objectBoundingBox">
                      <stop offset="0" stopColor="#95fdfc"/>
                      <stop offset="0" stopColor="#febefd"/>
                      <stop offset="1" stopColor="#95fdfc"/>
                      <stop offset="1" stopColor="#4b7f7e" stopOpacity="0"/>
                    </linearGradient>
                    <filter id="Ellipse_19" x="0" y="0" width="510" height="510" filterUnits="userSpaceOnUse">
                      <feOffset dy="3" input="SourceAlpha"/>
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feFlood floodOpacity="0.161"/>
                      <feComposite operator="in" in2="blur"/>
                      <feComposite in="SourceGraphic"/>
                    </filter>
                  </defs>
                  <g transform="matrix(1, 0, 0, 1, 0, 0)" filter="url(#Ellipse_19)">
                    <circle id="Ellipse_19-2" data-name="Ellipse 19" cx="246" cy="246" r="246" transform="translate(9 6)" fill="url(#linear-gradient)"/>
                  </g>
                </svg>

                <img
                  src={Img2}
                  alt="Personnalisation Noxi"
                />

              </div>
             
            </div>

            <div className='home-paragraph'>
              <div className='paragraph-text'>
                <div className="subtitle">
                  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="7" height="7" viewBox="0 0 7 7">
                    <defs>
                      <linearGradient id="linear-gradient" x1="0.882" y1="0.113" x2="0.153" y2="0.88" gradientUnits="objectBoundingBox">
                        <stop offset="0" stopColor="#febefd"/>
                        <stop offset="1" stopColor="#95fdfc"/>
                      </linearGradient>
                    </defs>
                    <circle id="circle_1" data-name="Ellipse 63" cx="3.5" cy="3.5" r="3.5" fill="url(#linear-gradient)"/>
                  </svg>

                  <h5>Notre communauté</h5>
                </div>
                <h2>Venez découvrir notre Discord !</h2>
                <div className="title-border"></div>
                <p>
                  Notre plateforme est connectée à notre serveur Discord, où vous pouvez rejoindre une communauté de joueurs dévoués qui partagent la même passion pour les jeux.<br/><br/>
                  C'est l'endroit idéal pour discuter, trouver des coéquipiers, partager des conseils et des stratégies de jeu, ainsi que participer à des événements organisés par la communauté.<br/><br/>
                  {discordMembers
                    ? <>Le serveur comptabilise deja <strong style={{color: '#95FDFC'}}>{discordMembers}</strong> personnes, rejoins nous !</>
                    : <>Rejoins notre communaute grandissante !</>
                  }<br/>
                </p>
                
                <a className='btn' target="_blank" href="https://discord.gg/FEMtGpTcz9">
                  <span>REJOINDRE</span>
                </a>

              </div>

              <div className='paragraph-image'>
                <svg className="gradient-circle" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 510 510">
                  <defs>
                    <linearGradient id="linear-gradient" x1="0.921" y1="0.07" x2="0.045" y2="0.96" gradientUnits="objectBoundingBox">
                      <stop offset="0" stopColor="#95fdfc"/>
                      <stop offset="0" stopColor="#febefd"/>
                      <stop offset="1" stopColor="#95fdfc"/>
                      <stop offset="1" stopColor="#4b7f7e" stopOpacity="0"/>
                    </linearGradient>
                    <filter id="Ellipse_19" x="0" y="0" width="510" height="510" filterUnits="userSpaceOnUse">
                      <feOffset dy="3" input="SourceAlpha"/>
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feFlood floodOpacity="0.161"/>
                      <feComposite operator="in" in2="blur"/>
                      <feComposite in="SourceGraphic"/>
                    </filter>
                  </defs>
                  <g transform="matrix(1, 0, 0, 1, 0, 0)" filter="url(#Ellipse_19)">
                    <circle id="Ellipse_19-2" data-name="Ellipse 19" cx="246" cy="246" r="246" transform="translate(9 6)" fill="url(#linear-gradient)"/>
                  </g>
                </svg>

                <img
                  src={Img3}
                  alt="Mail Noxi"
                />

              </div>
            </div>
          </div>

          {/* COMPTEUR --------------------------------------------------------------------------------------- */}
          <div className='home-content-counter'>
            <div className='counter-container conteneur'>
              <div className="counter player-counter">
                <h3 className="count">{displayCounts.players}</h3>
                <h6>Joueurs inscrits</h6>
              </div>

              <div className="counter game-counter">
                <h3 className="count">{displayCounts.games}</h3>
                <h6>Jeux disponibles</h6>
              </div>

              <div className="counter fun-counter">
                <h3 className="count">{displayCounts.parties}</h3>
                <h6>Parties jouees</h6>
              </div>
            </div>
          </div>

          <div className='game-quote conteneur'>
            <h3>« Video games are bad for you ? <br/> That's what they said about rock-n-roll. »</h3>
            <span> - Shigeru Miyamoto </span>
          </div>
        </div>
    </div>
  )
}
