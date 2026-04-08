import { useState, useEffect, useRef, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from "../../../api";

export default function PlayersList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [elementID, setElementID] = useState();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const cancelDeleteButtonRef = useRef(null);

  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 8;

  useEffect(() => { getUsers(); }, []);

  const getUsers = async () => {
    const response = await api.get('/users');
    setUsers(response.data);
  };

  const deleteUser = async (id) => {
    await api.delete(`/users/${id}`);
    getUsers();
  };

  const updatePlayerRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}`, { role });
    } catch (error) {
      console.error("Error updating role:", error);
    }
    getUsers();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="sort-icon">&#8597;</span>;
    return <span className="sort-icon">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
  };

  const filtered = useMemo(() => {
    let data = [...users];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(u =>
        u.username?.toLowerCase().includes(s) ||
        u.mail?.toLowerCase().includes(s) ||
        u.role?.toLowerCase().includes(s)
      );
    }
    data.sort((a, b) => {
      const va = a[sortField] ?? '';
      const vb = b[sortField] ?? '';
      if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return data;
  }, [users, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  const formatDate = (d) => {
    if (!d) return '\u2014';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className='admin-table-custom'>
      <div className="admin-table-header">
        <h3>Joueurs</h3>
        <input
          type="text"
          className="admin-search"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>ID <SortIcon field="id" /></th>
              <th onClick={() => handleSort('username')}>Utilisateur <SortIcon field="username" /></th>
              <th onClick={() => handleSort('mail')}>Email <SortIcon field="mail" /></th>
              <th>Role</th>
              <th onClick={() => handleSort('status')}>Status <SortIcon field="status" /></th>
              <th onClick={() => handleSort('createdAt')}>Inscription <SortIcon field="createdAt" /></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan="7" className="empty-row">Aucun joueur trouvé</td></tr>
            ) : paged.map((user, idx) => (
              <tr key={user.id} className="table-row-animated" style={{ animationDelay: `${idx * 0.04}s` }}>
                <td className="cell-id">{user.id}</td>
                <td>
                  <div className="cell-user cell-user-link" onClick={() => navigate(`/profile/${user.username}`)}>
                    <img className="cell-avatar" src={`https://robohash.org/${user.username || 'user'}`} alt="" />
                    <span>{user.username}</span>
                  </div>
                </td>
                <td className="cell-muted">{user.mail}</td>
                <td>
                  <select
                    className="admin-select-inline"
                    value={user.role}
                    onChange={(e) => updatePlayerRole(user.id, e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.status === 'verified' ? 'verified' : 'pending'}`}>
                    {user.status || 'pending'}
                  </span>
                </td>
                <td className="cell-muted">{formatDate(user.createdAt)}</td>
                <td>
                  <button className="admin-action-btn delete" onClick={() => { setElementID(user.id); setDeleteOpen(true); }} title="Supprimer">
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

      <Transition.Root show={deleteOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" initialFocus={cancelDeleteButtonRef} onClose={setDeleteOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="admin-modal">
                  <div className="admin-modal-icon delete"><ExclamationTriangleIcon /></div>
                  <Dialog.Title as="h3" className="admin-modal-title">Supprimer le joueur</Dialog.Title>
                  <p className="admin-modal-text">Cette action est irréversible.</p>
                  <div className="admin-modal-buttons">
                    <button className="admin-modal-btn danger" onClick={() => { deleteUser(elementID); setDeleteOpen(false); }}>Supprimer</button>
                    <button className="admin-modal-btn cancel" ref={cancelDeleteButtonRef} onClick={() => setDeleteOpen(false)}>Annuler</button>
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
