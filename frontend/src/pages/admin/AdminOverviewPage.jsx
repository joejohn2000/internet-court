import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, FolderKanban, Layers, MessageCircle, Scale, Users } from 'lucide-react';

import axios, { API } from '../../lib/api';

const getList = (data) => (Array.isArray(data) ? data : data?.results || []);

const statItems = [
  { key: 'cases_count', label: 'Cases', icon: Scale, tone: 'text-amber-300' },
  { key: 'votes_count', label: 'Verdicts', icon: Flame, tone: 'text-rose-300' },
  { key: 'users_count', label: 'Citizens', icon: Users, tone: 'text-sky-300' },
  { key: 'feedback_count', label: 'Feedback', icon: MessageCircle, tone: 'text-emerald-300' }
];

const quickActions = [
  {
    to: '/admin/cases',
    label: 'Manage Cases',
    text: 'Filter disputes, edit records, or remove unsafe entries.',
    icon: FolderKanban
  },
  {
    to: '/admin/domains',
    label: 'Edit Domains',
    text: 'Create and clean up the public categories people choose from.',
    icon: Layers
  },
  {
    to: '/admin/feedback',
    label: 'Read Feedback',
    text: 'Scan reports and feature ideas without digging through analytics.',
    icon: MessageCircle
  }
];

const panelClasses = 'rounded-md border border-white/10 bg-black/72 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)] sm:p-6';

const AdminOverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API}/users/admin-stats/`);
        if (active) setStats(res.data);
      } catch {
        if (active) setError('Admin stats could not be loaded right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      active = false;
    };
  }, []);

  const users = getList(stats?.users);

  if (loading) {
    return <div className={panelClasses}>Loading the latest court activity...</div>;
  }

  if (error) {
    return <div className={`${panelClasses} border-rose-400/25 text-rose-200`}>{error}</div>;
  }

  return (
    <div className="grid gap-5 sm:gap-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Admin statistics">
        {statItems.map(({ key, label, icon: Icon, tone }) => (
          <div className={panelClasses} key={key}>
            {React.createElement(Icon, { size: 22, className: tone })}
            <p className="mt-5 text-4xl font-bold text-white">{stats?.[key] || 0}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
          </div>
        ))}
      </section>

      <section className={panelClasses}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Next actions</p>
            <h2 className="mt-2 font-serif text-2xl text-white">Separate workspaces</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Each admin feature now has its own page so mobile users do not have to wrestle a single crowded dashboard.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {quickActions.map(({ to, label, text, icon: Icon }) => (
            <Link
              className="rounded-md border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/35 hover:bg-teal-400/8"
              to={to}
              key={to}
            >
              {React.createElement(Icon, { size: 20, className: 'text-teal-300' })}
              <strong className="mt-4 block text-base text-white">{label}</strong>
              <span className="mt-2 block text-sm leading-6 text-slate-400">{text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={panelClasses}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">People snapshot</p>
            <h2 className="mt-2 font-serif text-2xl text-white">Active citizens</h2>
          </div>
          <Link to="/admin/operators" className="text-sm font-semibold text-teal-300 hover:text-teal-200">
            Manage access
          </Link>
        </div>

        <div className="mt-5">
          <div className="table-shell">
            <table className="table-base">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email || 'Not provided'}</td>
                    <td>
                      <span className={user.is_admin ? 'status-badge-admin' : 'status-badge border-white/12 bg-white/6 text-slate-200'}>
                        {user.is_admin ? 'Admin' : 'Citizen'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="info-card-list">
            {users.map(user => (
              <article className="rounded-md border border-white/10 bg-white/5 p-4" key={user.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block text-base text-white">{user.username}</strong>
                    <span className="text-sm text-slate-400">#{user.id}</span>
                  </div>
                  <span className={user.is_admin ? 'status-badge-admin' : 'status-badge border-white/12 bg-white/6 text-slate-200'}>
                    {user.is_admin ? 'Admin' : 'Citizen'}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-400">{user.email || 'No email on file'}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminOverviewPage;
