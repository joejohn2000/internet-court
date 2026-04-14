import React, { useCallback, useEffect, useState } from 'react';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';

import Modal from '../../components/Modal';
import axios, { API } from '../../lib/api';

const getList = (data) => (Array.isArray(data) ? data : data?.results || []);

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
    <div className="admin-page-stack">
      <section className="admin-panel admin-toolbar-panel">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Categories</p>
            <h2 className="font-serif">Public domains</h2>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setCreatingDomain(true)}>
            <PlusCircle size={18} />
            New Domain
          </button>
        </div>
      </section>

      <section className="admin-panel">
        {loading && <div className="admin-empty-state">Loading domains...</div>}
        {error && <div className="admin-empty-state error">{error}</div>}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
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
                    <td colSpan="3">No domains have been created yet.</td>
                  </tr>
                )}
                {categories.map(category => (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                    </td>
                    <td>
                      <code>/{category.slug}</code>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button className="admin-icon-button" type="button" aria-label={`Edit ${category.name}`} onClick={() => setEditingDomain(category)}>
                          <Edit size={18} />
                        </button>
                        <button className="admin-icon-button danger" type="button" aria-label={`Delete ${category.name}`} onClick={() => handleDeleteDomain(category.id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-card-list" aria-label="Public domains">
              {categories.length === 0 && <div className="admin-empty-state">No domains have been created yet.</div>}
              {categories.map(category => (
                <article className="admin-list-card" key={category.id}>
                  <div>
                    <strong>{category.name}</strong>
                    <span>/{category.slug}</span>
                  </div>
                  <div className="admin-row-actions">
                    <button className="btn btn-glass" type="button" onClick={() => setEditingDomain(category)}>
                      <Edit size={18} />
                      Edit
                    </button>
                    <button className="btn btn-glass danger-text" type="button" onClick={() => handleDeleteDomain(category.id)}>
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
