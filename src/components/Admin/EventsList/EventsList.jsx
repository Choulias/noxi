import {React, useState, useEffect, Fragment, useRef} from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { DataGrid } from '@mui/x-data-grid';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import api from "../../../api";

export default function EventsList() {

  useEffect(() => {
    getEvents();
    getGameModels();

    let btnActive = document.querySelector(".events-btn");
    if(btnActive){
      btnActive.classList.add("active");
    }
    
    return () => {
      if(btnActive){
        btnActive.classList.remove("active");
      }  
    };
  }, []);

  const [elementID, setElementID] = useState();
  const [events, setEvents] = useState([]);
  const [gameModels, setGameModels] = useState([]);
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [attendees, setAttendees ] = useState('');
  const [likes, setLikes ] = useState('');
  const [spotlight, setSpotlight ] = useState('');


  const getEvents = async () => {
    const response = await api.get('/events');
    const eventsattendees = await getEventsAttendees(response.data);
    const eventslikers = await getEventsLikers(eventsattendees);
    setEvents(eventslikers);
  }

  const getEventsAttendees = async(evenements) => {

    evenements.forEach(async (evenement) => {
      await api.get(`/eventattendees/event/${evenement.id}}`)
      .then(function(res) {
        evenement.numberAttendees = res.data.length;
      });
    });

    return evenements;
  }

  const getEventsLikers = async(evenements) => {

    evenements.forEach(async (evenement) => {
      const res = await api.get(`/eventlikers/event/${evenement.id}}`)
      evenement.numberLikers = res.data.length;
    });

    return evenements;
  }

  const getGameModels = async () => {
    const response = await api.get('/gamemodels');
    setGameModels(response.data);
  }

  const gameThemes = [];
  for (let i = 0; i < gameModels.length; i++) {
    gameThemes.push(gameModels[i].name);
  }

  const getEventById = async (id) => {
    const response = await api.get(`/events/${id}`);
    setTitle(response.data.title);
    setTheme(response.data.theme);
    setDescription(response.data.description);
    setAttendees(response.data.attendees);
    setLikes(response.data.likes);
    setSpotlight(response.data.spotlight);
  }

  // DELETE -----------------------------------------------------------------------

  const cancelDeleteButtonRef = useRef(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteEvent = async (id) => {
    await api.delete(`/events/${id}`);
    getEvents();
  }

  const deleteEventBtn = (params) => {
    return (
      <button
        type="button"
        className="admin-btn delete-btn"
        onClick={() => {
          setElementID(params.row.id);
          setDeleteOpen(true);
        }}
        >x
      </button>
    )
  }

  //EDIT ----------------------------------------------------------------------------

  const cancelEditButtonRef = useRef(null)
  const [editOpen, setEditOpen] = useState(false);

  const updateEvent = async (id) => { 

    if (spotlight === 1){
      //Si on decide de mettre l'event en spotlight, on retire toutes les autres de la spotlight
      const response = await api.patch(`/events/unspot/${spotlight}`,{
        spotlight: 0
      });
    }

    const res = await api.patch(`/events/${id}`,{
        title: title,
        theme: theme,
        description : description,
        spotlight: spotlight
    });

    getEvents();
  }

  const editEventBtn = (params) => {
    return (
      <button
      type="button"
      className="main-btn"
      onClick={() => {
        setElementID(params.row.id);
        getEventById(params.row.id);
        setEditOpen(true);
      }}
      >Editer
      </button>
    )
  }

  //ADD ------------------------------------------------------------------------------
  const cancelAddButtonRef = useRef(null)
  const [addOpen, setAddOpen] = useState(false);

  const saveEvent = async () => {
    const res = await api.post('/events',{
      title: title,
      theme: theme,
      description : description,
      spotlight: parseInt(spotlight)
    });
    
    getEvents(); // On actualise le tableau
  }

  // ---------------------------------------------------------------------------------

  const columns = [
      { field: 'id', headerName: 'ID', width: 70 },
      { field: 'title', headerName: 'Titre', width: 250 },
      { field: 'theme', headerName: 'Theme', width: 150 },
      { field: 'description', headerName: 'Description', width: 250 , sortable: false},
      { field: 'numberAttendees', headerName: 'Participants', type: 'number', width: 90 },
      { field: 'numberLikers', headerName: 'Likes', type: 'number', width: 30 },
      { field: 'spotlight', headerName: 'Mis en avant', width: 100},
      { field: 'editEvent', headerName: "Editer", width: 100, renderCell: editEventBtn, sortable: false, filterable: false},
      { field: 'deleteEvent', headerName: "Supprimer", width: 100, renderCell: deleteEventBtn, sortable: false, filterable: false}
    ];
    
  return (
    <div className='admin-table'>
    <div style={{ height: 400, width: '100%' }}>
        <DataGrid
        rows={events}
        columns={columns}
        initialState={{
            pagination: {
            paginationModel: { page: 0, pageSize: 5 },
            },
        }}
        pageSizeOptions={[5, 10]}
        // checkboxSelection
        />
    </div>

    <div className='add-group'>
      <button className='admin-btn add-btn' onClick={() => {
        setTheme("OXO");
        setSpotlight(0);
        setAddOpen(true)
        }}>
        +
      </button>
      <span>Ajouter un nouvel évenement</span>
    </div>
   
    
    {/* Fenêtre Pop-up : DELETE ---------------------------------------------------------------------*/}

    <Transition.Root className='pop-up' show={deleteOpen} as={Fragment}>
      <Dialog as="div" initialFocus={cancelDeleteButtonRef} onClose={setDeleteOpen}>
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
                    <div className="title-icon">
                      <ExclamationTriangleIcon aria-hidden="true" />
                    </div>

                    <div className="content-text">
                      <Dialog.Title as="h3">
                        Supprimer Element
                      </Dialog.Title>

                      <div className="text-bloc">
                        <p>
                          Etes-vous sure de vouloir supprimer le Jeu ? Cette action est irréversible.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="btn-container">
                  <button
                    type="button"
                    className="btn-continue"
                    onClick={() => {
                      deleteEvent(elementID);
                      setDeleteOpen(false);
                    }}
                  >
                    Supprimer
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setDeleteOpen(false)}
                    ref={cancelDeleteButtonRef}
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


    {/* Fenêtre Pop-up : EDIT ---------------------------------------------------------------------*/}

    <Transition.Root className="pop-up" show={editOpen} as={Fragment}>
      <Dialog as="div" initialFocus={cancelEditButtonRef} onClose={setEditOpen}>
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
                    <div className="title-icon">
                      <ExclamationTriangleIcon aria-hidden="true" />
                    </div>

                    <div className="content-text">
                      <Dialog.Title as="h3">
                        Modifier Element
                      </Dialog.Title>

                        <form className="text-bloc">
                          <div className="field">
                            <label className="label">Titre de l'évenement :</label>
                            <input 
                                className="input"
                                type="text"
                                placeholder="Titre"
                                value={ title }
                                onChange={ (e) => setTitle(e.target.value) }
                            />
                          </div>

                          <div className="field">
                            <label className="label">Description : </label>
                            <input 
                                className="input"
                                type="text"
                                placeholder="Description"
                                value={ description }
                                onChange={ (e) => setDescription(e.target.value) }
                            />
                          </div>

                          <div className="field">
                            <label className="label">Theme :</label>

                            <FormControl sx={{ m: 1, minWidth: 120 }}>
                              <Select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                              >
                                {gameThemes.map((item) => (
                                  <MenuItem  key={"item-" + item} value={item}>{item}</MenuItem>
                                ))}

                              </Select>
                            </FormControl>

                          </div>

                          <div className="field">
                            <label className="label">Mise en avant</label>
                            <Switch
                              checked={spotlight === 1 ? true : false}
                              onChange={(e) => setSpotlight(e.target.checked ? 1 : 0)}
                              inputProps={{ 'aria-label': 'controlled' }}
                            />
                          </div>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="btn-container">
                  <button
                    type="button"
                    className="btn-continue"
                    onClick={() => {
                      updateEvent(elementID);
                      setEditOpen(false);
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setEditOpen(false)}
                    ref={cancelEditButtonRef}
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

    {/* Fenêtre Pop-up : ADD ---------------------------------------------------------------------*/}
    
    <Transition.Root className='pop-up' show={addOpen} as={Fragment}>
      <Dialog as="div" initialFocus={cancelAddButtonRef} onClose={setAddOpen}>
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
                    <div className="title-icon">
                      <ExclamationTriangleIcon aria-hidden="true" />
                    </div>

                    <div className="content-text">
                      <Dialog.Title as="h3">
                        Ajouter Element
                      </Dialog.Title>

                      <form className="text-bloc">
                      <div className="field">
                            <label className="label">Titre de l'évenement : </label>
                            <input 
                                className="input"
                                type="text"
                                placeholder="Titre"
                                onChange={ (e) => setTitle(e.target.value) }
                            />
                          </div>
          

                          <div className="field">
                            <label className="label">Description : </label>
                            <input 
                                className="input"
                                type="text"
                                placeholder="Description"
                                onChange={ (e) => setDescription(e.target.value) }
                            />
                          </div>

                          <div className="field">
                            <label className="label">Theme : </label>
                            <FormControl sx={{ m: 1, minWidth: 120 }}>
                              <Select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                              >
                                {gameThemes.map((item) => (
                                  <MenuItem  key={"item-" + item} value={item}>{item}</MenuItem>
                                ))}

                              </Select>
                            </FormControl>

                          </div>

                          <div className="field">
                            <label className="label">Mise en avant</label>
                            <Switch
                              checked={spotlight === 0 ? false : true}
                              onChange={(e) => setSpotlight(e.target.checked ? 1 : 0)}
                              inputProps={{ 'aria-label': 'controlled' }}
                            />

                          </div>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="btn-container">
                  <button
                    type="button"
                    className="btn-continue"
                    onClick={() => {
                      saveEvent()
                      setAddOpen(false)
                    }}
                  >
                    Ajouter
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setAddOpen(false)}
                    ref={cancelAddButtonRef}
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
