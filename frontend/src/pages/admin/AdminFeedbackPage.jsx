import React, { useEffect, useState } from 'react';
import { Mail, MessageCircle } from 'lucide-react';

import axios, { API } from '../../lib/api';

const getList = (data) => (Array.isArray(data) ? data : data?.results || []);
const panelClasses = 'rounded-md border border-white/10 bg-black/72 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.24)] sm:p-6';

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
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid gap-5 sm:gap-6">
      <section className={panelClasses}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Inbox</p>
            <h2 className="mt-2 font-serif text-2xl text-white">User feedback</h2>
          </div>
          <p className="text-sm text-slate-400">{feedback.length} {feedback.length === 1 ? 'message' : 'messages'}</p>
        </div>

        {loading && <div className="mt-5 rounded-md border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">Loading feedback...</div>}
        {error && <div className="mt-5 rounded-md border border-rose-400/20 bg-rose-500/10 px-4 py-6 text-sm text-rose-200">{error}</div>}

        {!loading && !error && (
          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {feedback.length === 0 && (
              <div className="rounded-md border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
                No feedback has arrived yet.
              </div>
            )}
            {feedback.map(item => (
              <article className="rounded-md border border-white/10 bg-white/5 p-4" key={item.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <span className="status-badge border-white/12 bg-white/6 text-slate-200">
                    {typeLabels[item.feedback_type] || item.feedback_type}
                  </span>
                  <time dateTime={item.created_at} className="text-sm text-slate-400">
                    {formatDate(item.created_at)}
                  </time>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-100 sm:text-base">{item.message}</p>
                {item.email ? (
                  <a href={`mailto:${item.email}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-300 hover:text-teal-200">
                    <Mail size={14} />
                    {item.email}
                  </a>
                ) : (
                  <span className="mt-4 inline-flex items-center gap-2 text-sm text-slate-400">
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
