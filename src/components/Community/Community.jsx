import React from 'react';
import {Link, Outlet} from "react-router-dom";


export default function Community() {
  return (
    <div className='conteneur'>
      <h1>Community</h1>
      <nav>
          <Link to="/Community/Leaderboard">LeaderBoard</Link>
          <Link to="/Community/Players">Players</Link>
      </nav>
      <Outlet/>
    </div>
  )
}
