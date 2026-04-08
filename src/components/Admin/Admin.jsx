import { useState, useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PlayersList from './PlayersList/PlayersList';
import GameModelsList from './GamesList/GameModelsList';
import EventsList from './EventsList/EventsList';

const TABS = [
  { key: 'players', label: 'Joueurs' },
  { key: 'games', label: 'Jeux' },
  { key: 'events', label: 'Evenements' },
];

export default function Admin() {
  const location = useLocation();

  // Determine initial tab from URL if coming from a direct link
  const getInitialTab = () => {
    if (location.pathname.includes('/admin/games')) return 'games';
    if (location.pathname.includes('/admin/events')) return 'events';
    return 'players';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const title = document.querySelector('.admin > h2');
    const border = document.querySelector('.admin > .title-border');
    const filter = document.querySelector('.admin-filter');

    if (title) {
      gsap.fromTo(title, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: title, start: 'top 90%', toggleActions: 'play none none none' }
      });
    }
    if (border) {
      gsap.fromTo(border, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.6, ease: 'power2.inOut',
        scrollTrigger: { trigger: border, start: 'top 90%', toggleActions: 'play none none none' }
      });
    }
    if (filter) {
      gsap.fromTo(filter, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: filter, start: 'top 90%', toggleActions: 'play none none none' }
      });
    }

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <div className='conteneur admin main-container'>
      <h2>Admin</h2>
      <div className="title-border"></div>
      <nav className="admin-filter">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? 'active' : 'gradient-hover'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {activeTab === 'players' && <PlayersList />}
      {activeTab === 'games' && <GameModelsList />}
      {activeTab === 'events' && <EventsList />}
    </div>
  );
}
