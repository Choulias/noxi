import {React, useState, useEffect, useRef, Fragment} from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { DataGrid } from '@mui/x-data-grid';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import api from "../../../api";

export default function PlayersList() {

  const [elementID, setElementID] = useState();
  const [users, setUser] = useState([]);

  useEffect(() => {
    getUsers();
    let btnActive = document.querySelector(".players-btn");
    if(btnActive){
      btnActive.classList.add("active");
    }
    return () => {
      if(btnActive){
        btnActive.classList.remove("active");
      }
    };
  }, []);

  const getUsers = async () => {
      const response = await api.get('/users');
      setUser(response.data);
  }

  // Delete -------------------------------------------------------

  const cancelDeleteButtonRef = useRef(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
 
  const deleteUser = async (id) => {
      await api.delete(`/users/${id}`);
      getUsers();
  }

  const deletePlayerBtn = (params) => {
    return (
      <button
        className="admin-btn delete-btn"
        onClick={() => {
          setElementID(params.row.id);
          setDeleteOpen(true);
        }}
      >
        x
      </button>
    )
  }
  // Edit ---------------------------------------------------------

  const updatePlayerRole = async (id, role) => {

    try{
      const response = await api.patch(`/users/${id}`, {
        role: role,
      });
      console.log(response);
    }catch(error){
      console.log("CATCH ERREUR" + error);
    }
    getUsers();
  }

  const changeRoleBtn = (params) =>{
    return(
      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <Select
          value={params.row.role}
          onChange={(e) => {
            setElementID(params.row.id);
            updatePlayerRole(params.row.id, e.target.value);
          }}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem value={'user'}>user</MenuItem>
          <MenuItem value={'admin'}>admin</MenuItem>
        </Select>
      </FormControl>
    )
  }

  //------------------------------------------------------------------------
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: "Nom d'utilisateur", width: 200 },
    { field: 'mail', headerName: 'Mail', width: 250 },
    { field: 'role', headerName: 'Role', width: 130, renderCell: changeRoleBtn},
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'createdAt', headerName: "Date d'inscription", width: 200},
    { field: 'deletePlayer', headerName: "Supprimer", width: 100, renderCell: deletePlayerBtn, sortable: false, filterable: false}
  ];

  return (
    <div className='admin-table'>
      <div style={{ height: 400, width: '100%' }}>
          <DataGrid
          rows={users}
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
                         Etes-vous sûr de vouloir supprimer le joueur ? Cette action est irréversible.
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
                     deleteUser(elementID);
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
   </div>                 
  )
}
