import React, { useCallback, useEffect, useState } from 'react';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';

import Modal from '../../components/Modal';
import axios, { API } from '../../lib/api';

const getList = (data) => (Array.isArray(data) ? data : data?.results || []);
const panelClasses = 'rounded-md border border-white/10 bg-black/72 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)] sm:p-6';

const AdminDomainsPage = ({ showToast }) => {
  const [categories, setCategories] = useState([]);
  const [editingDomain, setEditingDomain] = useState(null);
  const [creatingDomain, setCreatingDomain] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/categories/`);
      setCategories(getList(res.data));
    } catch {
      setError('Domains could not be loaded right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleDeleteDomain = async (id) => {
    if (!window.confirm('Delete this domain? Cases linked to it will lose their category.')) return;
    try {
      await axios.delete(`${API}/categories/${id}/`);
      showToast('Domain removed.');
      fetchDomains();
    } catch {
      showToast('Domain removal failed.', 'error');
    }
  };

  const closeModal = () => {
    setCreatingDomain(false);
    setEditingDomain(null);
  };

  return (
    <div className="grid gap-5 sm:gap-6">
      <section className={panelClasses}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Categories</p>
            <h2 className="mt-2 font-serif text-2xl text-white">Public domains</h2>
          </div>
          <button className="btn-primary w-full sm:w-auto" type="button" onClick={() => setCreatingDomain(true)}>
            <PlusCircle size={18} />
            New Domain
          </button>
        </div>
      </section>

      <section className={panelClasses}>
        {loading && <div className="rounded-md border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">Loading domains...</div>}
        {error && <div className="rounded-md border border-rose-400/20 bg-rose-500/10 px-4 py-6 text-sm text-rose-200">{error}</div>}

        {!loading && !error && (
          <div>
            <div className="table-shell">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Slug</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-slate-400">No domains have been created yet.</td>
                    </tr>
                  )}
                  {categories.map(category => (
                    <tr key={category.id}>
                      <td><strong>{category.name}</strong></td>
                      <td><code className="text-slate-300">/{category.slug}</code></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="icon-button h-10 w-10" type="button" aria-label={`Edit ${category.name}`} onClick={() => setEditingDomain(category)}>
                            <Edit size={16} />
                          </button>
                          <button className="icon-button h-10 w-10 border-rose-500/20 text-rose-200 hover:bg-rose-500/10" type="button" aria-label={`Delete ${category.name}`} onClick={() => handleDeleteDomain(category.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="info-card-list">
              {categories.length === 0 && (
                <div className="rounded-md border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
                  No domains have been created yet.
                </div>
              )}
              {categories.map(category => (
                <article className="rounded-md border border-white/10 bg-white/5 p-4" key={category.id}>
                  <div>
                    <strong className="block text-base text-white">{category.name}</strong>
                    <span className="mt-1 block text-sm text-slate-400">/{category.slug}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button className="btn-secondary w-full" type="button" onClick={() => setEditingDomain(category)}>
                      <Edit size={18} />
                      Edit
                    </button>
                    <button className="btn-secondary w-full border-rose-500/20 text-rose-200 hover:bg-rose-500/10" type="button" onClick={() => handleDeleteDomain(category.id)}>
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {(creatingDomain || editingDomain) && (
        <Modal
          type={creatingDomain ? 'create-domain' : 'edit-domain'}
          item={editingDomain}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            fetchDomains();
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default AdminDomainsPage;
