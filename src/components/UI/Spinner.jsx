import React from 'react'

export default function Spinner({ text = "Chargement..." }) {
  return (
    <div className='noxi-spinner'>
      <div className='spinner-ring'>
        <div className='ring'></div>
      </div>
      {text && <span className='spinner-text'>{text}</span>}
    </div>
  )
}
