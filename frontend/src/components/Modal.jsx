import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import axios, { API } from '../lib/api';
import { fadeIn, slideUp } from '../lib/animations';

const Modal = ({ type, cats, user, onClose, onSuccess, showToast, item }) => {
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
    } catch { showToast('Submission error.', 'error'); }
    setLoading(false);
  };

  return (
    <motion.div {...fadeIn} className="modal-backdrop" onClick={onClose}>
      <motion.div {...slideUp} className="glass modal-content" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">
          <X size={24} />
        </button>

        <h2 className="font-serif" style={{ fontSize: '2.4rem', marginBottom: '32px' }}>
          {type === 'submit' ? 'Submit Dispute' : type === 'edit-case' ? 'Edit Dossier' : type === 'create-domain' ? 'Establish Domain' : type === 'edit-domain' ? 'Revise Domain' : 'Feedback Center'}
        </h2>

        <form onSubmit={handleSubmit}>
          {type.includes('domain') ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="field-group">
                <label>Domain Identity</label>
                <input
                  className="form-input"
                  placeholder="e.g. Workplace"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>
              <div className="field-group">
                <label>System Slug</label>
                <input
                  className="form-input"
                  placeholder="e.g. workplace-politics"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                />
              </div>
            </div>
          ) : type === 'submit' || type === 'edit-case' ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              {type === 'submit' && (
                <div className="anon-toggle-wrap">
                  <label className="anon-toggle">
                    <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} />
                    <span className="slider" />
                  </label>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Submit as Anonymous</span>
                </div>
              )}

              {type === 'edit-case' && (
                <div className="field-group">
                  <label>Operational Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} required>
                    <option value="open">Open for Judging</option>
                    <option value="closed">Verdict Reached</option>
                  </select>
                </div>
              )}

              {type === 'submit' && !anon && (
                <div className="field-group">
                  <label>Display Name</label>
                  <input id="case-author" className="form-input" placeholder={user?.username} value={form.author_name} onChange={e => setForm({ ...form, author_name: e.target.value })} />
                </div>
              )}

              {type === 'submit' && (
                <div className="field-group">
                  <label>Category</label>
                  <select id="case-cat" className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                    <option value="">Select Domain...</option>
                    {cats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              )}

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
            {loading ? 'Transmitting...' : (type === 'submit' ? 'Lodge Dispute' : type.includes('edit') ? 'Update Record' : type === 'create-domain' ? 'Establish Domain' : 'Send Feedback')}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Modal;
