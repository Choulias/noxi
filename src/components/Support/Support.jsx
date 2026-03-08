import {React, Fragment, useRef, useState} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Switch } from '@headlessui/react';
import ImgSupport from "../../assets/img/engrenage.png";

export default function Support() {

  const showAccordionContent = (e) =>{
    let accordion = e.target.closest(".accordion-bloc");
    let header = accordion.querySelector(".accordion-header");
    let accordionContent = accordion.querySelector(".accordion-content");
    let accordionMaxHeight = accordionContent.style.maxHeight;
    let minusIcon = header.querySelector(".minus-icon");
    let plusIcon = header.querySelector(".plus-icon");

    if(accordion.classList.contains('contact-btn')){
      // Si on clique sur "Autres Questions"
      setContactOpen(true);
    }else{
      if (accordionMaxHeight == "0px" || accordionMaxHeight.length == 0) {
        accordionContent.style.maxHeight = `${accordionContent.scrollHeight + 32}px`;
        header.style.fontWeight ='bold';
        header.style.paddingTop ='20px';
        header.style.marginBottom ='20px';
        accordion.style.borderRadius = ("10px");
        accordion.classList.add("opened");
        minusIcon.style.display = "contents";
        plusIcon.style.display = "none";
      }
      else {
        header.style.fontWeight ='normal';
        header.style.paddingTop ='0px';
        header.style.marginBottom ='0px';
        accordion.style.borderRadius = ("50px");
        accordionContent.style.maxHeight = `0px`;
        accordion.classList.remove("opened");
        minusIcon.style.display = "none";
        plusIcon.style.display = "contents";
      }
    }

  }

  // Contact --------------------------------------------------
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

  const [agreed, setAgreed] = useState(false)

  const cancelContactButtonRef = useRef(null)
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className='conteneur main-container support'>
      <h2>Support</h2>
      <div className="title-border"></div>

      <div className='support-container'>
        <div className="questions-container ">
          <h3>Questions fréquentes :</h3>
          
          <div className='blocs-container'>
            <button
                type="button"
                className="accordion-bloc"
                onClick={(e) => {
                  showAccordionContent(e);
                }}
            >
              <div className="accordion-header">
                <i className='plus-icon'>
                  <svg id="Groupe_137" data-name="Groupe 137" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 18 18">
                    <defs>
                      <clipPath id="clipPath">
                        <rect id="Rectangle_149" data-name="Rectangle 149" width="18" height="18"/>
                      </clipPath>
                    </defs>
                    <g id="Groupe_136" data-name="Groupe 136" clipPath="url(#clipPath)">
                      <path id="Tracé_79" data-name="Tracé 79" d="M9,18a1,1,0,0,1-1-1V10H1A1,1,0,0,1,1,8H8V1a1,1,0,0,1,2,0V8h7a1,1,0,0,1,0,2H10v7a1,1,0,0,1-1,1"/>
                    </g>
                  </svg>
                </i>

                <i className='minus-icon'>
                  <svg id="Groupe_139" data-name="Groupe 139" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="18.26" height="3" viewBox="0 0 18.26 3">
                    <defs>
                      <clipPath id="clipPath">
                        <rect id="Rectangle_150" data-name="Rectangle 150" width="18.26" height="3"/>
                      </clipPath>
                    </defs>
                    <g id="Groupe_138" data-name="Groupe 138" clipPath="url(#clipPath)">
                      <path id="Tracé_81" data-name="Tracé 81" d="M17.26,3H1A1,1,0,0,1,1,1H17.26a1,1,0,0,1,0,2"/>
                    </g>
                  </svg>
                </i>

                <h4>Compte et sécurité</h4>
              </div>

              <div className="accordion-content">
                  <p>
                    Chez Noxi, la sécurité de vos comptes et de vos informations personnelles est notre priorité absolue. Nous avons mis en place des mesures robustes pour garantir que votre expérience sur notre plateforme soit hautement sécurisée.<br/><br/>
                    <b>Chiffrement des Mots de Passe : </b>Vos mots de passe sont traités avec la plus haute sécurité. Nous utilisons des techniques de hachage avancées, ce qui signifie que même nous ne pouvons pas accéder à vos mots de passe en texte brut. Cela ajoute une couche supplémentaire de protection en cas de faille de sécurité.<br/><br/>
                    <b>JWT (JSON Web Tokens) pour la Vérification : </b>Nous utilisons des JSON Web Tokens pour gérer l'authentification et la vérification des informations. Les JWT sont des normes industrielles pour sécuriser les échanges de données entre le navigateur et le serveur. Cela garantit que seules les personnes autorisées peuvent accéder à votre compte.<br/><br/>
                    <b>Surveillance Continue : </b> Notre équipe surveille en permanence notre système pour détecter toute activité suspecte. En cas d'activité inhabituelle ou de tentative d'accès non autorisé, nous prenons des mesures immédiates pour protéger vos informations et votre compte.<br/><br/>
                    Chez Noxi, nous nous engageons à fournir un environnement en ligne sécurisé où vous pouvez profiter de nos services en toute confiance. Si vous avez des questions supplémentaires concernant la sécurité de vos comptes, n'hésitez pas à nous contacter. Votre tranquillité d'esprit est notre priorité.
                  </p>
              </div>
            </button>

            {/* <!-- When to use Accordion Components --> */}
            <button
                type="button"
                className="accordion-bloc"
                onClick={(e) => {
                  showAccordionContent(e);
                }}
            >

              <div className="accordion-header">
                  <i className='plus-icon'>
                    <svg id="Groupe_137" data-name="Groupe 137" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 18 18">
                      <defs>
                        <clipPath id="clipPath">
                          <rect id="Rectangle_149" data-name="Rectangle 149" width="18" height="18"/>
                        </clipPath>
                      </defs>
                      <g id="Groupe_136" data-name="Groupe 136" clipPath="url(#clipPath)">
                        <path id="Tracé_79" data-name="Tracé 79" d="M9,18a1,1,0,0,1-1-1V10H1A1,1,0,0,1,1,8H8V1a1,1,0,0,1,2,0V8h7a1,1,0,0,1,0,2H10v7a1,1,0,0,1-1,1"/>
                      </g>
                    </svg>
                  </i>

                  <i className='minus-icon'>
                  <svg id="Groupe_139" data-name="Groupe 139" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="18.26" height="3" viewBox="0 0 18.26 3">
                    <defs>
                      <clipPath id="clipPath">
                        <rect id="Rectangle_150" data-name="Rectangle 150" width="18.26" height="3"/>
                      </clipPath>
                    </defs>
                    <g id="Groupe_138" data-name="Groupe 138" clipPath="url(#clipPath)">
                      <path id="Tracé_81" data-name="Tracé 81" d="M17.26,3H1A1,1,0,0,1,1,1H17.26a1,1,0,0,1,0,2"/>
                    </g>
                  </svg>
                </i>
                  <h4>Notre communauté</h4>
              </div>

              <div className="accordion-content">
                  <p>
                    Chez Noxi, nous croyons en la puissance d'une communauté unie pour créer une expérience de jeu exceptionnelle. Notre plateforme est plus qu'un simple site, c'est un lieu où les joueurs passionnés se rassemblent pour partager, compétitionner et s'épanouir ensemble.<br/><br/>
                    <b>Le Serveur Discord "Noctis" : </b>Pour favoriser les interactions et les liens entre les joueurs, nous avons créé un serveur Discord dédié nommé "Noctis". C'est un endroit où vous pouvez discuter, partager des stratégies, poser des questions et interagir avec d'autres membres de la communauté Noxi. C'est l'endroit idéal pour rester connecté, quels que soient vos intérêts de jeu.<br/><br/>
                    <b>Esprit de Compétition et Bonne Entente : </b>Chez Noxi, nous croyons que la compétition saine peut être un moteur puissant pour l'amélioration personnelle et le développement des compétences. Tout en poussant les joueurs à donner le meilleur d'eux-mêmes, nous encourageons également le respect et la bonne entente entre les joueurs. Notre communauté est fondée sur les valeurs de fair-play, d'entraide et de respect mutuel.<br/><br/>
                    <b>Événements Communautaires : </b>Pour renforcer les liens au sein de notre communauté, nous organisons régulièrement des événements spéciaux, des tournois et des défis. Ces activités sont conçues pour offrir des expériences uniques et enrichissantes, tout en offrant aux joueurs la possibilité de montrer leurs compétences et de se faire de nouveaux amis.<br/><br/>
                    <b>Partage de Connaissances : </b>Nous croyons que le partage de connaissances est essentiel pour la croissance individuelle et collective. Sur Noctis, vous trouverez des guides, des tutoriels et des conseils provenant d'experts et de joueurs expérimentés. La communauté est là pour répondre à vos questions et vous aider à vous améliorer.<br/><br/>
                    Rejoignez-nous sur Noxi et sur le serveur Discord "Noctis" pour être une partie intégrante d'une communauté dynamique et passionnée. Ensemble, nous formons une famille de joueurs déterminés à repousser nos limites tout en créant des liens durables.
                  </p>
              </div>

            </button>

            <button
                type="button"
                className="accordion-bloc"
                onClick={(e) => {
                  showAccordionContent(e);
                }}
            >

              <div className="accordion-header">
                <i>
                  <svg id="Groupe_137" data-name="Groupe 137" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="18" height="18" viewBox="0 0 18 18">
                    <defs>
                      <clipPath id="clipPath">
                        <rect id="Rectangle_149" data-name="Rectangle 149" width="18" height="18"/>
                      </clipPath>
                    </defs>
                    <g id="Groupe_136" data-name="Groupe 136" clipPath="url(#clipPath)">
                      <path id="Tracé_79" data-name="Tracé 79" d="M9,18a1,1,0,0,1-1-1V10H1A1,1,0,0,1,1,8H8V1a1,1,0,0,1,2,0V8h7a1,1,0,0,1,0,2H10v7a1,1,0,0,1-1,1"/>
                    </g>
                  </svg>
                </i>
                <h4>Le règlement et conditions d'utilisation</h4>
              </div>

              <div className="accordion-content">
                  <p>
                    Sur Noxi, notre objectif principal est de créer une expérience de jeu multijoueur positive et respectueuse pour tous les joueurs de notre communauté. Nos règlements et conditions d'utilisation sont conçus pour garantir que chacun puisse profiter pleinement de nos services dans un environnement sécurisé et équitable.<br/><br/>
                    <b>Respect et Fair-Play : </b>Nous attendons de tous les membres de notre communauté qu'ils traitent leurs camarades joueurs avec respect et gentillesse. Le fair-play est au cœur de nos valeurs, et nous encourageons tous les joueurs à jouer de manière équitable, à respecter les règles du jeu et à favoriser une compétition saine.<br/><br/>
                    <b>Contenu Approprié :</b> Lors de l'utilisation de notre plateforme, veuillez vous abstenir de partager tout contenu offensant, discriminatoire, ou inapproprié. Nous visons à maintenir un espace convivial et accueillant pour tous les âges et horizons, et nous comptons sur vous pour contribuer à cet environnement positif.<br/><br/>
                    <b>Triche et Exploits : </b>Toute forme de triche, de hacks ou d'exploitation de failles du jeu est strictement interdite. Nous nous engageons à maintenir un terrain de jeu équitable pour tous les joueurs, et nous prenons des mesures sévères contre ceux qui enfreignent cette règle.<br/><br/>
                    <b>Protection des Données : </b>Nous prenons la protection de vos données personnelles au sérieux. Consultez notre politique de confidentialité pour en savoir plus sur la manière dont nous recueillons, utilisons et stockons vos informations.<br/><br/>
                    <b>Sanctions pour Non-Respect : </b>En cas de non-respect de nos règlements, des sanctions appropriées seront appliquées. Celles-ci peuvent aller d'un avertissement à une suspension temporaire ou permanente de l'accès à notre plateforme, en fonction de la gravité de l'infraction.<br/><br/>
                    En utilisant Noxi, vous acceptez de vous conformer à nos règlements et conditions d'utilisation. Ces règles sont conçues pour protéger l'expérience de jeu de chacun et maintenir l'intégrité de notre communauté. Nous vous encourageons à lire attentivement ces règles et à jouer un rôle actif dans la création d'un environnement de jeu positif et amusant pour tous.
                  </p>
              </div>

            </button>

            <button
                type="button"
                className="accordion-bloc contact-btn"
                onClick={(e) => {
                  showAccordionContent(e);
                }}
            >

              <div className="accordion-header ">
                <i>
                <svg id="Groupe_141" data-name="Groupe 141" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="22.17" height="17.736" viewBox="0 0 22.17 17.736">
                  <defs>
                    <clipPath id="clip-path">
                      <rect id="Rectangle_151" data-name="Rectangle 151" width="22.17" height="17.736"/>
                    </clipPath>
                  </defs>
                  <g id="Groupe_140" data-name="Groupe 140" transform="translate(0 0)" clipPath="url(#clip-path)">
                    <path id="Tracé_82" data-name="Tracé 82" d="M19.953,0H2.217A2.219,2.219,0,0,0,0,2.217v13.3a2.22,2.22,0,0,0,2.217,2.217H19.953a2.22,2.22,0,0,0,2.217-2.217V2.217A2.219,2.219,0,0,0,19.953,0M17.741,2.217l-6.656,6.24L4.429,2.217ZM2.217,15.518l0-12.338,8.111,7.6a1.108,1.108,0,0,0,1.516,0l8.109-7.6V15.518Z" transform="translate(0 0)"/>
                  </g>
                </svg>


                </i>
                <h4>Autres questions</h4>
              </div>

              <div className="accordion-content">
                  <p>
                    Our asked sex point her she seems. New plenty she horses parish design you. Stuff sight equal of my woody. Him children bringing goodness suitable she entirely put
                    far daughter.
                  </p>
              </div>

            </button>
          </div>
        </div>

        <div className='support-img'>
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
            src={ImgSupport}
            alt="Support Noxi"
          />
        </div>
      </div>

      {/* Fenêtre Pop-up : CONTACT ---------------------------------------------------------------------*/}

      <Transition.Root className="pop-up" show={contactOpen} as={Fragment}>
        <Dialog as="div" initialFocus={cancelContactButtonRef} onClose={setContactOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pop-up-background" />
          </Transition.Child>

          <div className="pop-up-content">
            <div className="pop-up-window">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="pop-up-panel">

                  <div className="content-container">
                    <div className="content">
                      <div className="content-text ml-0">
                        <div className="isolate bg-white px-6 py-10 sm:py-10 lg:px-8">

                          <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Contact sales</h2>
                            <p className="mt-2 text-lg leading-8 text-gray-600">
                              Aute magna irure deserunt veniam aliqua magna enim voluptate.
                            </p>
                          </div>
                          <form action="#" method="POST" className="mx-auto mt-16 max-w-xl sm:mt-20">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                              <div>
                                <label htmlFor="first-name" className="block text-sm font-semibold leading-6 text-gray-900">
                                  First name
                                </label>
                                <div className="mt-2.5">
                                  <input
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="given-name"
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                              </div>
                              <div>
                                <label htmlFor="last-name" className="block text-sm font-semibold leading-6 text-gray-900">
                                  Last name
                                </label>
                                <div className="mt-2.5">
                                  <input
                                    type="text"
                                    name="last-name"
                                    id="last-name"
                                    autoComplete="family-name"
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                              </div>
                            
                              <div className="sm:col-span-2">
                                <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                                  Email
                                </label>
                                <div className="mt-2.5">
                                  <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    autoComplete="email"
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                              </div>
                              
                              <div className="sm:col-span-2">
                                <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
                                  Message
                                </label>
                                <div className="mt-2.5">
                                  <textarea
                                    name="message"
                                    id="message"
                                    rows={4}
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    defaultValue={''}
                                  />
                                </div>
                              </div>
                              <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
                                <div className="flex h-6 items-center">
                                  <Switch
                                    checked={agreed}
                                    onChange={setAgreed}
                                    className={classNames(
                                      agreed ? 'bg-indigo-600' : 'bg-gray-200',
                                      'flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                    )}
                                  >
                                    <span className="sr-only">Agree to policies</span>
                                    <span
                                      aria-hidden="true"
                                      className={classNames(
                                        agreed ? 'translate-x-3.5' : 'translate-x-0',
                                        'h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out'
                                      )}
                                    />
                                  </Switch>
                                </div>
                                <Switch.Label className="text-sm leading-6 text-gray-600">
                                  By selecting this, you agree to our{' '}
                                  <a href="#" className="font-semibold text-indigo-600">
                                    privacy&nbsp;policy
                                  </a>
                                  .
                                </Switch.Label>
                              </Switch.Group>
                            </div>
                            <div className="mt-10">
                              <button
                                type="submit"
                                className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              >
                                Let's talk
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="btn-container">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setContactOpen(false)}
                      ref={cancelContactButtonRef}
                    >
                      Annuler
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}
