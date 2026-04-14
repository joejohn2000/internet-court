import React, { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, PlusCircle, Shield, Users } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import axios, { API } from '../../lib/api';

const getList = (data) => (Array.isArray(data) ? data : data?.results || []);

const emptyAdmin = {
  new_username: '',
  new_password: '',
  new_email: '',
  admin_password: ''
};

const AdminOperatorsPage = ({ showToast }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [newAdmin, setNewAdmin] = useState(emptyAdmin);
  const [creating, setCreating] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/users/admin-stats/`);
      setStats(res.data);
    } catch {
      setError('Users could not be loaded right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateAdmin = (key, value) => {
    setNewAdmin(current => ({ ...current, [key]: value }));
  };

  const createAdmin = async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      await axios.post(`${API}/users/create-admin/`, {
        ...newAdmin,
        admin_username: user.username
      });
      showToast('New administrator registered.');
      setNewAdmin(emptyAdmin);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Administrator creation failed.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const users = getList(stats?.users);
  const admins = users.filter(item => item.is_admin);

  return (
    <div className="admin-two-column">
      <section className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Access</p>
            <h2 className="font-serif">Create operator</h2>
          </div>
          <Shield size={24} />
        </div>

        <form className="admin-form" onSubmit={createAdmin}>
          <div className="field-group">
            <label htmlFor="new-admin-user">Username</label>
            <input
              id="new-admin-user"
              className="form-input"
              value={newAdmin.new_username}
              onChange={event => updateAdmin('new_username', event.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="new-admin-email">Email</label>
            <input
              id="new-admin-email"
              className="form-input"
              type="email"
              value={newAdmin.new_email}
              onChange={event => updateAdmin('new_email', event.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="new-admin-pw">Initial password</label>
            <div className="admin-password-field">
              <input
                id="new-admin-pw"
                className="form-input"
                type={showNewPassword ? 'text' : 'password'}
                value={newAdmin.new_password}
                onChange={event => updateAdmin('new_password', event.target.value)}
                required
              />
              <button type="button" aria-label="Show or hide initial password" onClick={() => setShowNewPassword(current => !current)}>
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="admin-form-divider" />

          <div className="field-group">
            <label htmlFor="auth-admin-pw">Your admin password</label>
            <div className="admin-password-field">
              <input
                id="auth-admin-pw"
                className="form-input"
                type={showAuthPassword ? 'text' : 'password'}
                value={newAdmin.admin_password}
                onChange={event => updateAdmin('admin_password', event.target.value)}
                required
              />
              <button type="button" aria-label="Show or hide your password" onClick={() => setShowAuthPassword(current => !current)}>
                {showAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button id="create-admin-btn" className="btn btn-primary" type="submit" disabled={creating}>
            <PlusCircle size={18} />
            {creating ? 'Creating...' : 'Create Operator'}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Directory</p>
            <h2 className="font-serif">Users and admins</h2>
          </div>
          <div className="admin-mini-stat">
            <Users size={18} />
            <span>{admins.length} admins</span>
          </div>
        </div>

        {loading && <div className="admin-empty-state">Loading users...</div>}
        {error && <div className="admin-empty-state error">{error}</div>}

        {!loading && !error && (
          <div className="admin-card-list always-visible">
            {users.map(item => (
              <article className="admin-list-card" key={item.id}>
                <div>
                  <strong>{item.username}</strong>
                  <span>#{item.id}</span>
                </div>
                <p>{item.email || 'No email on file'}</p>
                <span className={`admin-badge ${item.is_admin ? 'badge-admin' : ''}`}>
                  {item.is_admin ? 'Admin' : 'Citizen'}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminOperatorsPage;
