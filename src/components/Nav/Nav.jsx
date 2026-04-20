import { Fragment, useContext, React, useRef, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Disclosure, Menu, Transition, Popover } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import { Context } from '../GlobalInfo';
import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "../../assets/img/logo.png";
import EventIcon from "../../assets/icon/events.svg"
import LeaderboardIcon from "../../assets/icon/leaderboard.svg"
import DiscordIcon from "../../assets/icon/discord.svg"

export default function Nav() {

  gsap.registerPlugin(ScrollTrigger);
  const ref = useRef(null);
  const [isShowing, setIsShowing] = useState(false)

  // useEffect(() => {
  //   // ScrollTrigger non fonctionnel

  //   const el = ref.current;
  //   const showAnim = gsap.from(el.querySelector(".header-navbar header"), {
  //     yPercent: -100,
  //     paused: true,
  //     duration: 0.2
  //   }).progress(1);
  
  //   ScrollTrigger.create({
  //       start: "top top",
  //       end: 99999,
  //       onUpdate: (self) => {
  //           self.direction === -1 ? showAnim.play() : showAnim.reverse()
  //       }
  //   });

  // }, []);

  const [state, setState] = useContext(Context);

  const navigate = useNavigate();
  const logOut = (e) =>{
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.reload();
    navigate("/login");
  }
  
  const navigation = [
    { name:'Accueil', link: <NavLink to="/">Accueil</NavLink>, class:"home-nav"},
    { name:'Jeux', link: <NavLink to="/games">Jeux</NavLink>, class:"game-nav"},
    { name:'Communauté', link: <NavLink to="/community">Communauté</NavLink>, class:"community-nav"},
    { name:'Support', link: <NavLink to="/support">Support</NavLink>, class:"support-nav"},
  ]
  
  const userNavigation = [
    { name: 'Se connecter', link: <Link to="/login">Se connecter</Link>, status: 'not connected',role:'user'},
    { name: 'Votre Profil', link: <Link to="/myprofile" className="dropdown-item"><UserIcon className="dropdown-item-icon" />Votre Profil</Link>, status: 'connected', role:'user'},
    { name: 'Administration', link: <Link to="/admin" className="dropdown-item"><Cog6ToothIcon className="dropdown-item-icon" />Administration</Link>, status: 'connected', role:'admin'},
    { name: 'Déconnexion', link: <a href="#" onClick={logOut} className="disconnect-link"><ArrowRightOnRectangleIcon className="disconnect-icon" />Se deconnecter</a>, status: 'connected'},
  ]

  const communitySubMenu = [
    { name: 'Evenements', link: <Link to="/events">Evenements</Link>, icon: EventIcon },
    { name: 'Classements & Joueurs', link: <Link to="/players">Classements & Joueurs</Link>, icon: LeaderboardIcon },
    { name: 'Discord', link: <Link to={{ pathname: "https://discord.gg/FEMtGpTcz9" }}>Discord</Link>, icon: DiscordIcon },
  ]

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

  function clickOnChild(e){
    e.preventDefault()

    if( (e.target.querySelector('a').innerHTML == "Discord")){
      // Lorsqu'il s'agit d'un lien non interne, j'ouvre celui-ci à l'aide du Javascript sur un autre tab
      window.open("https://discord.gg/FEMtGpTcz9", '_blank');
    }else{
      navigate(e.target.querySelector("a").getAttribute( "href" ))
    }
  }

  return (
  <div className='header-navbar'>
      <header className="min-h-full" ref={ref}>
        <Disclosure as="nav" className="navbar">
          {({ open }) => (
            <>
              <div className="navbar-container">
                <div className="navbar-container-child">
                    
                  <div className="navbar-brand">
                    <NavLink to="/">
                      <img
                        src={Logo}
                        alt="Noxi Logo"
                      />
                    </NavLink>
                  </div>

                  <div className="navbar-menu">
                    <ul className="navbar-menu-child">
                      {navigation.map((item) => (
                          (() => {
                            if (item.name == "Communauté") {
                              return (
                                <Popover as="li" key={item.name} className="dropdown relative">
                                  <Popover.Button as ="a" href="#" className="dropdown-btn" onMouseEnter={() => setIsShowing(true)} onMouseLeave={() => setIsShowing(false)}>
                                    {item.name}
                                    <ChevronDownIcon className="chevron-icon" aria-hidden="true" />
                                  </Popover.Button>

                                  <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-200"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-150"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                    show={isShowing}
                                    onMouseEnter={() => setIsShowing(true)}
                                    onMouseLeave={() => setIsShowing(false)}
                                  >
                                    <Popover.Panel className="sub-menu">
                                      <ul className="p-4">
                                        {communitySubMenu.map((item) => (
                                          <li key={item.name}  onClick={(e) => clickOnChild(e)} className="group">
                                            <div className="icon-container">
                                              <img className="icon" src={item.icon} alt="" />
                                            </div>
                                            {item.link}
                                          </li>
                                        ))}
                                      </ul>
                                    </Popover.Panel>
                                  </Transition>
                                </Popover>
                              )
                            }else{
                              return (
                                <li key={item.name} className={item.class}>
                                  {item.link}
                                </li>
                              )
                            }
                          })()
                      ))}
                    </ul>
                  </div>

                  <div className="navbar-profile">

                    <div className="navbar-profile-child">
                      {/* <button
                        className='notification-btn'
                        type="button"
                      >
                        <span>Voir les notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button> */}

                      {/* Profile dropdown */}
                      <Menu as="div" className="profile-dropdown">
                        <div>
                          <Menu.Button className="profile-btn">
                            <span className="sr-only">Ouvrir le menu d'utilisateur</span>
                            {state.userInfo.image}
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Menu.Items className="dropdown-list">
                            {userNavigation.map((item) => (
                              (() => {
                                if (state.userInfo.connected && item.status === "connected" && item.role !== "admin") {
                                  // Elements de menu d'utilisateur qui concerne TOUT les utilisateurs connectés
                                  return (
                                    <Menu.Item key={item.name}>
                                      {item.link}
                                    </Menu.Item>
                                  )
                                } else if( state.userInfo.connected && item.status === "connected" && state.userInfo.role ==="admin" && item.role === "admin"){
                                  // Elements de menu d'utilisateur qui concerne QUE les administrateurs, on vérifie si l'utilisateur a le role ADMIN
                                  return (
                                    <Menu.Item key={item.name}>
                                      {item.link}
                                    </Menu.Item>
                                  )
                                }else if ((!state.userInfo.connected) && item.status !== "connected") {
                                  // Elements de menu d'utilisateur qui concerne TOUT les utilisateurs non connectés
                                  return (
                                    <Menu.Item key={item.name}>
                                      {item.link}
                                    </Menu.Item>
                                  )
                                }
                              })()
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>

                  <div className="mobile-btn">
                    {/* Mobile menu button */}
                    <Disclosure.Button> 
                      <span className="">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="mobile-navbar">
                <ul className="mobile-menu">
                  {navigation.map((item) => (

                    (() => {
                      if (item.name == "Communauté") {
                        return (
                          <Disclosure as="li" className="" key={item.name}>
                            {({ open }) => (
                              <>
                                <Disclosure.Button as="a" >
                                  {item.name}
                                  <ChevronDownIcon
                                    className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')}
                                    aria-hidden="true"
                                  />
                                </Disclosure.Button>
                                <Disclosure.Panel as="ul" className="mt-2 space-y-2">
                                  {[...communitySubMenu].map((item) => (
                                    <Disclosure.Button
                                      key={item.name}
                                      as="li"
                                      className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-white/80 hover:bg-white/10 hover:text-white"
                                    >
                                      {item.link}
                                    </Disclosure.Button>
                                  ))}
                                </Disclosure.Panel>
                              </>
                            )}
                          </Disclosure>
                        )
                      }else{
                        return (
                          <li key={item.name}>
                            {item.link}
                          </li>
                        )
                      }
                    })()
                    
                  ))}
                </ul>

                <div className="mobile-links">
                  {(() => {
                    if (state.userInfo.connected) {
                      // N'affiche que les éléments de menu qui demandent d'être connecté
                      return (
                        <div className="mobile-profile-main">
                          <div className="image-container">
                            {state.userInfo.image}
                            {/* <img src={state.userInfo.imageUrl} alt="" /> */}
                          </div>

                          <div className="profile-info">
                            <div className="profile-name">{state.userInfo.username}</div>
                            <div className="profile-mail">{state.userInfo.mail}</div>
                          </div>

                          {/* <button
                            type="button"
                          >
                            <span className="sr-only">Voir les notifications</span>
                            <BellIcon className="h-6 w-6" aria-hidden="true" />
                          </button> */}
                        </div>
                      )
                    }
                    })()
                  }

                  <ul className="mobile-profile-links">
                    {userNavigation.map((item) => (

                      (() => {
                        if (state.userInfo.connected && item.status === "connected"  && item.role !== "admin") {
                          // Elements de menu d'utilisateur qui concerne TOUT les utilisateurs connectés
                          return (
                            <li key={item.name}>
                              {item.link}
                            </li>
                          )
                        }else if( state.userInfo.connected && item.status === "connected" && state.userInfo.role ==="admin" && item.role === "admin"){
                          // Elements de menu d'utilisateur qui concerne QUE les administrateurs, on vérifie si l'utilisateur a le role ADMIN
                          return (
                            <li key={item.name}>
                              {item.link}
                            </li>
                          )
                        } else if ((!state.userInfo.connected) && item.status !== "connected") {
                          // Elements de menu d'utilisateur qui concerne TOUT les utilisateurs non connectés
                          return (
                            <li key={item.name}>
                              {item.link}
                            </li>
                          )
                        }
                      })()

                    ))}
                  </ul>

                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

      </header>
    </div>

  )
}
