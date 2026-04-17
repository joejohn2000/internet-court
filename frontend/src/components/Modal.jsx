import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

import axios, { API } from '../lib/api';
import { fadeIn, slideUp } from '../lib/animations';

const titles = {
  submit: 'Submit dispute',
  'edit-case': 'Edit dossier',
  'create-domain': 'Establish domain',
  'edit-domain': 'Revise domain',
  feedback: 'Feedback center'
};

const submitLabels = {
  submit: 'Lodge dispute',
  'edit-case': 'Update record',
  'create-domain': 'Establish domain',
  'edit-domain': 'Update record',
  feedback: 'Send feedback'
};

const Modal = ({ type, cats = [], user, onClose, onSuccess, showToast, item }) => {
  const MotionDiv = motion.div;
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
    } catch {
      showToast('Submission error.', 'error');
    }
    setLoading(false);
  };

  return (
    <MotionDiv
      {...fadeIn}
      className="fixed inset-0 z-50 flex items-end bg-black/80 p-4 backdrop-blur sm:items-center sm:p-6"
      onClick={onClose}
    >
      <MotionDiv
        {...slideUp}
        role="dialog"
        aria-modal="true"
        className="panel-dark relative max-h-[min(100vh-2rem,48rem)] w-full overflow-y-auto p-5 sm:mx-auto sm:max-w-2xl sm:p-8"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="icon-button absolute right-4 top-4 h-10 w-10" aria-label="Close modal">
          <X size={18} />
        </button>

        <h2 className="pr-12 font-serif text-3xl text-white sm:text-4xl">{titles[type] || 'Modal'}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          {type === 'feedback'
            ? 'Share a bug, request, or note without losing your place.'
            : 'Use the form below and submit when everything looks right.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          {type.includes('domain') ? (
            <>
              <div>
                <label className="field-label" htmlFor="domain-name">Domain identity</label>
                <input
                  id="domain-name"
                  className="dark-input"
                  placeholder="e.g. Workplace"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="domain-slug">System slug</label>
                <input
                  id="domain-slug"
                  className="dark-input"
                  placeholder="e.g. workplace-politics"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                />
              </div>
            </>
          ) : type === 'submit' || type === 'edit-case' ? (
            <>
              {type === 'submit' && (
                <label className="flex items-start gap-3 rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={anon}
                    onChange={e => setAnon(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20"
                  />
                  <span>
                    <span className="block font-semibold text-white">Submit anonymously</span>
                    <span className="mt-1 block text-slate-400">
                      Hide your display name from the docket while preserving the submission.
                    </span>
                  </span>
                </label>
              )}

              {type === 'edit-case' && (
                <div>
                  <label className="field-label" htmlFor="case-status">Operational status</label>
                  <select
                    id="case-status"
                    className="dark-select"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    required
                  >
                    <option value="open">Open for judging</option>
                    <option value="closed">Verdict reached</option>
                  </select>
                </div>
              )}

              {type === 'submit' && !anon && (
                <div>
                  <label className="field-label" htmlFor="case-author">Display name</label>
                  <input
                    id="case-author"
                    className="dark-input"
                    placeholder={user?.username}
                    value={form.author_name}
                    onChange={e => setForm({ ...form, author_name: e.target.value })}
                  />
                </div>
              )}

              {type === 'submit' && (
                <div>
                  <label className="field-label" htmlFor="case-cat">Category</label>
                  <select
                    id="case-cat"
                    className="dark-select"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    required
                  >
                    <option value="">Select domain...</option>
                    {cats.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="field-label" htmlFor="case-hook">Attention hook</label>
                <input
                  id="case-hook"
                  className="dark-input"
                  placeholder="e.g. AITA for refusing to pay for my friend's dinner?"
                  value={form.hook}
                  onChange={e => setForm({ ...form, hook: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="field-label" htmlFor="case-story">The full story</label>
                <textarea
                  id="case-story"
                  className="dark-textarea"
                  rows={6}
                  placeholder="Provide all context and testimony..."
                  value={form.story}
                  onChange={e => setForm({ ...form, story: e.target.value })}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="field-label" htmlFor="fb-type">Feedback category</label>
                <select
                  id="fb-type"
                  className="dark-select"
                  value={form.feedback_type}
                  onChange={e => setForm({ ...form, feedback_type: e.target.value })}
                  required
                >
                  <option value="bug">Report malfunction</option>
                  <option value="feature">Enhancement request</option>
                  <option value="other">General protocol</option>
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="fb-msg">Communication</label>
                <textarea
                  id="fb-msg"
                  className="dark-textarea"
                  rows={5}
                  placeholder="Your message to the developers..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="field-label" htmlFor="fb-email">Contact endpoint (optional)</label>
                <input
                  id="fb-email"
                  className="dark-input"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </>
          )}

          <button id="modal-submit" type="submit" className="btn-primary mt-1 w-full" disabled={loading}>
            {loading ? 'Transmitting...' : submitLabels[type]}
          </button>
        </form>
      </MotionDiv>
    </MotionDiv>
  );
};

export default Modal;
