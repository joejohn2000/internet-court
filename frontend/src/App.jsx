import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gavel, Menu, Hash, X, ThumbsUp, ThumbsDown,
  MessageCircle, CheckCircle2, AlertCircle
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

/* ═══════════════════════════════════════════
   ROOT APP
   ═══════════════════════════════════════════ */
const App = () => {
  const [cases, setCases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [modal, setModal] = useState(null);        // 'submit' | 'feedback' | null
  const [view, setView] = useState('hero');          // 'hero' | 'feed'
  const [sidebar, setSidebar] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [c, k] = await Promise.all([
        axios.get(`${API}/cases/`),
        axios.get(`${API}/categories/`)
      ]);
      setCases(Array.isArray(c.data) ? c.data : c.data.results || []);
      setCategories(Array.isArray(k.data) ? k.data : k.data.results || []);
    } catch (e) {
      console.error('API fetch failed:', e);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="layout-container">
      {/* BG */}
      <div className="bg-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      {/* TOP NAV */}
      <nav className="top-nav">
        <div className="nav-left">
          {view === 'feed' && (
            <>
              <button className="nav-icon-btn glass-morphism" onClick={() => setSidebar(s => !s)}>
                <Menu color="#fff" size={20} />
              </button>
              <button className="nav-icon-btn glass-morphism" onClick={() => setSidebar(s => !s)}>
                <Hash color="#fff" size={20} />
              </button>
            </>
          )}
          <span className="nav-logo">Internet Court</span>
        </div>
        <div className="nav-right">
          <button className="glow-btn" onClick={() => setModal('feedback')} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            Feedback
          </button>
          <button className="glow-btn" onClick={() => setModal('submit')} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            Submit a Case
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {view === 'hero' ? (
            <Hero key="hero" onStart={() => setView('feed')} onSubmit={() => setModal('submit')} />
          ) : (
            <Feed
              key="feed"
              cases={cases}
              activeCase={activeCase}
              onSelect={setActiveCase}
              onClose={() => setActiveCase(null)}
              showToast={showToast}
            />
          )}
        </AnimatePresence>
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {modal && (
          <Modal
            type={modal}
            cats={categories}
            onClose={() => setModal(null)}
            onSuccess={(msg) => { setModal(null); showToast(msg); fetchAll(); }}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebar(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 109 }}
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glass-morphism"
              style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: 300, zIndex: 110, padding: '100px 30px 30px' }}
            >
              <button onClick={() => setSidebar(false)}
                style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', cursor: 'pointer' }}>
                <X color="#fff" />
              </button>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 24 }}>Categories</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {categories.map(cat => (
                  <div key={cat.id} className="category-item" style={{ color: '#94a3b8', cursor: 'pointer' }}>
                    # {cat.name}
                  </div>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="toast glass-morphism"
            style={{ borderColor: toast.type === 'success' ? '#10b981' : '#f43f5e' }}
          >
            {toast.type === 'success' ? <CheckCircle2 color="#10b981" size={20} /> : <AlertCircle color="#f43f5e" size={20} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ═══════════════════════════════════════════
   HERO PAGE
   ═══════════════════════════════════════════ */
const Hero = ({ onStart, onSubmit }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="hero-section"
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px 24px', borderRadius: 40, marginBottom: 28, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}
    >
      <Gavel size={18} /> Case #2414 Registered
    </motion.div>
    <h1 className="hero-title">Internet Court</h1>
    <p className="hero-subtitle">Real conflict. Real people.<br />The internet decides who's wrong.</p>
    <div style={{ display: 'flex', gap: 16 }}>
      <button className="glow-btn" onClick={onStart}>Start Judging</button>
      <button className="glass-morphism" onClick={onSubmit}
        style={{ border: 'none', color: '#f8f9fa', padding: '14px 28px', borderRadius: 12, cursor: 'pointer', fontFamily: 'Outfit', fontSize: '1rem' }}>
        Submit a Case
      </button>
    </div>
  </motion.div>
);


/* ═══════════════════════════════════════════
   FEED VIEW
   ═══════════════════════════════════════════ */
const Feed = ({ cases, activeCase, onSelect, onClose, showToast }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="feed-layout"
  >
    {/* Left Column: Case Cards */}
    <motion.div
      layout
      className="feed-list"
      style={{ width: activeCase ? '40%' : '100%', minWidth: activeCase ? 320 : undefined }}
    >
      {cases.map(c => (
        <CaseCard key={c.id} item={c} onClick={() => onSelect(c)} isActive={activeCase?.id === c.id} />
      ))}
      {cases.length === 0 && (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>
          No cases yet. Be the first to submit one!
        </div>
      )}
    </motion.div>

    {/* Right Column: Detail Panel */}
    <AnimatePresence>
      {activeCase && (
        <motion.div
          key={activeCase.id}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="detail-panel glass-morphism"
          style={{ flex: 1 }}
        >
          <button onClick={onClose}
            style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}>
            <X color="#94a3b8" size={20} />
          </button>
          <CaseDetail item={activeCase} showToast={showToast} />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);


/* ═══════════════════════════════════════════
   CASE CARD
   ═══════════════════════════════════════════ */
const CaseCard = ({ item, onClick, isActive }) => (
  <motion.div
    whileHover={{ y: -3 }}
    onClick={onClick}
    className={`case-card glass-morphism ${isActive ? 'active-case' : ''}`}
  >
    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
      <span>Case #{item.id}</span>
      <span style={{ color: '#818cf8' }}>{item.category?.name}</span>
    </div>
    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.4 }}>{item.title_hook}</h3>
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <span style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 12px', borderRadius: 6, color: '#94a3b8' }}>
        {item.author_name}
      </span>
    </div>
  </motion.div>
);


/* ═══════════════════════════════════════════
   CASE DETAIL + VOTING
   ═══════════════════════════════════════════ */
const CaseDetail = ({ item, showToast }) => {
  const [voted, setVoted] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVote = async (decision) => {
    if (voted) return;
    setLoading(true);
    try {
      await axios.post(`${API}/votes/`, { case: item.id, decision });
      setVoted(decision);
      showToast(`Vote recorded: ${decision.replace('_', ' ')}`);
    } catch (e) {
      showToast('Vote failed. Try again.', 'error');
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ color: '#818cf8', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1 }}>
        {item.category?.name}
      </div>
      <h1 style={{ fontSize: '2.2rem', marginBottom: 20, lineHeight: 1.2 }}>{item.title_hook}</h1>

      {item.ai_suggested_hook && (
        <div style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', marginBottom: 24, fontSize: '0.85rem', color: '#c084fc' }}>
          ✨ AI Hook: {item.ai_suggested_hook}
        </div>
      )}

      <p style={{ color: '#cbd5e1', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: 40 }}>
        {item.full_story}
      </p>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32 }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Cast your verdict</h2>
        <p style={{ color: '#64748b', marginBottom: 20 }}>
          {voted ? 'Your vote has been recorded.' : 'Select one option below.'}
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { key: 'guilty', label: 'Guilty', icon: <ThumbsUp size={22} />, color: '#f43f5e' },
            { key: 'not_guilty', label: 'Not Guilty', icon: <ThumbsDown size={22} />, color: '#10b981' },
            { key: 'esh', label: 'ESH', icon: <MessageCircle size={22} />, color: '#f59e0b' },
          ].map(v => (
            <motion.button
              key={v.key}
              whileTap={!voted ? { scale: 0.95 } : {}}
              onClick={() => handleVote(v.key)}
              disabled={loading || !!voted}
              className={`vote-btn ${voted === v.key ? 'voted' : ''}`}
              style={{
                borderColor: voted === v.key ? v.color : 'rgba(255,255,255,0.1)',
                opacity: voted && voted !== v.key ? 0.35 : 1,
              }}
            >
              <div style={{ color: v.color }}>{v.icon}</div>
              <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{v.label}</div>
            </motion.button>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: '16px 20px', borderRadius: 14, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#818cf8', fontSize: '0.9rem' }}>
            <Gavel size={16} /> Verdict timer active
          </p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 6 }}>
            Vote statistics unlock 12 hours after the case is filed.
          </p>
        </div>
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════
   MODALS (Submit Case + Feedback)
   ═══════════════════════════════════════════ */
const Modal = ({ type, cats, onClose, onSuccess }) => {
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (type === 'submit') {
        const catObj = cats.find(c => c.name === form.category) || cats[0];
        await axios.post(`${API}/cases/`, {
          category_id: catObj?.id,
          title_hook: form.hook || '',
          full_story: form.story || '',
        });
        setConfirm(true);
      } else {
        await axios.post(`${API}/feedback/`, {
          feedback_type: form.feedbackType || 'other',
          message: form.message || '',
          email: form.email || null,
        });
        setConfirm(true);
      }
    } catch (e) {
      console.error(e);
      alert('Submission failed. Check console for details.');
    }
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="modal-content glass-morphism"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}>
          <X color="#94a3b8" size={20} />
        </button>

        <AnimatePresence mode="wait">
          {confirm ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '20px 0' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 200 }}
              >
                <CheckCircle2 color="#10b981" size={56} />
              </motion.div>
              <h2 style={{ marginTop: 20, fontSize: '1.6rem' }}>
                {type === 'submit' ? 'Case Submitted!' : 'Thanks for the Feedback!'}
              </h2>
              <p style={{ color: '#94a3b8', marginTop: 10 }}>
                {type === 'submit'
                  ? 'Your case is now live. Jury voting has begun — a judge leaves a verdict in 12 hours.'
                  : 'Your feedback has been recorded. We appreciate you helping improve Internet Court.'}
              </p>
              {type === 'submit' && (
                <button className="glow-btn" onClick={() => { onSuccess('Case submitted successfully!'); }} style={{ marginTop: 24 }}>
                  Judge a Case
                </button>
              )}
              {type === 'feedback' && (
                <button className="glow-btn" onClick={() => { onSuccess('Feedback sent. Thank you!'); }} style={{ marginTop: 24 }}>
                  Close
                </button>
              )}
            </motion.div>
          ) : type === 'submit' ? (
            <motion.div key="submit-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.8rem' }}>Submit a Case</h2>
              <p style={{ color: '#94a3b8', marginTop: 6, marginBottom: 24 }}>State your story. The internet will judge.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 8 }}>Category</label>
                  <select
                    className="form-input"
                    value={form.category || ''}
                    onChange={e => set('category', e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <option value="" disabled>Pick a category…</option>
                    {cats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 8 }}>Hook (Attention Title)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. AITA for eating my roommate's food?"
                    value={form.hook || ''}
                    onChange={e => set('hook', e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 8 }}>Full Story</label>
                  <textarea
                    className="form-input"
                    rows={5}
                    placeholder="Tell us the full story…"
                    value={form.story || ''}
                    onChange={e => set('story', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button className="glow-btn" onClick={handleSubmit} disabled={submitting || !form.hook || !form.story}>
                  {submitting ? 'Submitting…' : 'Submit Case'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="feedback-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.8rem' }}>Give your Feedback</h2>
              <p style={{ color: '#94a3b8', marginTop: 6, marginBottom: 24 }}>Help us improve Internet Court.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 8 }}>Type</label>
                  <select
                    className="form-input"
                    value={form.feedbackType || ''}
                    onChange={e => set('feedbackType', e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <option value="" disabled>Select type…</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 8 }}>Your Message</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Tell us what's on your mind…"
                    value={form.message || ''}
                    onChange={e => set('message', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 8 }}>Email (optional)</label>
                  <input
                    className="form-input"
                    placeholder="Only if you want a reply"
                    value={form.email || ''}
                    onChange={e => set('email', e.target.value)}
                  />
                </div>
                <button className="glow-btn" onClick={handleSubmit} disabled={submitting || !form.message}>
                  {submitting ? 'Sending…' : 'Submit Feedback'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default App;
