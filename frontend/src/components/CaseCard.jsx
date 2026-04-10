import React from 'react';
import { motion } from 'framer-motion';
import {
  ThumbsUp, ThumbsDown, MessageCircle, CheckCircle2,
  ChevronRight, User
} from 'lucide-react';

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

export default CaseCard;
