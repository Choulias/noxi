import {React, useState, useEffect, Fragment, useRef} from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { DataGrid } from '@mui/x-data-grid';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import api from "../../../api";

export default function GameModelsList() {

  useEffect(() => {
    getGames();

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
  const [games, setGames] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [playersMin, setPlayersMin] = useState('');
  const [playersLimit, setPlayersLimit] = useState('');

  // Représente les propositions du nombre de joueurs pour un Jeu
  const playersMinList = [];
  const playersLimitList = [];

  for (let i = 1; i <= 8; i++) {
    playersMinList.push(i);
    playersLimitList.push(i);
  }

  const getGames = async () => {
    const response = await api.get('/gamemodels');
    setGames(response.data);
  }

  const getGameById = async (id) => {
    const response = await api.get(`/gamemodels/${id}`);
    setName(response.data.name);
    setSlug(response.data.slug);
    setDescription(response.data.description);
    setPlayersMin(response.data.playersMin);
    setPlayersLimit(response.data.playersLimit);
  }

  // DELETE -----------------------------------------------------------------------

  const cancelDeleteButtonRef = useRef(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteGame = async (id) => {
    await api.delete(`/gamemodels/${id}`);
    getGames();
  }

  const deleteGameBtn = (params) => {
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

  const updateGame = async (id) => {
    const res = await api.patch(`/gamemodels/${id}`,{
        name: name,
        slug: slug,
        description: description,
        playersMin: playersMin,
        playersLimit: playersLimit
    });
    getGames();
  }

  const editGameBtn = (params) => {
    return (
      <button
      type="button"
      className="main-btn"
      onClick={() => {
        setElementID(params.row.id);
        getGameById(params.row.id);
        setEditOpen(true);
      }}
      >Editer
      </button>
    )
  }

  //ADD ------------------------------------------------------------------------------
  const cancelAddButtonRef = useRef(null)
  const [addOpen, setAddOpen] = useState(false);

  const saveGameModel = async () => {
    const res = await api.post('/gamemodels',{
        name: name,
        slug: slug,
        description: description,
        image:'',
        playersMin:  parseInt(playersMin),
        playersLimit: parseInt(playersLimit),

    });
    getGames(); // On actualise le tableau
  }

  // ---------------------------------------------------------------------------------

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: "Nom du jeu", width: 200 },
    { field: 'slug', headerName: "Slug", width: 100 },
    { field: 'description', headerName: "Description", width: 250 },
    { field: 'playersMin', headerName: 'Min Joueurs', width: 100 },
    { field: 'playersLimit', headerName: 'Max Joueurs', width: 100 },
    { field: 'editGame', headerName: "Editer", width: 100, renderCell: editGameBtn, sortable: false, filterable: false},
    { field: 'deleteGame', headerName: "Supprimer", width: 100, renderCell: deleteGameBtn, sortable: false, filterable: false}
  ];

  return (
    <div className='admin-table'>
    <div style={{ height: 400, width: '100%' }}>
        <DataGrid
        rows={games}
        columns={columns}
        initialState={{
            pagination: {
            paginationModel: { page: 0, pageSize: 5 },
            },
        }}
        pageSizeOptions={[5, 10]}

        />
    </div>
      
    <div className='add-group'>
      <button className='admin-btn add-btn' onClick={() => {
        setPlayersMin(1);
        setPlayersLimit(1);
        setAddOpen(true);
        }}>
        +
      </button>
      <span>Ajouter un nouveau Jeu</span>
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
                      deleteGame(elementID)
                      setDeleteOpen(false)
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
                            <label className="label">Game Name</label>
                            <input 
                                className="input"
                                type="text"
                                placeholder="Name"
                                value={ name }
                                onChange={ (e) => setName(e.target.value) }
                            />
                          </div>

                          <div className="field">
                            <label className="label">Game Slug</label>
                            <input 
                                className="input"
                                type="text"
                                placeholder="Slug"
                                value={ slug }
                                onChange={ (e) => setSlug(e.target.value) }
                            />
                          </div>

                          <div className="field">
                            <label className="label">Game Description</label>
                            <input 
                                className="input"
                                type="text"
                                placeholder="Description"
                                value={ description }
                                onChange={ (e) => setDescription(e.target.value) }
                            />
                          </div>

                          <div className="field">
                            <label className="label">Joueurs Minimum</label>
                            <FormControl sx={{ m: 1, minWidth: 120 }}>
                              <Select
                                value={playersMin}
                                onChange={(e) => setPlayersMin(e.target.value)}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                              >
                                {playersMinList.map((item) => (
                                  <MenuItem  key={"item-" + item} value={item}>{item}</MenuItem>
                                ))}

                              </Select>
                            </FormControl>
                          </div>
                          
                          <div className="field">
                            <label className="label">Limite de joueurs</label>
                            <FormControl sx={{ m: 1, minWidth: 120 }}>
                              <Select
                                value={playersLimit}
                                onChange={(e) => setPlayersLimit(e.target.value)}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                              >
                                {playersLimitList.map((item) => (
                                  <MenuItem  key={"item-" + item} value={item}>{item}</MenuItem>
                                ))}

                              </Select>
                            </FormControl>
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
                      updateGame(elementID);
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
                            <label className="label">Game Name</label>
                            <input 
                                className="input"
                                type="text"
                                placeholder="Name"
                                onChange={ (e) => setName(e.target.value) }
                            />
                        </div>

                        <div className="field">
                            <label className="label">Game Slug</label>
                            <input 
                                className="input"
                                type="text"
                                placeholder="Slug"
                                onChange={ (e) => setSlug(e.target.value) }
                            />
                          </div>

                          <div className="field">
                            <label className="label">Game Description</label>
                            <textarea
                                rows="4"
                                cols="50"
                                className="input"
                                placeholder="Description"
                                onChange={ (e) => setDescription(e.target.value) }
                            />
                          </div>

                          <div className="field">
                            <label className="label">Joueurs Minimum</label>
                            <FormControl sx={{ m: 1, minWidth: 120 }}>
                              <Select
                                value={playersMin}
                                onChange={(e) => setPlayersMin(e.target.value)}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                              >
                                {playersMinList.map((item) => (
                                  <MenuItem  key={"item-" + item} value={item}>{item}</MenuItem>
                                ))}

                              </Select>
                            </FormControl>
                          </div>
          
                          <div className="field">
                              <label className="label">Players Limit</label>
                              <FormControl sx={{ m: 1, minWidth: 120 }}>
                                <Select
                                  value={playersLimit}
                                  onChange={(e) => setPlayersLimit(e.target.value)}
                                  displayEmpty
                                  inputProps={{ 'aria-label': 'Without label' }}
                                >
                                  {playersLimitList.map((item) => (
                                    <MenuItem  key={"item-" + item} value={item}>{item}</MenuItem>
                                  ))}

                                </Select>
                              </FormControl>
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
                      saveGameModel()
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
