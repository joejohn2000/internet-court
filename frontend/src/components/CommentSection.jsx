import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import axios, { API } from '../lib/api';

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
          style={{ minHeight: '120px' }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: '20px', width: '100%', minHeight: '56px', fontSize: '1.1rem' }}
          disabled={submitting || !content.trim()}
        >
          {submitting ? 'APPENDING...' : 'APPEND TESTIMONY TO RECORD'}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
