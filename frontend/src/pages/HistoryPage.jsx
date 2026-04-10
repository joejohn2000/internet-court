import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios, { API } from '../lib/api';
import { fadeIn } from '../lib/animations';

const HistoryPage = ({ showToast }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
        <div className="nav-logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
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

export default HistoryPage;
