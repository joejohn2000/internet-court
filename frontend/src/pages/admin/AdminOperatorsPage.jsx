import React, { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, PlusCircle, Shield, Users } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import axios, { API } from '../../lib/api';

const getList = (data) => (Array.isArray(data) ? data : data?.results || []);
const panelClasses = 'rounded-md border border-white/10 bg-black/72 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)] sm:p-6';

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
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start">
      <section className={panelClasses}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Access</p>
            <h2 className="mt-2 font-serif text-2xl text-white">Create operator</h2>
          </div>
          <Shield size={22} className="text-amber-300" />
        </div>

        <form className="mt-5 grid gap-4" onSubmit={createAdmin}>
          <div>
            <label htmlFor="new-admin-user" className="field-label">Username</label>
            <input
              id="new-admin-user"
              className="dark-input"
              value={newAdmin.new_username}
              onChange={event => updateAdmin('new_username', event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="new-admin-email" className="field-label">Email</label>
            <input
              id="new-admin-email"
              className="dark-input"
              type="email"
              value={newAdmin.new_email}
              onChange={event => updateAdmin('new_email', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="new-admin-pw" className="field-label">Initial password</label>
            <div className="relative">
              <input
                id="new-admin-pw"
                className="dark-input pr-12"
                type={showNewPassword ? 'text' : 'password'}
                value={newAdmin.new_password}
                onChange={event => updateAdmin('new_password', event.target.value)}
                required
              />
              <button
                type="button"
                aria-label="Show or hide initial password"
                onClick={() => setShowNewPassword(current => !current)}
                className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div>
            <label htmlFor="auth-admin-pw" className="field-label">Your admin password</label>
            <div className="relative">
              <input
                id="auth-admin-pw"
                className="dark-input pr-12"
                type={showAuthPassword ? 'text' : 'password'}
                value={newAdmin.admin_password}
                onChange={event => updateAdmin('admin_password', event.target.value)}
                required
              />
              <button
                type="button"
                aria-label="Show or hide your password"
                onClick={() => setShowAuthPassword(current => !current)}
                className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                {showAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button id="create-admin-btn" className="btn-primary mt-1 w-full" type="submit" disabled={creating}>
            <PlusCircle size={18} />
            {creating ? 'Creating...' : 'Create Operator'}
          </button>
        </form>
      </section>

      <section className={panelClasses}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Directory</p>
            <h2 className="mt-2 font-serif text-2xl text-white">Users and admins</h2>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal-300">
            <Users size={18} />
            <span>{admins.length} admins</span>
          </div>
        </div>

        {loading && <div className="mt-5 rounded-md border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">Loading users...</div>}
        {error && <div className="mt-5 rounded-md border border-rose-400/20 bg-rose-500/10 px-4 py-6 text-sm text-rose-200">{error}</div>}

        {!loading && !error && (
          <div className="mt-5 grid gap-3">
            {users.map(item => (
              <article className="rounded-md border border-white/10 bg-white/5 p-4" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block text-base text-white">{item.username}</strong>
                    <span className="mt-1 block text-sm text-slate-400">#{item.id}</span>
                  </div>
                  <span className={item.is_admin ? 'status-badge-admin' : 'status-badge border-white/12 bg-white/6 text-slate-200'}>
                    {item.is_admin ? 'Admin' : 'Citizen'}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-400">{item.email || 'No email on file'}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminOperatorsPage;
