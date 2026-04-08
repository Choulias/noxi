import { useState, useEffect, Fragment, useRef, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from "../../../api";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [gameModels, setGameModels] = useState([]);
  const [elementID, setElementID] = useState();
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [spotlight, setSpotlight] = useState(0);
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

  useEffect(() => { getEvents(); getGameModels(); }, []);

  const getEvents = async () => {
    const response = await api.get('/events');
    const evts = response.data;
    for (const evt of evts) {
      try { const att = await api.get(`/eventattendees/event/${evt.id}`); evt.numberAttendees = att.data.length; } catch { evt.numberAttendees = 0; }
      try { const lik = await api.get(`/eventlikers/event/${evt.id}`); evt.numberLikers = lik.data.length; } catch { evt.numberLikers = 0; }
    }
    setEvents([...evts]);
  };

  const getGameModels = async () => { const r = await api.get('/gamemodels'); setGameModels(r.data); };

  const getEventById = async (id) => {
    const r = await api.get(`/events/${id}`);
    setTitle(r.data.title); setTheme(r.data.theme); setDescription(r.data.description); setSpotlight(r.data.spotlight);
    setImageFile(null); setImagePreview(r.data.image ? `${import.meta.env.VITE_API_URL}${r.data.image}` : '');
  };

  const deleteEvent = async (id) => { await api.delete(`/events/${id}`); getEvents(); };
  const updateEvent = async (id) => {
    if (spotlight === 1) await api.patch(`/events/unspot/${spotlight}`, { spotlight: 0 });
    const formData = new FormData();
    formData.append('title', title);
    formData.append('theme', theme);
    formData.append('description', description);
    formData.append('spotlight', spotlight);
    if (imageFile) formData.append('image', imageFile);
    await api.patch(`/events/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    getEvents();
  };
  const saveEvent = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('theme', theme);
    formData.append('description', description);
    formData.append('spotlight', parseInt(spotlight));
    if (imageFile) formData.append('image', imageFile);
    await api.post('/events', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    getEvents();
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
    let data = [...events];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(e => e.title?.toLowerCase().includes(s) || e.theme?.toLowerCase().includes(s));
    }
    data.sort((a, b) => {
      const va = a[sortField] ?? '';
      const vb = b[sortField] ?? '';
      if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return data;
  }, [events, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  const resetForm = () => { setTitle(''); setTheme(gameModels[0]?.name || ''); setDescription(''); setSpotlight(0); setImageFile(null); setImagePreview(''); };

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
        <label>Titre</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" />
      </div>
      <div className="admin-field">
        <label>Description</label>
        <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      </div>
      <div className="admin-field">
        <label>Image de l'événement</label>
        <div className="admin-image-upload">
          {imagePreview && <img src={imagePreview} alt="Aperçu" className="admin-image-preview" />}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label>Theme</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            {gameModels.map(gm => <option key={gm.id} value={gm.name}>{gm.name}</option>)}
          </select>
        </div>
        <div className="admin-field">
          <label>Mis en avant</label>
          <label className="admin-toggle">
            <input type="checkbox" checked={spotlight === 1} onChange={(e) => setSpotlight(e.target.checked ? 1 : 0)} />
            <span className="admin-toggle-slider"></span>
          </label>
        </div>
      </div>
    </>
  );

  return (
    <div className='admin-table-custom'>
      <div className="admin-table-header">
        <h3>Evenements</h3>
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
              <th onClick={() => handleSort('title')}>Titre <SortIcon field="title" /></th>
              <th onClick={() => handleSort('theme')}>Theme <SortIcon field="theme" /></th>
              <th>Description</th>
              <th onClick={() => handleSort('numberAttendees')}>Participants <SortIcon field="numberAttendees" /></th>
              <th onClick={() => handleSort('numberLikers')}>Likes <SortIcon field="numberLikers" /></th>
              <th>Spotlight</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan="8" className="empty-row">Aucun événement</td></tr>
            ) : paged.map((evt, idx) => (
              <tr key={evt.id} className="table-row-animated" style={{ animationDelay: `${idx * 0.04}s` }}>
                <td className="cell-id">{evt.id}</td>
                <td className="cell-bold">{evt.title}</td>
                <td><span className="slug-badge">{evt.theme}</span></td>
                <td className="cell-desc">{evt.description}</td>
                <td className="cell-center">{evt.numberAttendees || 0}</td>
                <td className="cell-center">{evt.numberLikers || 0}</td>
                <td className="cell-center">
                  {evt.spotlight === 1 ? <span className="status-badge verified">Oui</span> : <span className="status-badge pending">Non</span>}
                </td>
                <td className="cell-actions">
                  <button className="admin-action-btn edit" onClick={() => { setElementID(evt.id); getEventById(evt.id); setEditOpen(true); }} title="Modifier">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
                  </button>
                  <button className="admin-action-btn delete" onClick={() => { setElementID(evt.id); setDeleteOpen(true); }} title="Supprimer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h2.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
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

      {/* Delete */}
      <Transition.Root show={deleteOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" initialFocus={cancelDeleteButtonRef} onClose={setDeleteOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" /></Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="admin-modal">
                <div className="admin-modal-icon delete"><ExclamationTriangleIcon /></div>
                <Dialog.Title as="h3" className="admin-modal-title">Supprimer l'événement</Dialog.Title>
                <p className="admin-modal-text">Cette action est irréversible.</p>
                <div className="admin-modal-buttons">
                  <button className="admin-modal-btn danger" onClick={() => { deleteEvent(elementID); setDeleteOpen(false); }}>Supprimer</button>
                  <button className="admin-modal-btn cancel" ref={cancelDeleteButtonRef} onClick={() => setDeleteOpen(false)}>Annuler</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div></div>
        </Dialog>
      </Transition.Root>

      {/* Edit */}
      <Transition.Root show={editOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" initialFocus={cancelEditButtonRef} onClose={setEditOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" /></Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="admin-modal">
                <Dialog.Title as="h3" className="admin-modal-title">Modifier l'événement</Dialog.Title>
                <div className="admin-modal-form"><FormFields /></div>
                <div className="admin-modal-buttons">
                  <button className="admin-modal-btn confirm" onClick={() => { updateEvent(elementID); setEditOpen(false); }}>Modifier</button>
                  <button className="admin-modal-btn cancel" ref={cancelEditButtonRef} onClick={() => setEditOpen(false)}>Annuler</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div></div>
        </Dialog>
      </Transition.Root>

      {/* Add */}
      <Transition.Root show={addOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" initialFocus={cancelAddButtonRef} onClose={setAddOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" /></Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="admin-modal">
                <Dialog.Title as="h3" className="admin-modal-title">Ajouter un événement</Dialog.Title>
                <div className="admin-modal-form"><FormFields /></div>
                <div className="admin-modal-buttons">
                  <button className="admin-modal-btn confirm" onClick={() => { saveEvent(); setAddOpen(false); }}>Ajouter</button>
                  <button className="admin-modal-btn cancel" ref={cancelAddButtonRef} onClick={() => setAddOpen(false)}>Annuler</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div></div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
