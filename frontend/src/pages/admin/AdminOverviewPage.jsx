import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, FolderKanban, Layers, MessageCircle, Scale, Users } from 'lucide-react';

import axios, { API } from '../../lib/api';

const getList = (data) => (Array.isArray(data) ? data : data?.results || []);

const statItems = [
  { key: 'cases_count', label: 'Cases', icon: Scale, tone: 'gold' },
  { key: 'votes_count', label: 'Verdicts', icon: Flame, tone: 'red' },
  { key: 'users_count', label: 'Citizens', icon: Users, tone: 'blue' },
  { key: 'feedback_count', label: 'Feedback', icon: MessageCircle, tone: 'green' }
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
    return () => { active = false; };
  }, []);

  const users = getList(stats?.users);

  if (loading) {
    return <div className="admin-empty-state">Loading the latest court activity...</div>;
  }

  if (error) {
    return <div className="admin-empty-state error">{error}</div>;
  }

  return (
    <div className="admin-page-stack">
      <section className="admin-stats-grid" aria-label="Admin statistics">
        {statItems.map(({ key, label, icon: Icon, tone }) => (
          <div className={`admin-stat-card tone-${tone}`} key={key}>
            {React.createElement(Icon, { size: 24 })}
            <span className="admin-stat-value">{stats?.[key] || 0}</span>
            <span className="admin-stat-label">{label}</span>
          </div>
        ))}
      </section>

      <section className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Next actions</p>
            <h2 className="font-serif">Separate workspaces</h2>
          </div>
          <p>Each admin feature now has its own page so mobile users do not have to wrestle a single crowded dashboard.</p>
        </div>
        <div className="admin-action-grid">
          {quickActions.map(({ to, label, text, icon: Icon }) => (
            <Link className="admin-action-card" to={to} key={to}>
              {React.createElement(Icon, { size: 22 })}
              <strong>{label}</strong>
              <span>{text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">People snapshot</p>
            <h2 className="font-serif">Active citizens</h2>
          </div>
          <Link to="/admin/operators" className="admin-text-link">Manage access</Link>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
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
                    <span className={`admin-badge ${user.is_admin ? 'badge-admin' : ''}`}>
                      {user.is_admin ? 'Admin' : 'Citizen'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="admin-card-list" aria-label="Active citizens">
            {users.map(user => (
              <article className="admin-list-card" key={user.id}>
                <div>
                  <strong>{user.username}</strong>
                  <span>#{user.id}</span>
                </div>
                <p>{user.email || 'No email on file'}</p>
                <span className={`admin-badge ${user.is_admin ? 'badge-admin' : ''}`}>
                  {user.is_admin ? 'Admin' : 'Citizen'}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminOverviewPage;
