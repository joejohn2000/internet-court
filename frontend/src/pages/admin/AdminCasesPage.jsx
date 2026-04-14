import React, { useCallback, useEffect, useState } from 'react';
import { Edit, Filter, Search, Trash2, XCircle } from 'lucide-react';

import Modal from '../../components/Modal';
import axios, { API } from '../../lib/api';

const getList = (data) => (Array.isArray(data) ? data : data?.results || []);

const emptyFilters = { name: '', status: '', category: '' };

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
    return () => { active = false; };
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
    <div className="admin-page-stack">
      <section className="admin-panel">
        <form className="admin-filter-bar" onSubmit={applyFilters}>
          <div className="field-group admin-search-field">
            <label htmlFor="admin-case-search">Search cases</label>
            <div className="admin-input-icon">
              <Search size={16} />
              <input
                id="admin-case-search"
                className="form-input"
                placeholder="Name, author, or case hook"
                value={filters.name}
                onChange={event => setFilters(current => ({ ...current, name: event.target.value }))}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="admin-case-status">Status</label>
            <select
              id="admin-case-status"
              className="form-input"
              value={filters.status}
              onChange={event => setFilters(current => ({ ...current, status: event.target.value }))}
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="admin-case-domain">Domain</label>
            <select
              id="admin-case-domain"
              className="form-input"
              value={filters.category}
              onChange={event => setFilters(current => ({ ...current, category: event.target.value }))}
            >
              <option value="">All domains</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-filter-actions">
            <button className="btn btn-primary" type="submit">
              <Filter size={18} />
              Apply
            </button>
            <button className="btn btn-glass" type="button" onClick={clearFilters}>
              <XCircle size={18} />
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Docket</p>
            <h2 className="font-serif">Case files</h2>
          </div>
          <p>{cases.length} matching {cases.length === 1 ? 'case' : 'cases'}</p>
        </div>

        {loading && <div className="admin-empty-state">Loading case files...</div>}
        {error && <div className="admin-empty-state error">{error}</div>}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
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
                    <td colSpan="5">No matching case files found.</td>
                  </tr>
                )}
                {cases.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title_hook}</strong>
                      <span>Author: {item.author_name}</span>
                    </td>
                    <td>{item.category?.name || 'Unassigned'}</td>
                    <td>
                      <span className="admin-vote-row">
                        <b className="vote-guilty">{item.votes_guilty} G</b>
                        <b className="vote-esh">{item.votes_esh} E</b>
                        <b className="vote-clear">{item.votes_not_guilty} N</b>
                      </span>
                      <span>{item.total_votes} total</span>
                    </td>
                    <td>
                      <span className={`admin-badge ${item.status === 'open' ? 'badge-open' : 'badge-closed'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button className="admin-icon-button" type="button" aria-label={`Edit ${item.title_hook}`} onClick={() => setEditingCase(item)}>
                          <Edit size={18} />
                        </button>
                        <button className="admin-icon-button danger" type="button" aria-label={`Delete ${item.title_hook}`} onClick={() => handleDeleteCase(item.id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-card-list" aria-label="Case files">
              {cases.length === 0 && <div className="admin-empty-state">No matching case files found.</div>}
              {cases.map(item => (
                <article className="admin-list-card" key={item.id}>
                  <div>
                    <strong>{item.title_hook}</strong>
                    <span>{item.category?.name || 'Unassigned'}</span>
                  </div>
                  <p>Author: {item.author_name}</p>
                  <div className="admin-card-meta">
                    <span className={`admin-badge ${item.status === 'open' ? 'badge-open' : 'badge-closed'}`}>
                      {item.status}
                    </span>
                    <span>{item.total_votes} votes</span>
                  </div>
                  <div className="admin-row-actions">
                    <button className="btn btn-glass" type="button" onClick={() => setEditingCase(item)}>
                      <Edit size={18} />
                      Edit
                    </button>
                    <button className="btn btn-glass danger-text" type="button" onClick={() => handleDeleteCase(item.id)}>
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
