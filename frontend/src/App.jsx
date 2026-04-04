import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Gavel, Menu, X, ThumbsUp, ThumbsDown,
  MessageCircle, CheckCircle2, AlertCircle,
  Shield, Users, BarChart2, LogOut, PlusCircle,
  UserCheck, Eye, EyeOff, Flame, Scale, Hash,
  ChevronRight, ArrowLeft, Send, Sparkles,
  ExternalLink, User, UserPlus
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
axios.defaults.withCredentials = true;

// Attach user identity to every request
axios.interceptors.request.use((config) => {
  try {
    const u = JSON.parse(sessionStorage.getItem('ic_user') || 'null');
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

  useEffect(() => {
    if (user) setPage(user.is_admin ? 'admin' : 'home');
  }, []);

  return (
    <div className="layout-container">
      <div className="bg-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <AnimatePresence mode="wait">
        {page === 'landing' && (
          <Landing key="landing" onGoLogin={() => setPage('login')} onGoAdmin={() => setPage('admin-login')} />
        )}
        {page === 'login' && (
          <LoginPage key="login" onLogin={handleAuthSuccess} onGoRegister={() => setPage('register')} onBack={() => setPage('landing')} showToast={showToast} />
        )}
        {page === 'register' && (
          <RegisterPage key="register" onRegister={handleAuthSuccess} onGoLogin={() => setPage('login')} onBack={() => setPage('landing')} showToast={showToast} />
        )}
        {page === 'admin-login' && (
          <AdminLoginPage key="admin-login" onLogin={handleAuthSuccess} onBack={() => setPage('landing')} showToast={showToast} />
        )}
        {page === 'home' && (
          <HomePage key="home" user={user} onLogout={handleLogout} showToast={showToast} />
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
const Landing = ({ onGoLogin, onGoAdmin }) => (
  <motion.div
    {...fadeIn}
    className="auth-page"
    style={{ flexDirection: 'column', textAlign: 'center' }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ...spring, delay: 0.1 }}
      className="hero-icon-glow"
      style={{
        width: '120px', height: '120px', borderRadius: '40px',
        background: 'var(--grad-linear)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: '40px', boxShadow: '0 0 60px var(--accent-glow)'
      }}
    >
      <Gavel size={56} color="white" />
    </motion.div>

    <motion.h1
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="font-serif"
      style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '16px', lineHeight: 1 }}
    >
      Internet <span className="grad-text">Court</span>
    </motion.h1>

    <motion.p
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 48px' }}
    >
      Where the masses settle the score.<br />Submit your conflict. Face the verdict.
    </motion.p>

    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}
    >
      <button id="landing-login" className="btn btn-primary" onClick={onGoLogin} style={{ padding: '18px 40px', fontSize: '1.2rem' }}>
        <UserCheck size={24} /> Enter as Juror
      </button>
      <button id="landing-admin" className="btn btn-glass" onClick={onGoAdmin} style={{ padding: '18px 40px', fontSize: '1rem' }}>
        <Shield size={20} /> Staff Login
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
      <div className="auth-card glass">
        <button className="btn btn-glass" onClick={onBack} style={{ position: 'absolute', top: '24px', right: '24px', padding: '10px' }}>
          <X size={20} />
        </button>

        <div className="auth-icon-wrap">
          {icon}
        </div>
        <h2 className="auth-title grad-text">{title}</h2>
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
    title="Sign In"
    sub="Join the digital jury"
    icon={<User size={32} color="var(--accent)" />}
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
    title="Register"
    sub="Enlist in the world's first open court"
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

const AdminLoginPage = props => (
  <AuthPageBase
    idPrefix="admin-login"
    title="Admin Access"
    sub="Command center authorization"
    icon={<Shield size={32} color="var(--secondary)" />}
    submitText="Authorize Entry"
    endpoint="admin-login"
    onAuth={props.onLogin}
    {...props}
  />
);

/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════ */
const AdminDashboard = ({ user, onLogout, showToast }) => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbacks, setFeedbacks] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ new_username: '', new_password: '', new_email: '', admin_password: '' });
  const [creating, setCreating] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showAuthPw, setShowAuthPw] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, fRes] = await Promise.all([
          axios.get(`${API}/users/admin-stats/`),
          axios.get(`${API}/feedback/`)
        ]);
        setStats(sRes.data);
        setFeedbacks(Array.isArray(fRes.data) ? fRes.data : fRes.data.results || []);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [activeTab]);

  const handleCreateAdmin = async (e) => {
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
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar glass">
        <div className="admin-sidebar-logo grad-text">
          <Gavel size={28} />
          <span>ADMIN COURT</span>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <BarChart2 size={20} /> <span>Analytics</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'create-admin' ? 'active' : ''}`} onClick={() => setActiveTab('create-admin')}>
            <PlusCircle size={20} /> <span>Operators</span>
          </button>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
          <div className="nav-user-chip" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border-subtle)', color: 'white', marginBottom: '20px' }}>
            <Shield size={14} color="var(--secondary)" /> <span>{user?.username}</span>
          </div>
          <button id="admin-logout" className="admin-nav-item" onClick={onLogout} style={{ width: '100%', color: 'var(--danger)' }}>
            <LogOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="font-serif" style={{ fontSize: '2.5rem' }}>
            {activeTab === 'overview' ? 'System Overview' : 'Personnel Management'}
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
          ) : (
            <motion.div key="create" {...fadeIn} style={{ maxWidth: '600px' }}>
              <div className="glass" style={{ padding: '48px', borderRadius: 'var(--radius-lg)' }}>
                <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '32px' }}>Enroll Agent</h2>
                <form onSubmit={handleCreateAdmin}>
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
const HomePage = ({ user, onLogout, showToast }) => {
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
        <div className="nav-logo grad-text font-serif">
          <Gavel size={32} /> INTERNET COURT
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="nav-user-chip">
            <UserCheck size={14} /> <span>{user?.username}</span>
          </div>
          <button id="nav-case" className="btn btn-primary" onClick={() => setModalType('submit')}>
            <PlusCircle size={18} /> Submit Case
          </button>
          <button id="nav-feedback" className="btn btn-glass" onClick={() => setModalType('feedback')}>
            Feedback
          </button>
          <button id="nav-logout" className="btn btn-glass" onClick={onLogout} style={{ padding: '10px' }}>
            <LogOut size={20} color="var(--danger)" />
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="feed-layout">
          <section className={`feed-list-section ${selectedCase ? 'with-detail' : ''}`}>
            <header className="feed-header">
              <h2 className="feed-title grad-text">Public Docket</h2>
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
                className="detail-panel glass"
                style={{ flex: 1, position: 'sticky', top: '120px', height: 'calc(100vh - 160px)', borderRadius: '24px', padding: '40px', overflowY: 'auto' }}
              >
                <button onClick={() => setSelectedCase(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
                  <X size={24} />
                </button>
                <CaseDetail item={selectedCase} showToast={showToast} onRefresh={() => { fetchContent(true); }} />
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
const CaseDetail = ({ item, showToast, onRefresh }) => {
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
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '12px' }}>
        <Sparkles size={14} /> {item.category?.name}
      </div>
      <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '24px', lineHeight: 1.1 }}>{item.title_hook}</h1>

      <div className="glass-bright" style={{ padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{item.full_story}</p>
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '32px' }}>
        {hasActuallyVoted ? (
          <div className="glass-bright" style={{ padding: '32px', borderRadius: '16px', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '16px', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>VERDICT SECURED</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>Your contribution to digital justice has been logged. Thank you for your service, juror.</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Gavel color="var(--accent)" /> CAST YOUR VERDICT
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <button className="btn btn-glass" onClick={() => handleVote('guilty')} style={{ flexDirection: 'column', padding: '24px', height: '120px', border: '1px solid var(--danger)' }}>
                <ThumbsUp size={32} color="var(--danger)" />
                <span style={{ marginTop: '8px', fontWeight: 700 }}>GUILTY</span>
              </button>
              <button className="btn btn-glass" onClick={() => handleVote('esh')} style={{ flexDirection: 'column', padding: '24px', height: '120px', border: '1px solid var(--warning)' }}>
                <MessageCircle size={32} color="var(--warning)" />
                <span style={{ marginTop: '8px', fontWeight: 700 }}>ESH</span>
              </button>
              <button className="btn btn-glass" onClick={() => handleVote('not_guilty')} style={{ flexDirection: 'column', padding: '24px', height: '120px', border: '1px solid var(--success)' }}>
                <ThumbsDown size={32} color="var(--success)" />
                <span style={{ marginTop: '8px', fontWeight: 700 }}>NOT GUILTY</span>
              </button>
            </div>
          </>
        )}

        <div style={{ marginTop: '40px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '12px' }}>
            LIVE ADJUDICATION STATS {total === 0 && '(Awaiting First Verdict)'}
          </p>
          <div className="vote-bar-track" style={{ height: '12px' }}>
            <div className="vote-bar-guilty" style={{ width: total > 0 ? `${Math.round((item.votes_guilty / total) * 100)}%` : '0%' }} />
            <div className="vote-bar-esh" style={{ width: total > 0 ? `${Math.round((item.votes_esh / total) * 100)}%` : '0%' }} />
            <div className="vote-bar-not-guilty" style={{ width: total > 0 ? `${Math.round((item.votes_not_guilty / total) * 100)}%` : '0%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
              {total > 0 ? Math.round((item.votes_guilty / total) * 100) : 0}% Guilty ({item.votes_guilty})
            </span>
            <span style={{ color: 'var(--warning)', fontWeight: 700 }}>
              {total > 0 ? Math.round((item.votes_esh / total) * 100) : 0}% ESH ({item.votes_esh})
            </span>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>
              {total > 0 ? Math.round((item.votes_not_guilty / total) * 100) : 0}% Not Guilty ({item.votes_not_guilty})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Modal ── */
const Modal = ({ type, cats, user, onClose, onSuccess, showToast }) => {
  const [form, setForm] = useState({ hook: '', story: '', category: '', author_name: '', feedback_type: 'other', message: '', email: '' });
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
    <motion.div {...fadeIn} className="modal-backdrop" onClick={onClose} style={{ zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
      <motion.div {...slideUp} className="glass" style={{ width: '100%', maxWidth: '600px', padding: '48px', borderRadius: '24px', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 className="font-serif" style={{ fontSize: '2.4rem', marginBottom: '32px' }}>{type === 'submit' ? 'Submit Dispute' : 'Feedback Center'}</h2>

        <form onSubmit={handleSubmit}>
          {type === 'submit' ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="anon-toggle-wrap">
                <label className="anon-toggle">
                  <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} />
                  <span className="slider" />
                </label>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Submit as Anonymous</span>
              </div>

              {!anon && (
                <div className="field-group">
                  <label>Display Name</label>
                  <input id="case-author" className="form-input" placeholder={user?.username} value={form.author_name} onChange={e => setForm({ ...form, author_name: e.target.value })} />
                </div>
              )}

              <div className="field-group">
                <label>Category</label>
                <select id="case-cat" className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select Domain...</option>
                  {cats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

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
            {loading ? 'Transmitting...' : (type === 'submit' ? 'Lodge Dispute' : 'Send Feedback')}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default App;
