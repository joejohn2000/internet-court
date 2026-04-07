import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Gavel, Menu, X, ThumbsUp, ThumbsDown,
  MessageCircle, CheckCircle2, AlertCircle,
  Shield, Users, BarChart2, LogOut, PlusCircle,
  UserCheck, Eye, EyeOff, Flame, Scale, Hash,
  ChevronRight, ArrowLeft, Send, Sparkles,
  ExternalLink, User, UserPlus, Edit, Trash2, Filter, Search,
  Layers, Bookmark, Grid, History
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
axios.defaults.withCredentials = true;

// Attach user identity to every request
axios.interceptors.request.use((config) => {
  try {
    const u = JSON.parse(localStorage.getItem('ic_user') || 'null');
    if (u?.id) config.headers['X-User-Id'] = u.id;
  } catch { /* ignore */ }
  return config;
});

/* ── Storage ── */
const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('ic_user') || 'null'); }
  catch { return null; }
};
const storeUser = (u) => localStorage.setItem('ic_user', JSON.stringify(u));
const clearUser = () => { localStorage.removeItem('ic_user'); localStorage.removeItem('ic_token'); };

/* ── Shared Animations ── */
const spring = { type: "spring", stiffness: 300, damping: 30 };
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
const slideUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

/* ═══════════════════════════════════════════════════════════
   ROOT APP
   ═══════════════════════════════════════════════════════════ */
const App = () => {
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(getStoredUser);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleAuthSuccess = (userData, isNew = false) => {
    storeUser(userData);
    setUser(userData);
    if (isNew) showToast(`Welcome to the Court, ${userData.username}!`);
    setPage(userData.is_admin ? 'admin' : 'home');
  };

  const handleLogout = async () => {
    try { await axios.post(`${API}/users/logout/`); } catch (e) { console.error("Logout cleanup failed", e); }
    clearUser();
    setUser(null);
    setPage('landing');
  };

  const handleGuest = () => {
    localStorage.removeItem('ic_guest_id'); // Clear previous persistent guest if any
    setUser({ username: 'Spectator', is_guest: true });
    setPage('home');
    showToast("Entering Spectator Mode. Voting Enabled (IP-Locked).");
  };

  useEffect(() => {
    if (user) setPage(user.is_admin ? 'admin' : 'home');

    // Handle session timeout or CSRF errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && [401, 403].includes(error.response.status)) {
          showToast("Session expired or security error. Logging out.", "error");
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <div className="layout-container">
      <AnimatePresence mode="wait">
        {page === 'landing' && (
          <Landing key="landing" onGoLogin={() => setPage('login')} onGuest={handleGuest} />
        )}
        {page === 'login' && (
          <LoginPage key="login" onLogin={handleAuthSuccess} onGoRegister={() => setPage('register')} onBack={() => setPage('landing')} showToast={showToast} />
        )}
        {page === 'register' && (
          <RegisterPage key="register" onRegister={handleAuthSuccess} onGoLogin={() => setPage('login')} onBack={() => setPage('landing')} showToast={showToast} />
        )}
        {page === 'home' && (
          <HomePage key="home" user={user} onLogout={handleLogout} showToast={showToast} setPage={setPage} />
        )}
        {page === 'history' && (
          <HistoryPage key="history" user={user} onBack={() => setPage('home')} showToast={showToast} />
        )}
        {page === 'admin' && (
          <AdminDashboard key="admin" user={user} onLogout={handleLogout} showToast={showToast} />
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="toast glass"
            style={{
              position: 'fixed', bottom: '40px', left: '50%', zIndex: 9999,
              padding: '16px 32px', borderRadius: '12px', borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#f43f5e'}`,
              display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, minWidth: '320px'
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 color="#10b981" /> : <AlertCircle color="#f43f5e" />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
const Landing = ({ onGoLogin, onGuest }) => (
  <motion.div
    {...fadeIn}
    className="auth-page"
    style={{ flexDirection: 'column', textAlign: 'center' }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ...spring, delay: 0.1 }}
      style={{ marginBottom: '60px' }}
    >
      <img src="/assets/logo.png" alt="Logo" className="logo-img" style={{ height: '180px', width: 'auto' }} />
    </motion.div>

    <motion.h1
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="hero-title"
    >
      Internet COURT
    </motion.h1>

    <motion.p
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={{ fontSize: '1.65rem', color: 'var(--text-on-dark)', fontWeight: 300, maxWidth: '800px', margin: '0 auto 60px', textTransform: 'uppercase', letterSpacing: '4px' }}
    >
      Where the masses settle the score.<br />Face the verdict.
    </motion.p>

    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="hero-actions"
    >
      <button id="landing-login" className="btn btn-primary hero-btn" onClick={onGoLogin}>
        <Shield size={24} /> Enter the Court
      </button>
      <button id="landing-guest" className="btn btn-glass hero-btn" onClick={onGuest}>
        <Eye size={24} /> Spectate
      </button>
    </motion.div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════
   AUTH COMPONENTS
   ═══════════════════════════════════════════════════════════ */
const AuthPageBase = ({ idPrefix, title, sub, icon, submitText, onAuth, onBack, showToast, footer, children, endpoint }) => {
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/users/${endpoint}/`, form);
      onAuth(res.data, endpoint === 'register');
    } catch (err) {
      showToast(err.response?.data?.error || 'Authentication failed.', 'error');
    }
    setLoading(false);
  };

  return (
    <motion.div {...slideUp} className="auth-page">
      <div className="auth-card">
        <button className="btn btn-glass" onClick={onBack} style={{ position: 'absolute', top: '24px', right: '24px', padding: '10px' }}>
          <X size={20} />
        </button>

        <div className="auth-icon-wrap">
          {icon}
        </div>
        <h2 className="auth-title">{title}</h2>
        <p className="auth-sub">{sub}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor={`${idPrefix}-username`}>Username</label>
            <input
              id={`${idPrefix}-username`}
              className="form-input"
              placeholder="e.g. adjudicator_7"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
            />
          </div>
          {children && children(form, setForm)}
          <div className="field-group">
            <label htmlFor={`${idPrefix}-password`}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id={`${idPrefix}-password`}
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ paddingRight: '48px' }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} className="eye-blink" />}
              </button>
            </div>
          </div>
          <button id={`${idPrefix}-submit`} className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '16px', marginBottom: '24px' }}>
            {loading ? 'Processing...' : submitText}
          </button>
        </form>
        {footer}
      </div>
    </motion.div>
  );
};

const LoginPage = ({ onLogin, onGoRegister, ...props }) => (
  <AuthPageBase
    idPrefix="user-login"
    title="Authorization"
    sub="Citizenship ID Verification"
    icon={<Shield size={32} color="var(--accent)" />}
    submitText="Access Court"
    endpoint="login"
    onAuth={onLogin}
    footer={
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        New to the court? <button onClick={onGoRegister} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Create an ID</button>
      </p>
    }
    {...props}
  />
);

const RegisterPage = ({ onRegister, onGoLogin, ...props }) => (
  <AuthPageBase
    idPrefix="user-register"
    title="Enlistment"
    sub="Register for the Global Jury Pool"
    icon={<UserPlus size={32} color="var(--accent)" />}
    submitText="Register for Service"
    endpoint="register"
    onAuth={onRegister}
    footer={
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        Already registered? <button onClick={onGoLogin} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Sign in here</button>
      </p>
    }
    {...props}
  >
    {(form, setForm) => (
      <div className="field-group">
        <label htmlFor="reg-email">Email (to verify status)</label>
        <input id="reg-email" className="form-input" type="email" placeholder="juror@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      </div>
    )}
  </AuthPageBase>
);


/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════ */
const AdminDashboard = ({ user, onLogout, showToast }) => {
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
      // Force refresh stats & domains
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
            <button id="admin-logout" className="admin-nav-item logout-item" onClick={onLogout} style={{ color: 'var(--danger)' }}>
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
                  cats={[]} // Category fetching can be added if needed, or pass from parent
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

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════ */
const HomePage = ({ user, onLogout, showToast, setPage }) => {
  const [cases, setCases] = useState([]);
  const [cats, setCats] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async (syncSelection = false) => {
    try {
      const [cs, ct] = await Promise.all([
        axios.get(`${API}/cases/`),
        axios.get(`${API}/categories/`)
      ]);
      const newCases = Array.isArray(cs.data) ? cs.data : cs.data.results || [];
      setCases(newCases);
      setCats(Array.isArray(ct.data) ? ct.data : ct.data.results || []);

      // Selection sync is only done when explicitly requested (e.g. after a vote)
      if (syncSelection) {
        setSelectedCase(prev => {
          if (!prev) return null;
          return newCases.find(c => c.id === prev.id) || prev;
        });
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <div className="layout-container">
      <nav className="top-nav">
        <div className="nav-logo" onClick={() => setSelectedCase(null)} style={{ cursor: 'pointer' }}>
          <img src="/assets/logo.png" alt="Internet Court" className="logo-img" />
        </div>
        <div className="nav-actions">
          <button id="nav-feedback" className="btn btn-glass icon-btn" onClick={() => setModalType('feedback')} title="Send Feedback">
            <MessageCircle size={20} />
          </button>
          {!user?.is_guest && (
            <button id="nav-history" className="btn btn-glass icon-btn" onClick={() => setPage('history')} title="View My Records">
              <History size={20} />
            </button>
          )}
          <div className="nav-divider" />
          {user && (
            <button id="nav-case" className="btn btn-primary" onClick={() => setModalType('submit')}>
              <PlusCircle size={20} /> <span>SUBMIT DOCKET</span>
            </button>
          )}
          <div className="nav-user-chip" style={user?.is_guest ? { borderStyle: 'dashed', opacity: 0.8 } : {}}>
            {user?.is_guest ? <Shield size={18} /> : <UserCheck size={18} />}
            <span>{user?.username.toUpperCase()}</span>
          </div>
          <button id="nav-logout" className="btn btn-glass icon-btn" onClick={onLogout} title="Log Out">
            <LogOut size={20} color="var(--danger)" />
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="feed-layout">
          <section className={`feed-list-section ${selectedCase ? 'with-detail' : ''}`}>
            <header className="feed-header">
              <h2 className="feed-title" style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>Public Docket</h2>
              <span className="feed-count">{cases.length} UNRESOLVED CASEFILES</span>
            </header>

            <LayoutGroup>
              <motion.div layout style={{ display: 'grid', gap: '24px' }}>
                {loading ? (
                  <p style={{ color: 'var(--text-dim)' }}>Accessing database...</p>
                ) : cases.length === 0 ? (
                  <div className="glass" style={{ padding: '60px', textAlign: 'center', borderRadius: '24px' }}>
                    <MessageCircle size={48} color="var(--text-dim)" style={{ marginBottom: '20px' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>The docket is currently clear. Submit a case to begin.</p>
                  </div>
                ) : (
                  cases.map(c => (
                    <CaseCard key={c.id} item={c} isActive={selectedCase?.id === c.id} onClick={() => setSelectedCase(c)} />
                  ))
                )}
              </motion.div>
            </LayoutGroup>
          </section>

          <AnimatePresence>
            {selectedCase && (
              <motion.section
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="detail-panel"
                style={{ flex: 1, position: 'sticky', top: '120px', height: 'calc(100vh - 160px)', borderRadius: '2px', padding: '0', overflowY: 'auto', border: 'none' }}
              >
                <div style={{ position: 'relative', height: '100%' }}>
                  <button onClick={() => setSelectedCase(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', color: '#000', borderRadius: '50%', padding: '8px', zIndex: 100 }}>
                    <X size={24} />
                  </button>
                  <CaseDetail item={selectedCase} user={user} showToast={showToast} onRefresh={() => { fetchContent(true); }} />
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {modalType && (
          <Modal type={modalType} cats={cats} user={user} onClose={() => setModalType(null)} onSuccess={() => { setModalType(null); fetchContent(); }} showToast={showToast} />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── CaseCard ── */
const CaseCard = ({ item, isActive, onClick }) => {
  const total = item.total_votes || 0;
  const guilty = total ? Math.round((item.votes_guilty / total) * 100) : 0;
  const esh = total ? Math.round((item.votes_esh / total) * 100) : 0;
  const fine = total ? Math.round((item.votes_not_guilty / total) * 100) : 0;

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className={`case-card glass ${isActive ? 'active-case' : ''}`}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.8rem', fontWeight: 800 }}>
        <span style={{ color: 'var(--text-dim)' }}>FILE #{item.id}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {item.user_has_voted && (
            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> VERDICT SECURED
            </span>
          )}
          <span style={{ color: 'var(--accent)', letterSpacing: '1px' }}>{item.category?.name?.toUpperCase()}</span>
        </div>
      </header>

      <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', lineHeight: 1.3 }}>{item.title_hook}</h3>

      {total > 0 && (
        <div className="card-vote-bar">
          <div className="vote-bar-track">
            <div className="vote-bar-guilty" style={{ width: `${guilty}%` }} />
            <div className="vote-bar-esh" style={{ width: `${esh}%` }} />
            <div className="vote-bar-not-guilty" style={{ width: `${fine}%` }} />
          </div>
          <div className="vote-stats-row">
            <span className="vs guilty">
              <ThumbsUp size={12} /> {guilty}% ({item.votes_guilty})
            </span>
            <span className="vs esh">
              <MessageCircle size={12} /> {esh}% ({item.votes_esh})
            </span>
            <span className="vs not-guilty">
              <ThumbsDown size={12} /> {fine}% ({item.votes_not_guilty})
            </span>
            <span className="vs total">· {total} verdicts</span>
          </div>
        </div>
      )}

      <footer style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={14} color="var(--accent)" />
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.author_name}</span>
        <ChevronRight size={16} color="var(--text-dim)" style={{ marginLeft: 'auto' }} />
      </footer>
    </motion.div>
  );
};

/* ── CaseDetail ── */
const CaseDetail = ({ item, user, showToast, onRefresh }) => {
  const [optimisticVoted, setOptimisticVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Once the backend confirms the vote, drop the optimistic flag.
  // Also drop it whenever we switch to a different case.
  useEffect(() => {
    setOptimisticVoted(false);
  }, [item.id]);

  const hasActuallyVoted = optimisticVoted || item.user_has_voted;

  const handleVote = async (decision) => {
    setLoading(true);
    try {
      await axios.post(`${API}/votes/`, { case: item.id, decision });
      setOptimisticVoted(true);   // ← changed from setLocalVoted(true)
      showToast('Verdict recorded in blockchain.');
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Transmission error.', 'error');
    }
    setLoading(false);
  };

  const total = item.total_votes || 0;

  return (
    <div className="paper-card" style={{ padding: '48px', minHeight: '100%', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <span className="case-tag">{item.category?.name || 'PUBLIC DOCKET'}</span>
        <span className="case-id">ARCHIVE REF: #{item.id}</span>
      </div>

      <h1 style={{ fontSize: '3.5rem', marginBottom: '32px', color: '#1a1a1a', lineHeight: 1 }}>{item.title_hook}</h1>

      <div style={{ padding: '32px 0', borderTop: '1px solid rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: '48px' }}>
        <p className="full-story" style={{ color: '#222', fontSize: '1.25rem' }}>{item.full_story}</p>
      </div>

      <div className="verdict-section">
        {hasActuallyVoted ? (
          <div style={{ padding: '40px', background: 'rgba(0,0,0,0.03)', border: '2px dashed rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '16px', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', color: '#1a1a1a' }}>VERDICT SEALED</h3>
            <p style={{ color: '#444', fontSize: '1rem' }}>Your contribution to digital justice has been recorded. Thank you for your service, juror.</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#1a1a1a', textTransform: 'uppercase' }}>
              <Scale size={24} /> Submit Final Verdict
            </h3>
            <div className="vote-btn-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <button className="btn btn-glass" onClick={() => handleVote('guilty')} style={{ background: '#1a1a1a', color: '#fff', padding: '20px' }}>GUILTY</button>
              <button className="btn btn-glass" onClick={() => handleVote('esh')} style={{ background: '#444', color: '#fff', padding: '20px' }}>NEUTRAL</button>
              <button className="btn btn-glass" onClick={() => handleVote('not_guilty')} style={{ background: '#888', color: '#fff', padding: '20px' }}>NOT GUILTY</button>
            </div>
          </>
        )}

        <div style={{ marginTop: '60px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1a1a1a' }}>LIVE ADJUDICATION DATA</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444' }}>{total} TOTAL VERDICTS</span>
          </header>

          <div className="vote-bar-track">
            <div className="vote-bar-guilty" style={{ width: total > 0 ? `${Math.round((item.votes_guilty / total) * 100)}%` : '0%', background: '#b91c1c' }} />
            <div className="vote-bar-esh" style={{ width: total > 0 ? `${Math.round((item.votes_esh / total) * 100)}%` : '0%', background: '#a16207' }} />
            <div className="vote-bar-not-guilty" style={{ width: total > 0 ? `${Math.round((item.votes_not_guilty / total) * 100)}%` : '0%', background: '#15803d' }} />
          </div>

          <div className="vote-stats-row" style={{ color: '#1a1a1a' }}>
            <span>GUILTY {total > 0 ? Math.round((item.votes_guilty / total) * 100) : 0}%</span>
            <span>NEUTRAL {total > 0 ? Math.round((item.votes_esh / total) * 100) : 0}%</span>
            <span>NOT GUILTY {total > 0 ? Math.round((item.votes_not_guilty / total) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      <CommentSection 
        caseId={item.id} 
        comments={item.comments} 
        showToast={showToast} 
        onRefresh={onRefresh} 
      />
    </div>
  );
};

/* ── CommentSection ── */
const CommentSection = ({ caseId, comments, showToast, onRefresh }) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/comments/`, { case: caseId, content });
      setContent('');
      showToast('Comment appended to casefile.');
      onRefresh();
    } catch (err) {
      showToast('Failed to post comment.', 'error');
    }
    setSubmitting(false);
  };

  return (
    <div className="comment-section" style={{ marginTop: '80px', paddingTop: '60px', borderTop: '2px solid rgba(0,0,0,0.1)' }}>
      <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '32px', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <MessageCircle size={28} /> Juror Deliberations
      </h3>

      <div style={{ display: 'grid', gap: '24px', marginBottom: '60px' }}>
        {(!comments || comments.length === 0) ? (
          <div style={{ padding: '40px', background: 'rgba(0,0,0,0.02)', border: '1px dashed rgba(0,0,0,0.1)', textAlign: 'center', color: '#666' }}>
             No deliberations yet. Be the first to provide testimony.
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="comment-bubble">
              <div className="comment-metadata">
                <span className="juror-name">FILE JUROR: {c.author_name?.toUpperCase() || 'ANONYMOUS'}</span>
                <span className="comment-date">{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="comment-content">{c.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <label style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1a1a1a', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Lodge Your Testimony</label>
        <textarea
          className="form-input"
          placeholder="Enter your observations and rationale..."
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={submitting}
          rows={4}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: '16px', width: '100%', padding: '20px', fontSize: '1.1rem' }}
          disabled={submitting || !content.trim()}
        >
          {submitting ? 'APPENDING...' : 'APPEND TESTIMONY TO RECORD'}
        </button>
      </form>
    </div>
  );
};


/* ── Modal ── */
const Modal = ({ type, cats, user, onClose, onSuccess, showToast, item }) => {
  const [form, setForm] = useState({
    hook: item?.title_hook || '',
    story: item?.full_story || '',
    category: item?.category?.name || item?.name || '',
    author_name: item?.author_name || '',
    status: item?.status || 'open',
    slug: item?.slug || '',
    feedback_type: 'other',
    message: '',
    email: ''
  });
  const [anon, setAnon] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'submit') {
        const cat = cats.find(c => c.name === form.category) || cats[0];
        await axios.post(`${API}/cases/`, {
          category_id: cat?.id,
          title_hook: form.hook,
          full_story: form.story,
          author_name: anon ? '' : (form.author_name || user?.username || '')
        });
        showToast('Case submitted to public record.');
      } else if (type === 'edit-case') {
        await axios.patch(`${API}/cases/${item.id}/`, {
          title_hook: form.hook,
          full_story: form.story,
          status: form.status
        });
        showToast('Case record updated.');
      } else if (type === 'create-domain') {
        await axios.post(`${API}/categories/`, {
          name: form.category,
          slug: form.slug
        });
        showToast('New domain established.');
      } else if (type === 'edit-domain') {
        await axios.patch(`${API}/categories/${item.id}/`, {
          name: form.category,
          slug: form.slug
        });
        showToast('Domain protocol revised.');
      } else {
        await axios.post(`${API}/feedback/`, {
          feedback_type: form.feedback_type,
          message: form.message,
          email: form.email
        });
        showToast('Feedback received.');
      }
      onSuccess();
    } catch { showToast('Submission error.', 'error'); }
    setLoading(false);
  };

  return (
    <motion.div {...fadeIn} className="modal-backdrop" onClick={onClose}>
      <motion.div {...slideUp} className="glass modal-content" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">
          <X size={24} />
        </button>

        <h2 className="font-serif" style={{ fontSize: '2.4rem', marginBottom: '32px' }}>
          {type === 'submit' ? 'Submit Dispute' : type === 'edit-case' ? 'Edit Dossier' : type === 'create-domain' ? 'Establish Domain' : type === 'edit-domain' ? 'Revise Domain' : 'Feedback Center'}
        </h2>

        <form onSubmit={handleSubmit}>
          {type.includes('domain') ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="field-group">
                <label>Domain Identity</label>
                <input
                  className="form-input"
                  placeholder="e.g. Workplace"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>
              <div className="field-group">
                <label>System Slug</label>
                <input
                  className="form-input"
                  placeholder="e.g. workplace-politics"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                />
              </div>
            </div>
          ) : type === 'submit' || type === 'edit-case' ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              {type === 'submit' && (
                <div className="anon-toggle-wrap">
                  <label className="anon-toggle">
                    <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} />
                    <span className="slider" />
                  </label>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Submit as Anonymous</span>
                </div>
              )}

              {type === 'edit-case' && (
                <div className="field-group">
                  <label>Operational Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} required>
                    <option value="open">Open for Judging</option>
                    <option value="closed">Verdict Reached</option>
                  </select>
                </div>
              )}

              {type === 'submit' && !anon && (
                <div className="field-group">
                  <label>Display Name</label>
                  <input id="case-author" className="form-input" placeholder={user?.username} value={form.author_name} onChange={e => setForm({ ...form, author_name: e.target.value })} />
                </div>
              )}

              {type === 'submit' && (
                <div className="field-group">
                  <label>Category</label>
                  <select id="case-cat" className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                    <option value="">Select Domain...</option>
                    {cats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="field-group">
                <label>Attention Hook</label>
                <input id="case-hook" className="form-input" placeholder="e.g. AITA for refusing to pay for my friend's dinner?" value={form.hook} onChange={e => setForm({ ...form, hook: e.target.value })} required />
              </div>

              <div className="field-group">
                <label>The Full Story</label>
                <textarea id="case-story" className="form-input" rows={6} placeholder="Provide all context and testimony..." value={form.story} onChange={e => setForm({ ...form, story: e.target.value })} required />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="field-group">
                <label>Feedback Category</label>
                <select id="fb-type" className="form-input" value={form.feedback_type} onChange={e => setForm({ ...form, feedback_type: e.target.value })} required>
                  <option value="bug">Report Malfunction</option>
                  <option value="feature">Enhancement Request</option>
                  <option value="other">General Protocol</option>
                </select>
              </div>
              <div className="field-group">
                <label>Communication</label>
                <textarea id="fb-msg" className="form-input" rows={5} placeholder="Your message to the developers..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </div>
              <div className="field-group">
                <label>Contact Endpoint (Optional)</label>
                <input id="fb-email" className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
          )}

          <button id="modal-submit" type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '32px', padding: '16px' }}>
            {loading ? 'Transmitting...' : (type === 'submit' ? 'Lodge Dispute' : type.includes('edit') ? 'Update Record' : type === 'create-domain' ? 'Establish Domain' : 'Send Feedback')}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   HISTORY PAGE
   ═══════════════════════════════════════════════════════════ */
const HistoryPage = ({ user, onBack, showToast }) => {
  const [filter, setFilter] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const [cRes, vRes] = await Promise.all([
          axios.get(`${API}/cases/?author_id=${user.id}`),
          axios.get(`${API}/votes/?user_id=${user.id}`)
        ]);

        const cases = (Array.isArray(cRes.data) ? cRes.data : cRes.data.results || []).map(c => ({ ...c, type: 'case' }));
        const votes = (Array.isArray(vRes.data) ? vRes.data : vRes.data.results || []).map(v => ({ ...v, type: 'vote' }));

        setRecords([...cases, ...votes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (err) { showToast("Protocol failed to retrieve history.", "error"); }
      setLoading(false);
    };
    fetchHistory();
  }, [user.id, showToast]);

  const filtered = records.filter(r => filter === 'all' || r.type === (filter === 'cases' ? 'case' : 'vote'));

  return (
    <motion.div {...fadeIn} className="layout-container" style={{ background: 'var(--bg-paper)', color: '#000', minHeight: '100vh' }}>
      <nav className="top-nav" style={{ background: 'rgba(0,0,0,0.05)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="nav-logo" onClick={onBack} style={{ cursor: 'pointer' }}>
          <ArrowLeft size={24} color="#000" />
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '2px', color: '#000', marginLeft: '12px' }}>ARCHIVAL RECORDS</span>
        </div>
        <div className="nav-actions">
          <div className="nav-user-chip" style={{ color: '#000', borderColor: 'rgba(0,0,0,0.2)' }}>
            <UserCheck size={18} /> <span>{user.username.toUpperCase()}</span>
          </div>
        </div>
      </nav>

      <main className="main-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 24px' }}>
        <header style={{ marginBottom: '48px', borderBottom: '4px solid #000', paddingBottom: '24px' }}>
          <h1 className="font-serif" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '16px' }}>Personal Logs</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['all', 'cases', 'votes'].map(f => (
              <button
                key={f}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-glass'}`}
                onClick={() => setFilter(f)}
                style={filter !== f ? { color: '#000', border: '1px solid #000' } : {}}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <p>Accessing archive...</p>
        ) : filtered.length === 0 ? (
          <p style={{ opacity: 0.5 }}>No records found in this cycle.</p>
        ) : (
          <div style={{ display: 'grid', gap: '32px' }}>
            {filtered.map(r => (
              <div key={r.type + r.id} className="glass" style={{ padding: '32px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, background: r.type === 'case' ? 'var(--accent)' : 'var(--ink-black)', color: r.type === 'case' ? '#000' : '#fff', padding: '4px 12px', borderRadius: '4px' }}>
                    {r.type.toUpperCase()}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {r.type === 'vote' && (
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, background: '#fff', color: '#000', padding: '4px 10px', borderRadius: '4px', border: '1px solid #000', boxShadow: '2px 2px 0 #000' }}>
                        YOUR VERDICT: {r.decision.toUpperCase().replace('_', ' ')}
                      </span>
                    )}
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '12px', lineHeight: 1.2 }}>
                  {r.type === 'case' ? r.title_hook : r.case_details?.title_hook}
                </h3>

                <p style={{ opacity: 0.8, fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  {r.type === 'case' ? r.full_story : r.case_details?.full_story}
                </p>

                {/* CURRENT SCORE SITUATION */}
                <div style={{ background: 'rgba(0,0,0,0.05)', padding: '20px', borderRadius: '12px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {(r.type === 'case' ? r : r.case_details) && (
                    <>
                      <div style={{ minWidth: '120px' }}>
                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Public Verdict</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                          {Math.round(((r.type === 'case' ? r.votes_guilty : r.case_details.votes_guilty) / (r.type === 'case' ? r.total_votes : r.case_details.total_votes) || 0) * 100)}% GUILTY
                        </span>
                      </div>
                      <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)' }} className="hide-mobile" />
                      <div style={{ minWidth: '120px' }}>
                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Censure Intensity</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                          {Math.round(((r.type === 'case' ? r.votes_not_guilty : r.case_details.votes_not_guilty) / (r.type === 'case' ? r.total_votes : r.case_details.total_votes) || 0) * 100)}% INNOCENT
                        </span>
                      </div>
                      <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)' }} className="hide-mobile" />
                      <div style={{ minWidth: '120px' }}>
                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Total Jurors</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>{r.type === 'case' ? r.total_votes : r.case_details.total_votes} RECORDED</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default App;
