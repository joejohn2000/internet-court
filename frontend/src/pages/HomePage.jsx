import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Menu, X, MessageCircle, Shield,
  LogOut, PlusCircle, UserCheck, History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios, { API } from '../lib/api';
import CaseCard from '../components/CaseCard';
import CaseDetail from '../components/CaseDetail';
import Modal from '../components/Modal';

const HomePage = ({ showToast }) => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [cats, setCats] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchContent = useCallback(async (syncSelection = false) => {
    try {
      const [cs, ct] = await Promise.all([
        axios.get(`${API}/cases/`),
        axios.get(`${API}/categories/`)
      ]);
      const newCases = Array.isArray(cs.data) ? cs.data : cs.data.results || [];
      setCases(newCases);
      setCats(Array.isArray(ct.data) ? ct.data : ct.data.results || []);

      if (syncSelection) {
        setSelectedCase(prev => {
          if (!prev) return null;
          return newCases.find(c => c.id === prev.id) || prev;
        });
      }
    } catch (err) { /* silent fail for user UX */ }
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

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`nav-actions ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {user && (
            <button id="nav-case" className="btn btn-primary" onClick={() => { setModalType('submit'); setMobileMenuOpen(false); }}>
              <PlusCircle size={24} /> <span>SUBMIT DOCKET</span>
            </button>
          )}
          {!user?.is_guest && (
            <button id="nav-history" className="btn btn-glass icon-btn" onClick={() => { navigate('/history'); setMobileMenuOpen(false); }} title="View My Records">
              <History size={24} /> <span className="mobile-text">View Records</span>
            </button>
          )}

          <button id="nav-feedback" className="btn btn-glass icon-btn" onClick={() => { setModalType('feedback'); setMobileMenuOpen(false); }} title="Send Feedback">
            <MessageCircle size={24} /> <span className="mobile-text">Send Feedback</span>
          </button>
          <div className="nav-user-chip" style={user?.is_guest ? { borderStyle: 'dashed', opacity: 0.8 } : {}}>
            {user?.is_guest ? <Shield size={18} /> : <UserCheck size={18} />}
            <span>{user?.username?.toUpperCase()}</span>
          </div>
          <button id="nav-logout" className="btn btn-glass icon-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} title="Log Out">
            <LogOut size={24} color="var(--danger)" /> <span className="mobile-text">Log Out</span>
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
                style={{ flex: 1, alignSelf: 'flex-start', borderRadius: '2px', padding: '0', overflow: 'visible', border: 'none' }}
              >
                <div style={{ position: 'relative' }}>
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

export default HomePage;
