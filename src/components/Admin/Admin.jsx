import {React, useEffect} from 'react';
import {Link , Outlet, useNavigate} from 'react-router-dom';

export default function Admin() {

  const navigate = useNavigate();
  useEffect(() => {
    navigate("/admin/players");
    const adminTable = document.querySelector('.admin-table');
    if(!adminTable ){
      navigate("/admin/players");
      document.querySelector('.players-btn').click();
    }
  }, []);

  return (
    <div className='conteneur admin main-container'>
      <h2>Admin</h2>
      <div className="title-border"></div>
      <nav className="admin-filter">
          <Link className='players-btn' to="/admin/players">Joueurs</Link>
          <Link className='games-btn' to="/admin/games">Jeux</Link>
          <Link className='events-btn' to="/admin/events">Evenements</Link>
      </nav>
      <Outlet/>
    </div>

  );
}
