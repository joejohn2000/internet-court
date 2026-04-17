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
    } catch {
      showToast('Failed to post comment.', 'error');
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-8 border-t border-slate-900/10 pt-8 sm:mt-10 sm:pt-10">
      <div className="flex items-center gap-3">
        <MessageCircle size={24} className="text-slate-800" />
        <h2 className="font-serif text-2xl text-slate-900">Juror Deliberations</h2>
      </div>

      <div className="mt-5 grid gap-4">
        {!comments || comments.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-900/12 bg-slate-900/[0.03] px-4 py-6 text-center text-sm leading-6 text-slate-600 sm:px-6">
            No deliberations yet. Be the first to provide testimony.
          </div>
        ) : (
          comments.map(c => (
            <article
              key={c.id}
              className="rounded-md border border-slate-900/10 bg-white/75 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-5"
            >
              <div className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-court-accent">
                  File juror: {c.author_name?.toUpperCase() || 'ANONYMOUS'}
                </span>
                <span>{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">{c.content}</p>
            </article>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
        <label className="field-label" htmlFor="case-comment-message">Lodge your testimony</label>
        <textarea
          id="case-comment-message"
          className="text-area-field min-h-32"
          placeholder="Enter your observations and rationale..."
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={submitting}
        />
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={submitting || !content.trim()}
        >
          <Send size={18} />
          {submitting ? 'Appending...' : 'Append testimony to record'}
        </button>
      </form>
    </section>
  );
};

export default CommentSection;
