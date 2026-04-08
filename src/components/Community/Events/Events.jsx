import { React, useState, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../../api";
// Images come from database via API
import { useParams, useNavigate, Link } from 'react-router-dom';
import Spinner from "../../UI/Spinner";
import { useUser } from "../../Auth/useUser";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Events() {

    const navigate = useNavigate();
    const user = useUser();
    const {model} = useParams();
    let userId = user ? user.id : null; // L'id du joueur connecté, sinon null
    const [activeFilter, setActiveFilter] = useState("all");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function fetchData() {
        try {
          const allEvents = await getEvents(); // 1) Functions calls -> 2) getEventsAttendees() that calls -> 3) getEventsLikers()
          const gameModels = await getGameModels();
          filterEvents(gameModels, allEvents);
        } catch (err) {
          console.error('Failed to fetch events data:', err);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
      getSpotlightEvent();
      
      document.querySelector(".dropdown-btn").classList.add("active");
      return () => {
        document.querySelector(".dropdown-btn").classList.remove("active");
      };
    }, []);

    useLayoutEffect(() => {
      gsap.registerPlugin(ScrollTrigger);

      // Titre principal + border
      const mainTitle = document.querySelector('.events > h2:first-of-type');
      const mainBorder = document.querySelector('.events > .spotlight-border');
      if (mainTitle) {
        gsap.fromTo(mainTitle,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: mainTitle, start: 'top 90%', toggleActions: 'play none none none' }
          }
        );
      }
      if (mainBorder) {
        gsap.fromTo(mainBorder,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.6, ease: 'power2.inOut',
            scrollTrigger: { trigger: mainBorder, start: 'top 90%', toggleActions: 'play none none none' }
          }
        );
      }

      // Spotlight event
      const spotlight = document.querySelector('.spotlight-event');
      if (spotlight) {
        gsap.fromTo(spotlight,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: spotlight, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }

      // Titre "Autres événements" + border + filtres
      const otherTitle = document.querySelector('.events .other-border')?.previousElementSibling;
      const otherBorder = document.querySelector('.events .other-border');
      const filters = document.querySelector('.event-filter');
      if (otherTitle) {
        gsap.fromTo(otherTitle,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: otherTitle, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }
      if (otherBorder) {
        gsap.fromTo(otherBorder,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.6, ease: 'power2.inOut',
            scrollTrigger: { trigger: otherBorder, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }
      if (filters) {
        gsap.fromTo(filters,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
            scrollTrigger: { trigger: filters, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }

      // Cards
      const cards = document.querySelectorAll('.event-card');
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, delay: i * 0.08, ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' }
          }
        );
      });

      // Message banner
      const banner = document.querySelector('.message-banner');
      if (banner) {
        gsap.fromTo(banner,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: banner, start: 'top 90%', toggleActions: 'play none none none' }
          }
        );
      }

      return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    }, []);

    // FONCTIONS POUR RECEVOIR DES INFORMATIONS D'EVENEMENTS ET MODELES

    const [events, setEvents] = useState([]);
    const [noSpotlightEvents, setNoSpotlightEvents] = useState([]);

    const getEvents = async () => {
        const response = await api.get('/events/notspotlight');
        const eventsattendees = await getEventsAttendees(response.data);
        const eventslikers = await getEventsLikers(eventsattendees);
        setEvents(eventslikers);
        setNoSpotlightEvents(eventslikers);
        return eventslikers;
    }

    const [games, setGames] = useState([]);
    const getGameModels = async () => {
      const response = await api.get('/gamemodels');
      const uniqueModels = response.data.filter((model, index, self) =>
        index === self.findIndex(m => m.slug === model.slug)
      );
      setGames(uniqueModels);
      return uniqueModels;
    }

    const filterEvents = (gameModels, allEvents) =>{
      if(model !== undefined){
        gameModels.forEach(element => {
          if(element.slug == model){
            getModelEvents(element.slug, allEvents);
            setActiveFilter(element.slug);
          }
        });
      }
    }

    const getModelEvents = (slug, events) =>{
      let nospotevents;

      if(events !== undefined){
        nospotevents = events;
      }else{
        nospotevents = noSpotlightEvents;
      }

      let modelevents = [];

      nospotevents.forEach(element => {
        if(element.theme == slug){
          modelevents.push(element);
        }
      });
      setEvents(modelevents);
    }

    const getAllEvents = () =>{
      let nospotevents = noSpotlightEvents;
      setEvents(nospotevents);
    }

    const [spotlightEvent, setSpotlightEvent] = useState(null);
    const [hasSpotlight, setHasSpotlight] = useState(true);
    const getSpotlightEvent = async () => {
      try {
        const response = await api.get('/events/spotlight');
        if (response.data && response.data.id) {
            setHasSpotlight(true);
            getSpotlightAttendees(response.data);
        } else {
            setHasSpotlight(false);
        }
      } catch (err) {
        console.error('Failed to fetch spotlight event:', err);
        setHasSpotlight(false);
      }
    }

    // FONCTIONS POUR INTERAGIR AVEC LES EVENEMENTS ------------------------------------------------------

    const getEventsAttendees = async(evenements) => {

      await Promise.all(evenements.map(async (evenement) => {
        const res = await api.get(`/eventattendees/event/${evenement.id}`);
        evenement.numberAttendees = res.data.length;
        evenement.attendees = [];
        evenement.attended = 0;

        if(res.data.length > 0){
          res.data.forEach((attendee) => {
            evenement.attendees.push(attendee.userId);
            if(userId == attendee.userId){
              evenement.attended = 1;
            }
          })
        }
      }));

      return evenements;
    }

    const getEventsLikers = async(evenements) => {

      await Promise.all(evenements.map(async (evenement) => {
        const res = await api.get(`/eventlikers/event/${evenement.id}`);

        evenement.numberLikers = res.data.length;
        evenement.likers = [];
        evenement.liked = 0;

        if(res.data.length > 0){
          res.data.forEach((liker) => {
            evenement.likers.push(liker.userId);
            if(userId == liker.userId){
              evenement.liked = 1;
            }
          })
        }
      }));

      return evenements;
    }

    const getSpotlightAttendees = async(evenement) => {
      await api.get(`/eventattendees/event/${evenement.id}`)
      .then(function(res) {
        evenement.numberAttendees = res.data.length;
        evenement.attendees = [];
        evenement.attended = 0;

        if(res.data.length > 0){
          res.data.forEach((attendee) => {
            evenement.attendees.push(attendee.userId);
            if(userId == attendee.userId){
              evenement.attended = 1;
            }
          })
        }
      });
      getSpotlightLikers(evenement);
    }

    const getSpotlightLikers = async(evenement) => {

      await api.get(`/eventlikers/event/${evenement.id}`)
      .then(function(res) {
        evenement.numberLikers = res.data.length;
        evenement.likers = [];
        evenement.liked = 0;

        if(res.data.length > 0){
          res.data.forEach((liker) => {
            evenement.likers.push(liker.userId);
            if(userId == liker.userId){
              evenement.liked = 1;
            }
          })
        }
      });

      setSpotlightEvent(evenement);
    }

    const attendEvent = async (eventId, eventType) => { // METTRE EN PARAMETRE LE TYPE D4EVENT POUR SAVOIR QUOI METTRE A JOUR
      const res = await api.post('/eventattendees',{
        eventId: eventId,
        userId: userId,
      });
    }

    const withdrawEvent = async (eventId, eventType) => {
      const res = await api.delete(`/eventattendees/withdraw/${eventId}/${userId}`);
    }

    const likeEvent = async (eventId, eventType) => {
      const res = await api.post('/eventlikers',{
        eventId: eventId,
        userId: userId,
      });

    }

    const dislikeEvent = async (eventId, eventType) => {
      const res = await api.delete(`/eventlikers/dislike/${eventId}/${userId}`);
    }

    const switchInterraction = (eventId, eventType, interractionType, interraction) =>{
      if(eventType == "spotlight"){
        setSpotlightEvent(prev => {
          const updated = { ...prev };
          if(interractionType == "attend"){
            updated.attended = interraction;
            updated.attendees = interraction
              ? [...(updated.attendees || []), userId]
              : (updated.attendees || []).filter(id => id != userId);
            updated.numberAttendees = updated.attendees.length;
          }else if(interractionType == "like"){
            updated.liked = interraction;
            updated.likers = interraction
              ? [...(updated.likers || []), userId]
              : (updated.likers || []).filter(id => id != userId);
            updated.numberLikers = updated.likers.length;
          }
          return updated;
        });
      }else{
        const updatedEvents = noSpotlightEvents.map(element => {
          if(element.id == eventId){
            const updated = { ...element };
            if(interractionType == "attend"){
              updated.attended = interraction;
              updated.attendees = interraction
                ? [...(updated.attendees || []), userId]
                : (updated.attendees || []).filter(id => id != userId);
              updated.numberAttendees = updated.attendees.length;
            }else if(interractionType == "like"){
              updated.liked = interraction;
              updated.likers = interraction
                ? [...(updated.likers || []), userId]
                : (updated.likers || []).filter(id => id != userId);
              updated.numberLikers = updated.likers.length;
            }
            return updated;
          }
          return element;
        });
        setNoSpotlightEvents(updatedEvents);
        setEvents(updatedEvents);
      }
    }

    const displayedEvents = events;

    // Garde : vérifier connexion avant interaction
    const requireLogin = (callback) => {
      if (!userId) {
        setShowLoginModal(true);
        return;
      }
      callback();
    };

    // COMPONENTS BOUTLON LIKE DISLIKE ---------------------------------------------

    function ILikeButton(props) {
      const itemId = props.itemId;
      return (<button className="like-btn"
        onClick={() => requireLogin(() => {
          likeEvent(itemId, "event");
          switchInterraction(itemId, "event", "like", 1);
        })}
      >
        <svg id="Groupe_61" data-name="Groupe 61" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="28.099" height="25.492" viewBox="0 0 28.099 25.492">
          <defs>
            <linearGradient id="linear-gradient" x1="0.907" y1="0.073" x2="0.225" y2="0.911" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="#95fdfc"/>
              <stop offset="1" stopColor="#febefd"/>
            </linearGradient>
            <clipPath id="clip-path">
              <rect id="Rectangle_89" data-name="Rectangle 89" width="28.099" height="25.492" fill="url(#linear-gradient)"/>
            </clipPath>
          </defs>
          <g id="Groupe_60" data-name="Groupe 60" clipPath="url(#clip-path)">
            <path id="Tracé_31" data-name="Tracé 31" d="M14.052,25.492a1.993,1.993,0,0,1-1.38-.552c-.015-.014-.054-.054-.075-.076L2.33,14.174a8.532,8.532,0,0,1,.332-12.05l.114-.106A7.853,7.853,0,0,1,13.859,2.6c.064.071.127.143.189.217a7.85,7.85,0,0,1,11.27-.8,8.533,8.533,0,0,1,.564,12.042l-.1.114L15.5,24.875a1.992,1.992,0,0,1-1.445.617M8.026,2A5.819,5.819,0,0,0,4.12,3.5l-.085.079a6.528,6.528,0,0,0-.258,9.216l10.267,10.69.019.02.005.005L24.327,12.79l.816.591-.74-.673a6.529,6.529,0,0,0-.428-9.213,5.986,5.986,0,0,0-.559-.444,5.852,5.852,0,0,0-8.138,1.444l-.418.58a1,1,0,0,1-1.622,0l-.41-.568a6.022,6.022,0,0,0-.454-.573A5.835,5.835,0,0,0,8.026,2" transform="translate(0 0)" fill="url(#linear-gradient)"/>
          </g>
        </svg>

      </button>
      );
    }
    
    function IUnlikeButton(props) {
      const itemId = props.itemId;
      return  (<button className="unlike-btn"
        onClick={() => requireLogin(() => {
          dislikeEvent(itemId, "event");
          switchInterraction(itemId, "event", "like", 0);
        })}
      >
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="28.099" height="25.492" viewBox="0 0 28.099 25.492">
          <defs>
            <linearGradient id="linear-gradient" x1="0.942" y1="0.11" x2="0.371" y2="0.851" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="#95fdfc"/>
              <stop offset="0.58" stopColor="#d2d8fd"/>
              <stop offset="1" stopColor="#febefd"/>
            </linearGradient>
            <clipPath id="clip-path">
              <rect id="Rectangle_90" data-name="Rectangle 90" width="28.099" height="25.492" transform="translate(0 0)" fill="url(#linear-gradient)"/>
            </clipPath>
          </defs>
          <g id="Groupe_62" data-name="Groupe 62" transform="translate(0 0)" clipPath="url(#clip-path)">
            <path id="Tracé_32" data-name="Tracé 32" d="M25.317,2.012a7.685,7.685,0,0,0-.756-.6,7.855,7.855,0,0,0-10.514,1.4c-.061-.074-.124-.146-.188-.217A7.855,7.855,0,0,0,2.775,2.018l-.113.106a8.531,8.531,0,0,0-.333,12.05L12.6,24.864l.076.077a2,2,0,0,0,2.825-.066l10.28-10.707.1-.114a8.533,8.533,0,0,0-.564-12.042m-.175,11.369Z" fill="url(#linear-gradient)"/>
          </g>
        </svg>

      </button>
      );
    }

    function LikeButton(props) {
      const isNotLiked = props.isNotLiked;
      const itemId = props.itemId;
      if (isNotLiked) {
        return <ILikeButton itemId={itemId}/>;
      }
      return <IUnlikeButton itemId={itemId}/>;
    }

    if (loading) {
      return (
        <div className='conteneur events'>
          <Spinner text="Chargement des evenements..." />
        </div>
      );
    }

    return (
      <>
        <div className='conteneur events'>
          <h2 >Mis en avant</h2>
          <div className="spotlight-border title-border"></div>

          {spotlightEvent ? (
          <div className="spotlight-event" key={"event-" + spotlightEvent.id}>
            <img src={spotlightEvent.image ? `${import.meta.env.VITE_API_URL}${spotlightEvent.image}` : ''} alt="" />

            <div className="spotlight-text">
              <div className="spotlight-info">
                <div className="spotlight-theme">
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="25" height="4" viewBox="0 0 25 4">
                  <defs>
                    <linearGradient id="linear-gradient" y1="0.5" x2="0.996" y2="0.5" gradientUnits="objectBoundingBox">
                      <stop offset="0" stopColor="#95fdfc"/>
                      <stop offset="1" stopColor="#febefd"/>
                    </linearGradient>
                  </defs>
                  <rect id="Rectangle_112" data-name="Rectangle 112" width="25" height="4" rx="2" fill="url(#linear-gradient)"/>
                </svg>
                  <span>{spotlightEvent.theme}</span>
                </div>

                <h2>{spotlightEvent.title}</h2>
                <p>{spotlightEvent.description}</p>
              </div>


              <div className="spotlight-interractions">
                {(!spotlightEvent.attended || spotlightEvent.attended == 0) ?
                (<button className='btn'
                    onClick={() => requireLogin(() => {
                      attendEvent(spotlightEvent.id, "spotlight");
                      switchInterraction(spotlightEvent.id, "spotlight", "attend", 1)
                    })}
                  >
                    JE PARTICIPE
                </button>) :
                (<button className='clicked-btn'
                    onClick={() => requireLogin(() => {
                      withdrawEvent(spotlightEvent.id, "spotlight");
                      switchInterraction(spotlightEvent.id, "spotlight", "attend", 0)
                    })}
                  >
                    JE PARTICIPE

                    <svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="14.414" viewBox="0 0 20.828 14.414">
                      <path id="Tracé_77" data-name="Tracé 77" d="M3,12l6,6L21,6" transform="translate(-1.586 -4.586)" fill="none" stroke="#06122f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                    </svg>

                </button> )}

                <div className="event-info">
                  <div className="event-attendees">
                    <svg id="Groupe_67" data-name="Groupe 67" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="32.01" height="29.1" viewBox="0 0 32.01 29.1">
                      <defs>
                        <linearGradient id="linear-gradient" x1="1.853" y1="0.278" x2="-0.295" y2="2.033" gradientUnits="objectBoundingBox">
                          <stop offset="0" stopColor="#95fdfc"/>
                          <stop offset="1" stopColor="#febefd"/>
                        </linearGradient>
                        <clipPath id="clip-path">
                          <rect id="Rectangle_91" data-name="Rectangle 91" width="32.01" height="29.1" fill="url(#linear-gradient)"/>
                        </clipPath>
                      </defs>
                      <g id="Groupe_66" data-name="Groupe 66" clipPath="url(#clip-path)">
                        <path id="Tracé_33" data-name="Tracé 33" d="M13.025,14.549A7.275,7.275,0,1,1,20.3,7.275a7.283,7.283,0,0,1-7.275,7.275m0-11.64A4.365,4.365,0,1,0,17.39,7.275,4.37,4.37,0,0,0,13.025,2.91" transform="translate(-1.385 0)" fill="url(#linear-gradient)"/>
                        <path id="Tracé_34" data-name="Tracé 34" d="M21.825,34.64a1.455,1.455,0,0,1-1.455-1.455V27.365a1.456,1.456,0,0,0-1.454-1.455H4.365A1.457,1.457,0,0,0,2.91,27.365v5.819a1.455,1.455,0,1,1-2.91,0V27.365A4.37,4.37,0,0,1,4.365,23h14.55a4.37,4.37,0,0,1,4.365,4.365v5.819a1.455,1.455,0,0,1-1.455,1.455" transform="translate(0 -5.54)" fill="url(#linear-gradient)"/>
                        <path id="Tracé_35" data-name="Tracé 35" d="M28.287,14.187a1.455,1.455,0,0,1-.361-2.865,4.365,4.365,0,0,0,0-8.457A1.455,1.455,0,1,1,28.65.046a7.275,7.275,0,0,1,0,14.1,1.493,1.493,0,0,1-.362.046" transform="translate(-6.463 0)" fill="url(#linear-gradient)"/>
                        <path id="Tracé_36" data-name="Tracé 36" d="M38.4,34.64a1.455,1.455,0,0,1-1.455-1.455V27.365a1.456,1.456,0,0,0-1.454-1.455H34.038a1.455,1.455,0,1,1,0-2.91h1.455a4.37,4.37,0,0,1,4.365,4.365v5.819A1.455,1.455,0,0,1,38.4,34.64" transform="translate(-7.848 -5.54)" fill="url(#linear-gradient)"/>
                      </g>
                    </svg>
                    <span>{spotlightEvent.attendees ? spotlightEvent.attendees.length : 0} participants</span>
                  </div>

                  <div className="event-likers">

                    {(!spotlightEvent.liked || spotlightEvent.liked == 0) ?
                    (<button
                      onClick={() => requireLogin(() => {
                        likeEvent(spotlightEvent.id, "spotlight")
                        switchInterraction(spotlightEvent.id, "spotlight", "like", 1)
                      })}
                    >
                      <svg id="Groupe_61" data-name="Groupe 61" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="28.099" height="25.492" viewBox="0 0 28.099 25.492">
                        <defs>
                          <linearGradient id="linear-gradient" x1="0.907" y1="0.073" x2="0.225" y2="0.911" gradientUnits="objectBoundingBox">
                            <stop offset="0" stopColor="#95fdfc"/>
                            <stop offset="1" stopColor="#febefd"/>
                          </linearGradient>
                          <clipPath id="clip-path">
                            <rect id="Rectangle_89" data-name="Rectangle 89" width="28.099" height="25.492" fill="url(#linear-gradient)"/>
                          </clipPath>
                        </defs>
                        <g id="Groupe_60" data-name="Groupe 60" clipPath="url(#clip-path)">
                          <path id="Tracé_31" data-name="Tracé 31" d="M14.052,25.492a1.993,1.993,0,0,1-1.38-.552c-.015-.014-.054-.054-.075-.076L2.33,14.174a8.532,8.532,0,0,1,.332-12.05l.114-.106A7.853,7.853,0,0,1,13.859,2.6c.064.071.127.143.189.217a7.85,7.85,0,0,1,11.27-.8,8.533,8.533,0,0,1,.564,12.042l-.1.114L15.5,24.875a1.992,1.992,0,0,1-1.445.617M8.026,2A5.819,5.819,0,0,0,4.12,3.5l-.085.079a6.528,6.528,0,0,0-.258,9.216l10.267,10.69.019.02.005.005L24.327,12.79l.816.591-.74-.673a6.529,6.529,0,0,0-.428-9.213,5.986,5.986,0,0,0-.559-.444,5.852,5.852,0,0,0-8.138,1.444l-.418.58a1,1,0,0,1-1.622,0l-.41-.568a6.022,6.022,0,0,0-.454-.573A5.835,5.835,0,0,0,8.026,2" transform="translate(0 0)" fill="url(#linear-gradient)"/>
                        </g>
                      </svg>

                    </button>
                    ) :
                    (<button
                      onClick={() => requireLogin(() => {
                        dislikeEvent(spotlightEvent.id, "spotlight")
                        switchInterraction(spotlightEvent.id, "spotlight", "like", 0)
                      })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="28.099" height="25.492" viewBox="0 0 28.099 25.492">
                        <defs>
                          <linearGradient id="linear-gradient" x1="0.942" y1="0.11" x2="0.371" y2="0.851" gradientUnits="objectBoundingBox">
                            <stop offset="0" stopColor="#95fdfc"/>
                            <stop offset="0.58" stopColor="#d2d8fd"/>
                            <stop offset="1" stopColor="#febefd"/>
                          </linearGradient>
                          <clipPath id="clip-path">
                            <rect id="Rectangle_90" data-name="Rectangle 90" width="28.099" height="25.492" transform="translate(0 0)" fill="url(#linear-gradient)"/>
                          </clipPath>
                        </defs>
                        <g id="Groupe_62" data-name="Groupe 62" transform="translate(0 0)" clipPath="url(#clip-path)">
                          <path id="Tracé_32" data-name="Tracé 32" d="M25.317,2.012a7.685,7.685,0,0,0-.756-.6,7.855,7.855,0,0,0-10.514,1.4c-.061-.074-.124-.146-.188-.217A7.855,7.855,0,0,0,2.775,2.018l-.113.106a8.531,8.531,0,0,0-.333,12.05L12.6,24.864l.076.077a2,2,0,0,0,2.825-.066l10.28-10.707.1-.114a8.533,8.533,0,0,0-.564-12.042m-.175,11.369Z" fill="url(#linear-gradient)"/>
                        </g>
                      </svg>

                    </button>
                    )}

                    <span>{spotlightEvent.likers ? spotlightEvent.likers.length : 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="spotlight-event spotlight-empty">
              <p>Aucun événement mis en avant pour le moment</p>
            </div>
          )}

          <h2>Autres evenements</h2>
          <div className="other-border title-border"></div>
          <div className="event-filter">
            <span>Filtres : </span>
            <button
                className={activeFilter === "all" ? "active" : "gradient-hover"}
                type="button"
                onClick={() => {
                  getAllEvents()
                  setActiveFilter("all")
                }}
                >Tous
            </button>

            {games.map((item) => (
              <button
                className={activeFilter === item.slug ? "active" : "gradient-hover"}
                key={item.slug}
                type="button"
                onClick={() => {
                  getModelEvents(item.slug)
                  setActiveFilter(item.slug)
                }}
                >{item.name}
              </button>
            ))}
          </div>
         
          <div className="notspotlight-event" key={`filter-${activeFilter}`}>
            {displayedEvents.length === 0 ? (
              <div className="empty-events">Pas d'événements actuellement pour ce jeu</div>
            ) : displayedEvents.map((item, idx) => (
              (() => {
                return(
                    <div className="event-card" key={"event-" + item.id} style={{ animationDelay: `${idx * 0.07}s` }}>
                      <img src={item.image ? `${import.meta.env.VITE_API_URL}${item.image}` : ''} alt="" />

                      <div className="event-text">
                        <div className="event-info">
                          <div className="event-theme">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="25" height="4" viewBox="0 0 25 4">
                              <defs>
                                <linearGradient id="linear-gradient" y1="0.5" x2="0.996" y2="0.5" gradientUnits="objectBoundingBox">
                                  <stop offset="0" stopColor="#95fdfc"/>
                                  <stop offset="1" stopColor="#febefd"/>
                                </linearGradient>
                              </defs>
                              <rect id="Rectangle_112" data-name="Rectangle 112" width="25" height="4" rx="2" fill="url(#linear-gradient)"/>
                            </svg>

                            <span>{item.theme}</span>
                          </div>
                          
                          <h2>{item.title}</h2>
                          <p>{item.description}</p>
                        </div>

                        <div className="event-interractions">

                          <div className="event-interactors">
                            <div className="event-attendees">
                              <svg id="Groupe_67" data-name="Groupe 67" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="32.01" height="29.1" viewBox="0 0 32.01 29.1">
                                <defs>
                                  <linearGradient id="linear-gradient" x1="1.853" y1="0.278" x2="-0.295" y2="2.033" gradientUnits="objectBoundingBox">
                                    <stop offset="0" stopColor="#95fdfc"/>
                                    <stop offset="1" stopColor="#febefd"/>
                                  </linearGradient>
                                  <clipPath id="clip-path">
                                    <rect id="Rectangle_91" data-name="Rectangle 91" width="32.01" height="29.1" fill="url(#linear-gradient)"/>
                                  </clipPath>
                                </defs>
                                <g id="Groupe_66" data-name="Groupe 66" clipPath="url(#clip-path)">
                                  <path id="Tracé_33" data-name="Tracé 33" d="M13.025,14.549A7.275,7.275,0,1,1,20.3,7.275a7.283,7.283,0,0,1-7.275,7.275m0-11.64A4.365,4.365,0,1,0,17.39,7.275,4.37,4.37,0,0,0,13.025,2.91" transform="translate(-1.385 0)" fill="url(#linear-gradient)"/>
                                  <path id="Tracé_34" data-name="Tracé 34" d="M21.825,34.64a1.455,1.455,0,0,1-1.455-1.455V27.365a1.456,1.456,0,0,0-1.454-1.455H4.365A1.457,1.457,0,0,0,2.91,27.365v5.819a1.455,1.455,0,1,1-2.91,0V27.365A4.37,4.37,0,0,1,4.365,23h14.55a4.37,4.37,0,0,1,4.365,4.365v5.819a1.455,1.455,0,0,1-1.455,1.455" transform="translate(0 -5.54)" fill="url(#linear-gradient)"/>
                                  <path id="Tracé_35" data-name="Tracé 35" d="M28.287,14.187a1.455,1.455,0,0,1-.361-2.865,4.365,4.365,0,0,0,0-8.457A1.455,1.455,0,1,1,28.65.046a7.275,7.275,0,0,1,0,14.1,1.493,1.493,0,0,1-.362.046" transform="translate(-6.463 0)" fill="url(#linear-gradient)"/>
                                  <path id="Tracé_36" data-name="Tracé 36" d="M38.4,34.64a1.455,1.455,0,0,1-1.455-1.455V27.365a1.456,1.456,0,0,0-1.454-1.455H34.038a1.455,1.455,0,1,1,0-2.91h1.455a4.37,4.37,0,0,1,4.365,4.365v5.819A1.455,1.455,0,0,1,38.4,34.64" transform="translate(-7.848 -5.54)" fill="url(#linear-gradient)"/>
                                </g>
                              </svg>
                              <span>{item.attendees ? item.attendees.length : 0}</span>
                            </div>

                            <div className="event-likers">
                              <LikeButton isNotLiked={(!item.liked || item.liked == 0)} itemId={item.id} />
                              <span>{item.likers ? item.likers.length : 0}</span>
                            </div>
                          </div>

                          {(!item.attended || item.attended == 0)  ?
                          (<button className='btn'
                              onClick={() => requireLogin(() => {
                                attendEvent(item.id, "event");
                                switchInterraction(item.id, "event", "attend", 1)
                              })}
                            >
                              JE PARTICIPE
                          </button>) :
                          (<button className='clicked-btn'
                              onClick={() => requireLogin(() => {
                                withdrawEvent(item.id, "event");
                                switchInterraction(item.id, "event", "attend", 0)
                              })}
                            >
                              JE PARTICIPE
                              <svg xmlns="http://www.w3.org/2000/svg" width="20.828" height="14.414" viewBox="0 0 20.828 14.414">
                                <path id="Tracé_77" data-name="Tracé 77" d="M3,12l6,6L21,6" transform="translate(-1.586 -4.586)" fill="none" stroke="#06122f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                              </svg>
                          </button> )}

                        </div>
                      </div>
                    </div>
                )
              })()
            ))}
          </div> 
        </div>

        {showLoginModal && createPortal(
          <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
              <button className="login-modal-close" onClick={() => setShowLoginModal(false)}>&times;</button>
              <h3>Connexion requise</h3>
              <p>Vous devez être connecté pour interagir avec les événements.</p>
              <div className="login-modal-actions">
                <Link to="/login" className="btn">Se connecter</Link>
                <button className="login-modal-cancel" onClick={() => setShowLoginModal(false)}>Annuler</button>
              </div>
            </div>
          </div>,
          document.body
        )}

        <div className="message-banner">
          <div className='message-container conteneur'>
              <h6>Pour pouvoir interagir sur les événements <br/> avec notre communauté, rejoignez notre Discord !</h6>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="119.781" height="135.617" viewBox="0 0 119.781 135.617">
                  <path id="discordapp-icon" d="M76.187,56.9a7.544,7.544,0,1,0,6.978,7.522A7.223,7.223,0,0,0,76.187,56.9Zm-24.969,0A7.544,7.544,0,1,0,58.2,64.422,7.223,7.223,0,0,0,51.218,56.9ZM109.434,0H17.767A14.051,14.051,0,0,0,3.744,14.019v91.643a14.051,14.051,0,0,0,14.023,14.019H95.343l-3.6-12.515,8.754,8.069,8.277,7.59,14.754,12.79V14.019A14.144,14.144,0,0,0,109.434,0ZM83.029,88.564l-4.515-5.471c8.962-2.53,12.383-8.069,12.383-8.069a39.209,39.209,0,0,1-7.868,4.035A49.118,49.118,0,0,1,73.109,82a47.982,47.982,0,0,1-17.72-.068A52.2,52.2,0,0,1,45.334,78.99a43.072,43.072,0,0,1-4.994-2.325c-.206-.138-.411-.206-.636-.339-.138-.068-.206-.138-.276-.138l-1.916-1.165s3.285,5.4,11.971,8L44.9,88.632c-15.119-.479-20.865-10.326-20.865-10.326,0-21.817,9.852-39.53,9.852-39.53,9.852-7.317,19.155-7.114,19.155-7.114l.685.82C41.434,35.97,35.8,41.374,35.8,41.374s1.484-.82,4.036-1.916A53.59,53.59,0,0,1,55.368,35.15a6.809,6.809,0,0,1,1.166-.138,57.9,57.9,0,0,1,13.817-.138,56.943,56.943,0,0,1,20.592,6.5s-5.4-5.128-17.033-8.618l.958-1.093s9.373-.206,19.155,7.114c0,0,9.852,17.715,9.852,39.53,0-.068-5.723,9.779-20.865,10.256Z" transform="translate(-3.744)"/>
                </svg>
              </div>
              
          </div>
        </div>
        
      </>  
    )
}
