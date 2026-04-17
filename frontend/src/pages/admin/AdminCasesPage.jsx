import React, { useCallback, useEffect, useState } from 'react';
import { Edit, Filter, Search, Trash2, XCircle } from 'lucide-react';

import Modal from '../../components/Modal';
import axios, { API } from '../../lib/api';

const getList = (data) => (Array.isArray(data) ? data : data?.results || []);
const emptyFilters = { name: '', status: '', category: '' };
const panelClasses = 'rounded-md border border-white/10 bg-black/72 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)] sm:p-6';

const AdminCasesPage = ({ showToast }) => {
  const [cases, setCases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [editingCase, setEditingCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCases = useCallback(async (nextFilters = appliedFilters) => {
    const params = new URLSearchParams();
    if (nextFilters.name) params.append('name', nextFilters.name);
    if (nextFilters.status) params.append('status', nextFilters.status);
    if (nextFilters.category) params.append('category', nextFilters.category);

    setLoading(true);
    setError('');
    try {
      const query = params.toString();
      const res = await axios.get(`${API}/cases/${query ? `?${query}` : ''}`);
      setCases(getList(res.data));
    } catch {
      setError('Cases could not be loaded right now.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API}/categories/`);
        if (active) setCategories(getList(res.data));
      } catch {
        if (active) setCategories([]);
      }
    };

    fetchCategories();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    fetchCases(appliedFilters);
  }, [appliedFilters, fetchCases]);

  const handleDeleteCase = async (id) => {
    if (!window.confirm('Delete this case permanently? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/cases/${id}/`);
      showToast('Case permanently removed.');
      fetchCases(appliedFilters);
    } catch {
      showToast('Case deletion failed.', 'error');
    }
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  return (
    <div className="grid gap-5 sm:gap-6">
      <section className={panelClasses}>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_auto]" onSubmit={applyFilters}>
          <div>
            <label htmlFor="admin-case-search" className="field-label">Search cases</label>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="admin-case-search"
                className="dark-input pl-10"
                placeholder="Name, author, or case hook"
                value={filters.name}
                onChange={event => setFilters(current => ({ ...current, name: event.target.value }))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-case-status" className="field-label">Status</label>
            <select
              id="admin-case-status"
              className="dark-select"
              value={filters.status}
              onChange={event => setFilters(current => ({ ...current, status: event.target.value }))}
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label htmlFor="admin-case-domain" className="field-label">Domain</label>
            <select
              id="admin-case-domain"
              className="dark-select"
              value={filters.category}
              onChange={event => setFilters(current => ({ ...current, category: event.target.value }))}
            >
              <option value="">All domains</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:self-end">
            <button className="btn-primary w-full" type="submit">
              <Filter size={18} />
              Apply
            </button>
            <button className="btn-secondary w-full" type="button" onClick={clearFilters}>
              <XCircle size={18} />
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className={panelClasses}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Docket</p>
            <h2 className="mt-2 font-serif text-2xl text-white">Case files</h2>
          </div>
          <p className="text-sm text-slate-400">{cases.length} matching {cases.length === 1 ? 'case' : 'cases'}</p>
        </div>

        {loading && <div className="mt-5 rounded-md border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">Loading case files...</div>}
        {error && <div className="mt-5 rounded-md border border-rose-400/20 bg-rose-500/10 px-4 py-6 text-sm text-rose-200">{error}</div>}

        {!loading && !error && (
          <div className="mt-5">
            <div className="table-shell">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Domain</th>
                    <th>Votes</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-slate-400">No matching case files found.</td>
                    </tr>
                  )}
                  {cases.map(item => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.title_hook}</strong>
                        <span className="mt-1 block text-slate-400">Author: {item.author_name || 'Anonymous'}</span>
                      </td>
                      <td>{item.category?.name || 'Unassigned'}</td>
                      <td>
                        <span className="flex flex-wrap gap-2">
                          <b className="text-rose-300">{item.votes_guilty} G</b>
                          <b className="text-amber-200">{item.votes_esh} E</b>
                          <b className="text-emerald-300">{item.votes_not_guilty} N</b>
                        </span>
                        <span className="mt-1 block text-slate-400">{item.total_votes} total</span>
                      </td>
                      <td>
                        <span className={item.status === 'open' ? 'status-badge-open' : 'status-badge-closed'}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="icon-button h-10 w-10" type="button" aria-label={`Edit ${item.title_hook}`} onClick={() => setEditingCase(item)}>
                            <Edit size={16} />
                          </button>
                          <button className="icon-button h-10 w-10 border-rose-500/20 text-rose-200 hover:bg-rose-500/10" type="button" aria-label={`Delete ${item.title_hook}`} onClick={() => handleDeleteCase(item.id)}>
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
              {cases.length === 0 && (
                <div className="rounded-md border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
                  No matching case files found.
                </div>
              )}
              {cases.map(item => (
                <article className="rounded-md border border-white/10 bg-white/5 p-4" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="block text-base text-white">{item.title_hook}</strong>
                      <span className="mt-1 block text-sm text-slate-400">{item.category?.name || 'Unassigned'}</span>
                    </div>
                    <span className={item.status === 'open' ? 'status-badge-open' : 'status-badge-closed'}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Author: {item.author_name || 'Anonymous'}</p>
                  <p className="mt-2 text-sm text-slate-400">{item.total_votes} votes recorded</p>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button className="btn-secondary w-full" type="button" onClick={() => setEditingCase(item)}>
                      <Edit size={18} />
                      Edit
                    </button>
                    <button className="btn-secondary w-full border-rose-500/20 text-rose-200 hover:bg-rose-500/10" type="button" onClick={() => handleDeleteCase(item.id)}>
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

      {editingCase && (
        <Modal
          type="edit-case"
          item={editingCase}
          cats={categories}
          onClose={() => setEditingCase(null)}
          onSuccess={() => {
            setEditingCase(null);
            fetchCases(appliedFilters);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default AdminCasesPage;
