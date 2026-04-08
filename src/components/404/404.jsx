import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className='conteneur main-container not-found-page'>
      <div className='not-found-content'>
        <div className='not-found-code'>
          <span className='digit'>4</span>
          <span className='digit zero'>0</span>
          <span className='digit'>4</span>
        </div>
        <h2>Page introuvable</h2>
        <p>La page que vous cherchez n'existe pas ou a ete deplacee.</p>
        <div className='not-found-actions'>
          <button type="button" className='btn-home' onClick={() => navigate('/')}>
            Retour a l'accueil
          </button>
          <button type="button" className='btn-back' onClick={() => navigate(-1)}>
            Page precedente
          </button>
        </div>
      </div>

      <div className='not-found-particles'>
        {[...Array(12)].map((_, i) => (
          <div key={i} className='particle' style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>
    </div>
  )
}
