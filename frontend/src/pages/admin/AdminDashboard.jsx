import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gavel, Menu, X, Scale, Flame,
  MessageCircle, Shield, Users, BarChart2, LogOut, PlusCircle,
  Eye, EyeOff, Filter, Search, Edit, Trash2, Layers, Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios, { API } from '../../lib/api';
import { fadeIn } from '../../lib/animations';
import Modal from '../../components/Modal';

const AdminDashboard = ({ showToast }) => {
  const { user, handleLogout } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbacks, setFeedbacks] = useState([]);
  const [adminCases, setAdminCases] = useState([]);
  const [caseFilters, setCaseFilters] = useState({ name: '', status: '', category: '' });
  const [adminCats, setAdminCats] = useState([]);
  const [editingCase, setEditingCase] = useState(null);
  const [editingDomain, setEditingDomain] = useState(null);
  const [isCreatingDomain, setIsCreatingDomain] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ new_username: '', new_password: '', new_email: '', admin_password: '' });
  const [creating, setCreating] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showAuthPw, setShowAuthPw] = useState(false);
  const [loadingCases, setLoadingCases] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoadingCases(true);
    try {
      const params = new URLSearchParams();
      if (caseFilters.name) params.append('name', caseFilters.name);
      if (caseFilters.status) params.append('status', caseFilters.status);
      if (caseFilters.category) params.append('category', caseFilters.category);

      const res = await axios.get(`${API}/cases/?${params.toString()}`);
      setAdminCases(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) { console.error(err); }
    setLoadingCases(false);
  }, [caseFilters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, fRes, cRes] = await Promise.all([
          axios.get(`${API}/users/admin-stats/`),
          axios.get(`${API}/feedback/`),
          axios.get(`${API}/categories/`)
        ]);
        setStats(sRes.data);
        setFeedbacks(Array.isArray(fRes.data) ? fRes.data : fRes.data.results || []);
        setAdminCats(Array.isArray(cRes.data) ? cRes.data : cRes.data.results || []);
      } catch (err) { console.error(err); }
    };
    fetchData();
    if (activeTab === 'cases') fetchCases();
  }, [activeTab, fetchCases]);

  const handleDeleteCase = async (id) => {
    if (!window.confirm("Are you sure you want to strike this case from the record? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/cases/${id}/`);
      showToast("Case permanently removed.");
      fetchCases();
    } catch (err) {
      showToast("Deletion failed.", "error");
    }
  };

  const handleDeleteDomain = async (id) => {
    if (!window.confirm("Strike this domain from existence? Any linked cases will lose their domain assignment.")) return;
    try {
      await axios.delete(`${API}/categories/${id}/`);
      showToast("Domain removed.");
      const [sRes, cRes] = await Promise.all([
        axios.get(`${API}/users/admin-stats/`),
        axios.get(`${API}/categories/`)
      ]);
      setStats(sRes.data);
      setAdminCats(Array.isArray(cRes.data) ? cRes.data : cRes.data.results || []);
    } catch (err) { showToast("Action aborted.", "error"); }
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Mobile Toggle */}
      <button
        className="btn btn-glass mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1100, width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent)', color: '#000', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        width: '280px', background: '#000', borderRight: '1px solid #222',
        display: 'flex', flexDirection: 'column', position: 'sticky',
        top: 0, height: '100vh', zIndex: 1000
      }}>
        <div style={{ padding: '40px 24px', borderBottom: '1px solid #111' }}>
          <img src="/assets/logo.png" alt="Admin" style={{ height: '40px', marginBottom: '16px' }} />
          <h2 className="font-serif" style={{ fontSize: '0.9rem', letterSpacing: '4px', color: 'var(--accent)', textTransform: 'uppercase' }}>Oversight Protocol</h2>
        </div>

        <nav className="admin-nav" style={{ padding: '24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <button className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}>
            <BarChart2 size={20} /> <span>Analytics</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'cases' ? 'active' : ''}`} onClick={() => { setActiveTab('cases'); setSidebarOpen(false); }}>
            <Gavel size={20} /> <span>Case Files</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'domains' ? 'active' : ''}`} onClick={() => { setActiveTab('domains'); setSidebarOpen(false); }}>
            <Layers size={20} /> <span>Domains</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'create-admin' ? 'active' : ''}`} onClick={() => { setActiveTab('create-admin'); setSidebarOpen(false); }}>
            <PlusCircle size={20} /> <span>Operators</span>
          </button>

          <div className="admin-nav-spacer" style={{ marginTop: 'auto' }} />

          <div className="admin-sidebar-footer">
            <div className="nav-user-chip" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border-subtle)', color: 'white' }}>
              <Shield size={14} color="var(--secondary)" /> <span>{user?.username}</span>
            </div>
            <button id="admin-logout" className="admin-nav-item logout-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
              <LogOut size={20} /> <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="admin-main">
        <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="font-serif" style={{ fontSize: '2.5rem' }}>
            {activeTab === 'overview' ? 'System Overview' : activeTab === 'cases' ? 'Docket Management' : activeTab === 'domains' ? 'Domain Protocols' : 'Personnel Management'}
          </h1>
          <div className="glass" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            System Status: <span style={{ color: 'var(--success)', fontWeight: 700 }}>OPERATIONAL</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div key="overview" {...fadeIn} className="admin-content">
              <div className="stats-grid">
                <div className="stat-card glass">
                  <Scale className="stat-icon" color="var(--accent)" />
                  <span className="stat-value">{stats?.cases_count || 0}</span>
                  <span className="stat-label">Active Disputes</span>
                </div>
                <div className="stat-card glass">
                  <Flame className="stat-icon" color="var(--danger)" />
                  <span className="stat-value">{stats?.votes_count || 0}</span>
                  <span className="stat-label">Verdict Count</span>
                </div>
                <div className="stat-card glass">
                  <Users className="stat-icon" color="#3b82f6" />
                  <span className="stat-value">{stats?.users_count || 0}</span>
                  <span className="stat-label">Registered Citizens</span>
                </div>
                <div className="stat-card glass">
                  <MessageCircle className="stat-icon" color="var(--warning)" />
                  <span className="stat-value">{stats?.feedback_count || 0}</span>
                  <span className="stat-label">Feedback Reports</span>
                </div>
              </div>

              {/* Juror Table */}
              <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '32px', marginTop: '32px' }}>
                <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield size={24} color="var(--accent)" /> Active Juror Directory
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-dim)', fontSize: '0.8rem', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '16px' }}>CID</th>
                        <th style={{ padding: '16px' }}>CITIZEN IDENTITY</th>
                        <th style={{ padding: '16px' }}>ENDPOINT</th>
                        <th style={{ padding: '16px' }}>PROTOCOL ACCESS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.users?.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '16px', color: 'var(--text-dim)' }}>#{u.id}</td>
                          <td style={{ padding: '16px', fontWeight: 700 }}>{u.username}</td>
                          <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{u.email || 'N/A'}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem',
                              background: u.is_admin ? 'var(--accent-muted)' : 'rgba(255,255,255,0.03)',
                              color: u.is_admin ? 'var(--accent)' : 'var(--text-dim)',
                              border: `1px solid ${u.is_admin ? 'var(--accent)' : 'transparent'}`
                            }}>
                              {u.is_admin ? 'SUPER-OPERATOR' : 'CITIZEN-JUROR'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '32px', marginTop: '32px' }}>
                <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MessageCircle color="var(--accent)" /> Incoming Transmissions (Feedback)
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {feedbacks.length === 0 && <p style={{ color: 'var(--text-dim)' }}>No incoming transmissions.</p>}
                  {feedbacks.map(f => (
                    <div key={f.id} className="glass-bright" style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                          {f.feedback_type}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(f.created_at).toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{f.message}</p>
                      {f.email && <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Send size={12} /> {f.email}
                      </div>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'cases' ? (
            <motion.div key="cases" {...fadeIn}>
              <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>SEARCH BY NAME/HOOK</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      placeholder="Enter citizen name or case hook..."
                      value={caseFilters.name}
                      onChange={e => setCaseFilters(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={{ width: '180px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>VOTE STATUS</label>
                  <select
                    className="form-input"
                    value={caseFilters.status}
                    onChange={e => setCaseFilters(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div style={{ width: '180px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>DOMAIN</label>
                  <select
                    className="form-input"
                    value={caseFilters.category}
                    onChange={e => setCaseFilters(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">All Domains</option>
                    {adminCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={() => fetchCases()} style={{ height: '48px', padding: '0 24px' }}>
                  <Filter size={18} /> Apply Filters
                </button>
              </div>

              <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '32px' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-dim)', fontSize: '0.8rem', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '16px' }}>HOOK / IDENTITY</th>
                        <th style={{ padding: '16px' }}>DOMAIN</th>
                        <th style={{ padding: '16px' }}>VERDICT STATS</th>
                        <th style={{ padding: '16px' }}>STATUS</th>
                        <th style={{ padding: '16px' }}>PROTOCOL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingCases && <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Accessing Dossiers...</td></tr>}
                      {!loadingCases && adminCases.length === 0 && <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No matching casefiles found.</td></tr>}
                      {adminCases.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: 700, marginBottom: '4px' }}>{c.title_hook}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Author: {c.author_name}</div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem', fontWeight: 800 }}>
                              {c.category?.name || 'GENERIC'}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
                              <span style={{ color: 'var(--danger)' }}>{c.votes_guilty}G</span>
                              <span style={{ color: 'var(--warning)' }}>{c.votes_esh}E</span>
                              <span style={{ color: 'var(--success)' }}>{c.votes_not_guilty}N</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>Total: {c.total_votes}</div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800,
                              background: c.status === 'open' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                              color: c.status === 'open' ? '#10b981' : '#f43f5e'
                            }}>
                              {c.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button onClick={() => setEditingCase(c)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleDeleteCase(c.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {editingCase && (
                <Modal
                  type="edit-case"
                  item={editingCase}
                  cats={[]}
                  onClose={() => setEditingCase(null)}
                  onSuccess={() => { setEditingCase(null); fetchCases(); }}
                  showToast={showToast}
                />
              )}
            </motion.div>
          ) : activeTab === 'domains' ? (
            <motion.div key="domains" {...fadeIn}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                <button className="btn btn-primary" onClick={() => setIsCreatingDomain(true)}>
                  <PlusCircle size={18} /> Establish New Domain
                </button>
              </div>

              <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '32px' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-dim)', fontSize: '0.8rem', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '16px' }}>DOMAIN IDENTITY</th>
                        <th style={{ padding: '16px' }}>SYSTEM SLUG</th>
                        <th style={{ padding: '16px' }}>PROTOCOL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminCats.length === 0 && <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No domains integrated.</td></tr>}
                      {adminCats.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '16px', fontWeight: 800, fontSize: '1.1rem' }}>{c.name}</td>
                          <td style={{ padding: '16px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>/{c.slug}</td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button onClick={() => setEditingDomain(c)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleDeleteDomain(c.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {(isCreatingDomain || editingDomain) && (
                <Modal
                  type={isCreatingDomain ? "create-domain" : "edit-domain"}
                  item={editingDomain}
                  onClose={() => { setIsCreatingDomain(false); setEditingDomain(null); }}
                  onSuccess={async () => {
                    setIsCreatingDomain(false);
                    setEditingDomain(null);
                    const cRes = await axios.get(`${API}/categories/`);
                    setAdminCats(Array.isArray(cRes.data) ? cRes.data : cRes.data.results || []);
                  }}
                  showToast={showToast}
                />
              )}
            </motion.div>
          ) : (
            <motion.div key="create" {...fadeIn} style={{ maxWidth: '600px' }}>
              <div className="glass" style={{ padding: '48px', borderRadius: 'var(--radius-lg)' }}>
                <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '32px' }}>Enroll Agent</h2>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setCreating(true);
                  try {
                    await axios.post(`${API}/users/create-admin/`, {
                      ...newAdmin,
                      admin_username: user.username,
                    });
                    showToast('New administrator registered.');
                    setNewAdmin({ new_username: '', new_password: '', new_email: '', admin_password: '' });
                    setActiveTab('overview');
                  } catch (err) {
                    showToast(err.response?.data?.error || 'Registration failed.', 'error');
                  }
                  setCreating(false);
                }}>
                  <div className="field-group">
                    <label>Agent Username</label>
                    <input id="new-admin-user" className="form-input" value={newAdmin.new_username} onChange={e => setNewAdmin(n => ({ ...n, new_username: e.target.value }))} required />
                  </div>
                  <div className="field-group">
                    <label>Agent Email</label>
                    <input id="new-admin-email" className="form-input" type="email" value={newAdmin.new_email} onChange={e => setNewAdmin(n => ({ ...n, new_email: e.target.value }))} />
                  </div>
                  <div className="field-group">
                    <label>Initial Access Key</label>
                    <div style={{ position: 'relative' }}>
                      <input id="new-admin-pw" className="form-input" style={{ paddingRight: '48px' }} type={showNewPw ? "text" : "password"} value={newAdmin.new_password} onChange={e => setNewAdmin(n => ({ ...n, new_password: e.target.value }))} required />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                        {showNewPw ? <EyeOff size={18} /> : <Eye size={18} className="eye-blink" />}
                      </button>
                    </div>
                  </div>
                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '32px 0' }} />
                  <div className="field-group">
                    <label>Confirm Your Authorization Key</label>
                    <div style={{ position: 'relative' }}>
                      <input id="auth-admin-pw" className="form-input" style={{ paddingRight: '48px' }} type={showAuthPw ? "text" : "password"} value={newAdmin.admin_password} onChange={e => setNewAdmin(n => ({ ...n, admin_password: e.target.value }))} required />
                      <button type="button" onClick={() => setShowAuthPw(!showAuthPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                        {showAuthPw ? <EyeOff size={18} /> : <Eye size={18} className="eye-blink" />}
                      </button>
                    </div>
                  </div>
                  <button id="create-admin-btn" type="submit" className="btn btn-primary" disabled={creating} style={{ width: '100%' }}>
                    {creating ? 'Processing...' : 'Authorize Personnel'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
