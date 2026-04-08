import { useState, useEffect, Fragment, useRef, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from "../../../api";

export default function GameModelsList() {
  const [games, setGames] = useState([]);
  const [elementID, setElementID] = useState();
  const [deleteName, setDeleteName] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [playersMin, setPlayersMin] = useState(1);
  const [playersLimit, setPlayersLimit] = useState(2);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 9;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const cancelDeleteButtonRef = useRef(null);
  const cancelEditButtonRef = useRef(null);
  const cancelAddButtonRef = useRef(null);

  const playerOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  useEffect(() => { getGames(); }, []);

  const getGames = async () => {
    const response = await api.get('/gamemodels');
    setGames(response.data);
  };

  const getGameById = async (id) => {
    const response = await api.get(`/gamemodels/${id}`);
    setName(response.data.name);
    setSlug(response.data.slug);
    setDescription(response.data.description);
    setPlayersMin(response.data.playersMin);
    setPlayersLimit(response.data.playersLimit);
    setImageFile(null);
    setImagePreview(response.data.image ? `${import.meta.env.VITE_API_URL}${response.data.image}` : '');
  };

  const deleteGame = async (id) => { await api.delete(`/gamemodels/${id}`); getGames(); };
  const updateGame = async (id) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('playersMin', playersMin);
    formData.append('playersLimit', playersLimit);
    if (imageFile) formData.append('image', imageFile);
    await api.patch(`/gamemodels/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    getGames();
  };
  const saveGameModel = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('playersMin', parseInt(playersMin));
    formData.append('playersLimit', parseInt(playersLimit));
    if (imageFile) formData.append('image', imageFile);
    await api.post('/gamemodels', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    getGames();
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="sort-icon">&#8597;</span>;
    return <span className="sort-icon">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
  };

  const filtered = useMemo(() => {
    let data = [...games];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(g => g.name?.toLowerCase().includes(s) || g.slug?.toLowerCase().includes(s));
    }
    data.sort((a, b) => {
      const va = a[sortField] ?? '';
      const vb = b[sortField] ?? '';
      if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return data;
  }, [games, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  const resetForm = () => { setName(''); setSlug(''); setDescription(''); setPlayersMin(1); setPlayersLimit(2); setImageFile(null); setImagePreview(''); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const FormFields = () => (
    <>
      <div className="admin-field">
        <label>Nom du jeu</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" />
      </div>
      <div className="admin-field">
        <label>Slug</label>
        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" />
      </div>
      <div className="admin-field">
        <label>Description</label>
        <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      </div>
      <div className="admin-field">
        <label>Image du jeu</label>
        <div className="admin-image-upload">
          {imagePreview && <img src={imagePreview} alt="Aperçu" className="admin-image-preview" />}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label>Min joueurs</label>
          <select value={playersMin} onChange={(e) => setPlayersMin(parseInt(e.target.value))}>
            {playerOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="admin-field">
          <label>Max joueurs</label>
          <select value={playersLimit} onChange={(e) => setPlayersLimit(parseInt(e.target.value))}>
            {playerOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </>
  );

  return (
    <div className='admin-table-custom'>
      <div className="admin-table-header">
        <h3>Jeux</h3>
        <div className="admin-table-header-actions">
          <input type="text" className="admin-search" placeholder="Rechercher..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          <button className="admin-add-btn" onClick={() => { resetForm(); setAddOpen(true); }}>+ Ajouter</button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>ID <SortIcon field="id" /></th>
              <th onClick={() => handleSort('name')}>Nom <SortIcon field="name" /></th>
              <th onClick={() => handleSort('slug')}>Slug <SortIcon field="slug" /></th>
              <th>Description</th>
              <th onClick={() => handleSort('playersMin')}>Min <SortIcon field="playersMin" /></th>
              <th onClick={() => handleSort('playersLimit')}>Max <SortIcon field="playersLimit" /></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan="7" className="empty-row">Aucun jeu trouvé</td></tr>
            ) : paged.map((game, idx) => (
              <tr key={game.id} className="table-row-animated" style={{ animationDelay: `${idx * 0.04}s` }}>
                <td className="cell-id">{game.id}</td>
                <td className="cell-bold">{game.name}</td>
                <td><span className="slug-badge">{game.slug}</span></td>
                <td className="cell-desc">{game.description}</td>
                <td className="cell-center">{game.playersMin}</td>
                <td className="cell-center">{game.playersLimit}</td>
                <td className="cell-actions">
                  <button className="admin-action-btn edit" onClick={() => { setElementID(game.id); getGameById(game.id); setEditOpen(true); }} title="Modifier">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                    </svg>
                  </button>
                  <button className="admin-action-btn delete" onClick={() => { setElementID(game.id); setDeleteName(game.name); setDeleteOpen(true); }} title="Supprimer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h2.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-table-footer">
        <span className="admin-table-count">Vue {filtered.length === 0 ? 0 : page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} sur {filtered.length} éléments</span>
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>&laquo;</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={page === i ? 'active' : ''} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>&raquo;</button>
          </div>
        )}
      </div>

      {/* Delete modal */}
      <Transition.Root show={deleteOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" initialFocus={cancelDeleteButtonRef} onClose={setDeleteOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="admin-modal admin-modal-delete">
                  <div className="admin-modal-icon delete"><ExclamationTriangleIcon /></div>
                  <Dialog.Title as="h3" className="admin-modal-title">Supprimer « {deleteName} »</Dialog.Title>
                  <p className="admin-modal-text">Cette action est irréversible et entraînera la suppression de :</p>
                  <ul className="admin-modal-cascade-list">
                    <li>Toutes les parties en cours et terminées</li>
                    <li>Les joueurs associés aux parties</li>
                    <li>Les modes de jeu configurés</li>
                    <li>Les scores des joueurs</li>
                    <li>Les événements liés et leurs participants</li>
                  </ul>
                  <div className="admin-modal-buttons">
                    <button className="admin-modal-btn cancel" ref={cancelDeleteButtonRef} onClick={() => setDeleteOpen(false)}>Annuler</button>
                    <button className="admin-modal-btn danger" onClick={() => { deleteGame(elementID); setDeleteOpen(false); }}>Supprimer définitivement</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Edit modal */}
      <Transition.Root show={editOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" initialFocus={cancelEditButtonRef} onClose={setEditOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="admin-modal">
                  <Dialog.Title as="h3" className="admin-modal-title">Modifier le jeu</Dialog.Title>
                  <div className="admin-modal-form"><FormFields /></div>
                  <div className="admin-modal-buttons">
                    <button className="admin-modal-btn confirm" onClick={() => { updateGame(elementID); setEditOpen(false); }}>Modifier</button>
                    <button className="admin-modal-btn cancel" ref={cancelEditButtonRef} onClick={() => setEditOpen(false)}>Annuler</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Add modal */}
      <Transition.Root show={addOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" initialFocus={cancelAddButtonRef} onClose={setAddOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="admin-modal">
                  <Dialog.Title as="h3" className="admin-modal-title">Ajouter un jeu</Dialog.Title>
                  <div className="admin-modal-form"><FormFields /></div>
                  <div className="admin-modal-buttons">
                    <button className="admin-modal-btn confirm" onClick={() => { saveGameModel(); setAddOpen(false); }}>Ajouter</button>
                    <button className="admin-modal-btn cancel" ref={cancelAddButtonRef} onClick={() => setAddOpen(false)}>Annuler</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
