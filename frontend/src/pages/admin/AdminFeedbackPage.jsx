import React, { useEffect, useState } from 'react';
import { Mail, MessageCircle } from 'lucide-react';

import axios, { API } from '../../lib/api';

const getList = (data) => (Array.isArray(data) ? data : data?.results || []);

const typeLabels = {
  bug: 'Bug report',
  feature: 'Feature request',
  other: 'General note'
};

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  return new Date(value).toLocaleString();
};

const AdminFeedbackPage = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchFeedback = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API}/feedback/`);
        if (active) setFeedback(getList(res.data));
      } catch {
        if (active) setError('Feedback could not be loaded right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchFeedback();
    return () => { active = false; };
  }, []);

  return (
    <div className="admin-page-stack">
      <section className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Inbox</p>
            <h2 className="font-serif">User feedback</h2>
          </div>
          <p>{feedback.length} {feedback.length === 1 ? 'message' : 'messages'}</p>
        </div>

        {loading && <div className="admin-empty-state">Loading feedback...</div>}
        {error && <div className="admin-empty-state error">{error}</div>}

        {!loading && !error && (
          <div className="admin-feedback-grid">
            {feedback.length === 0 && (
              <div className="admin-empty-state">No feedback has arrived yet.</div>
            )}
            {feedback.map(item => (
              <article className="admin-feedback-card" key={item.id}>
                <div className="admin-feedback-header">
                  <span className="admin-badge">{typeLabels[item.feedback_type] || item.feedback_type}</span>
                  <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                </div>
                <p>{item.message}</p>
                {item.email && (
                  <a href={`mailto:${item.email}`} className="admin-email-link">
                    <Mail size={14} />
                    {item.email}
                  </a>
                )}
                {!item.email && (
                  <span className="admin-email-link muted">
                    <MessageCircle size={14} />
                    No contact email
                  </span>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminFeedbackPage;
