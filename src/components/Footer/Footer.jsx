import { React } from 'react';
import { Link, NavLink} from "react-router-dom";
import Logo from "../../assets/img/logo.png";

export default function Footer() {

  const navigation = [
    { name:'Accueil', link: <NavLink to="/">Accueil</NavLink>},
    { name:'Jeux', link: <NavLink to="/games">Jeux</NavLink>},
    { name:'Profil', link: <Link to="/myprofile">Profil</Link>},
  ]
  
  const community = [
    { name:'Evenements', link: <NavLink to="/community">Evenements</NavLink>},
    { name:'Classements & Joueurs', link: <Link to="/login">Classements & Joueurs</Link>},
    { name:'Discord', link: <Link to="/login">Discord</Link>}
  ]

  const legal = [
    { name:"Support", link: <NavLink to="/support">Support</NavLink>},
    { name:"Conditions d'utilisation", link: <Link to="/login">Conditions d'utilisation</Link>},
    { name:"Confidentialité", link: <Link to="/login">Confidentialité</Link>},
  ]

  const social = [
    { name:"Twitch", link: <a href="https://www.twitch.tv/noctis_corp" target="_blank">Twitch</a>},
    { name:"Discord", link: <a href="https://discord.gg/FEMtGpTcz9" target="_blank">Discord</a>},
    { name:"TikTok", link: <a href="https://www.tiktok.com/@noctis_discord" target="_blank">Tiktok</a>},
  ]


  return (
  <>
      <footer>
            <div className='footer-container'>
                <div className="footer-brand">
                    <NavLink to="/">
                        <img
                            src={Logo}
                            alt="Noxi Logo"
                        />
                    </NavLink>
                </div>

                <div className='footer-menu'>

                    <div className="navigation-column">
                        <h4>Navigation</h4>
                        <ul className="navigation-menu">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    {item.link}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="community-column">
                        <h4>Communauté</h4>
                        <ul className="community-menu">
                            {community.map((item) => (
                                <li key={item.name}>
                                    {item.link}
                                </li> 
                            ))}
                        </ul>
                    </div>

                    <div className="legal-column">
                        <h4>Legal</h4>
                        <ul className="legal-menu">
                            {legal.map((item) => (
                                <li key={item.name}>
                                    {item.link}
                                </li>  
                            ))}
                        </ul>
                    </div>

                    <div className="social-column">
                        <h4>Suivez-nous</h4>
                        <ul className="social-menu">
                            {social.map((item) => (
                                <li key={item.name}>
                                    {item.link}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>

            <div className='copyright'>Copyright © 2023 Noxi - All rights reserved</div>         
      </footer>
    </>

  )
}
