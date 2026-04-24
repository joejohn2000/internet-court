import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, EyeOff, Globe2, X } from 'lucide-react';

import axios, { API } from '../lib/api';
import { fadeIn, slideUp } from '../lib/animations';

const titles = {
  submit: 'File a New Case',
  'edit-case': 'Edit dossier',
  'create-domain': 'Establish domain',
  'edit-domain': 'Revise domain',
  feedback: 'Feedback center'
};

const submitLabels = {
  submit: 'Publish case',
  'edit-case': 'Update record',
  'create-domain': 'Establish domain',
  'edit-domain': 'Update record',
  feedback: 'Send feedback'
};

const submitSteps = [
  { id: 'category', label: 'Category' },
  { id: 'hook', label: 'Hook' },
  { id: 'story', label: 'Story' },
  { id: 'context', label: 'Context' },
  { id: 'review', label: 'Review' },
];

const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const formatHashtag = (category) => `#${(category?.slug || category?.name || 'General').replace(/[^a-zA-Z0-9]/g, '')}`;

const Modal = ({ type, cats = [], user, onClose, onSuccess, showToast, item }) => {
  const MotionDiv = motion.div;
  const isSubmitFlow = type === 'submit';
  const canPostAsSignedInUser = Boolean(user && !user.is_guest);
  const canChooseVisibility = canPostAsSignedInUser;
  const [submitStep, setSubmitStep] = useState(0);
  const [form, setForm] = useState({
    hook: item?.title_hook || '',
    story: item?.full_story || '',
    category: item?.category?.slug || item?.slug || '',
    status: item?.status || 'open',
    slug: item?.slug || '',
    feedback_type: 'other',
    message: '',
    email: '',
    self_perspective: item?.self_perspective || '',
    other_perspective: item?.other_perspective || '',
    why_right: item?.why_right || '',
    extra_context: item?.extra_context || '',
    is_public: item?.is_public ?? true,
  });
  const [anon, setAnon] = useState(false);
  const [loading, setLoading] = useState(false);
  const storyWordCount = countWords(form.story);
  const currentStep = submitSteps[submitStep];

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitStepReady = (() => {
    if (!isSubmitFlow) return true;

    switch (submitStep) {
      case 0:
        return Boolean(form.category);
      case 1:
        return form.hook.trim().length >= 10;
      case 2:
        return storyWordCount >= 100 && storyWordCount <= 1000;
      default:
        return true;
    }
  })();

  const moveStep = (direction) => {
    setSubmitStep((current) => Math.min(Math.max(current + direction, 0), submitSteps.length - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'submit') {
        const selectedCategory = cats.find((category) => category.slug === form.category || category.name === form.category) || cats[0];
        const payload = {
          category_id: selectedCategory?.id,
          title_hook: form.hook.trim(),
          full_story: form.story.trim(),
          self_perspective: form.self_perspective.trim(),
          other_perspective: form.other_perspective.trim(),
          why_right: form.why_right.trim(),
          extra_context: form.extra_context.trim(),
          guest_alias: user?.is_guest ? user.username : '',
          is_public: canChooseVisibility ? form.is_public : true,
          post_anonymously: canPostAsSignedInUser ? anon : true,
        };

        await axios.post(`${API}/cases/`, payload);
        showToast(payload.is_public ? 'Case published to Internet Court.' : 'Private case saved to your archive.');
      } else if (type === 'edit-case') {
        await axios.patch(`${API}/cases/${item.id}/`, {
          title_hook: form.hook.trim(),
          full_story: form.story.trim(),
          self_perspective: form.self_perspective.trim(),
          other_perspective: form.other_perspective.trim(),
          why_right: form.why_right.trim(),
          extra_context: form.extra_context.trim(),
          is_public: form.is_public,
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
    } catch (error) {
      showToast(error.response?.data?.error || 'Submission error.', 'error');
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
        className="panel-dark relative max-h-[min(100vh-2rem,52rem)] w-full overflow-y-auto p-5 sm:mx-auto sm:max-w-3xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button onClick={onClose} className="icon-button absolute right-4 top-4 h-10 w-10" aria-label="Close modal">
          <X size={18} />
        </button>

        <h2 className="pr-12 font-serif text-3xl text-white sm:text-4xl">{titles[type] || 'Modal'}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          {isSubmitFlow
            ? 'Guide the story step by step so the feed reads clearly and the verdict has enough context.'
            : type === 'feedback'
              ? 'Share a bug, request, or note without losing your place.'
              : 'Use the form below and submit when everything looks right.'}
        </p>

        {isSubmitFlow && (
          <div className="mt-6 grid gap-3 sm:grid-cols-5">
            {submitSteps.map((step, index) => (
              <div
                key={step.id}
                className={`rounded-md border px-3 py-3 text-left ${
                  index === submitStep
                    ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
                    : index < submitStep
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                      : 'border-white/8 bg-white/[0.03] text-slate-400'
                }`}
              >
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em]">Step {index + 1}</p>
                <p className="mt-1 text-sm font-semibold">{step.label}</p>
              </div>
            ))}
          </div>
        )}

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
                  onChange={(e) => updateForm('category', e.target.value)}
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
                  onChange={(e) => updateForm('slug', e.target.value)}
                />
              </div>
            </>
          ) : type === 'edit-case' ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="case-status">Operational status</label>
                  <select
                    id="case-status"
                    className="dark-select"
                    value={form.status}
                    onChange={(e) => updateForm('status', e.target.value)}
                    required
                  >
                    <option value="open">Open for judging</option>
                    <option value="closed">Verdict reached</option>
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="case-visibility">Visibility</label>
                  <select
                    id="case-visibility"
                    className="dark-select"
                    value={form.is_public ? 'public' : 'private'}
                    onChange={(e) => updateForm('is_public', e.target.value === 'public')}
                  >
                    <option value="public">Public archive</option>
                    <option value="private">Private archive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="case-hook">Attention hook</label>
                <input
                  id="case-hook"
                  className="dark-input"
                  value={form.hook}
                  onChange={(e) => updateForm('hook', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="field-label" htmlFor="case-story">The full story</label>
                <textarea
                  id="case-story"
                  className="dark-textarea"
                  rows={8}
                  value={form.story}
                  onChange={(e) => updateForm('story', e.target.value)}
                  required
                />
              </div>
            </>
          ) : isSubmitFlow ? (
            <>
              {submitStep === 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {cats.map((category) => {
                    const isActive = form.category === category.slug;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => updateForm('category', category.slug)}
                        className={`rounded-md border p-4 text-left transition ${
                          isActive
                            ? 'border-amber-400/24 bg-amber-400/10'
                            : 'border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]'
                        }`}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">{formatHashtag(category)}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{category.name}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          Route this case into the right part of the archive so readers know what kind of conflict they are judging.
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {submitStep === 1 && (
                <div className="grid gap-4">
                  <div>
                    <label className="field-label" htmlFor="case-hook">Case hook</label>
                    <input
                      id="case-hook"
                      className="dark-input"
                      placeholder='e.g. "I charged my roommate late fees after she kept missing rent."'
                      value={form.hook}
                      onChange={(e) => updateForm('hook', e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-md border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300">
                    Make the hook specific and readable. It should tell people what happened without making them read the whole story first.
                  </div>
                </div>
              )}

              {submitStep === 2 && (
                <div className="grid gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="field-label" htmlFor="case-story">Full story</label>
                      <span className={`text-xs font-bold uppercase tracking-[0.12em] ${storyWordCount >= 100 && storyWordCount <= 1000 ? 'text-emerald-300' : 'text-amber-200'}`}>
                        {storyWordCount} / 1000 words
                      </span>
                    </div>
                    <textarea
                      id="case-story"
                      className="dark-textarea"
                      rows={10}
                      placeholder="Lay out the facts, timeline, and conflict clearly."
                      value={form.story}
                      onChange={(e) => updateForm('story', e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-md border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300">
                    The blueprint calls for a guided story. Aim for enough detail that strangers can judge the situation without guessing at missing facts.
                  </div>
                </div>
              )}

              {submitStep === 3 && (
                <div className="grid gap-4">
                  <div>
                    <label className="field-label" htmlFor="self-perspective">What did you do in the situation?</label>
                    <textarea
                      id="self-perspective"
                      className="dark-textarea"
                      rows={4}
                      placeholder="Optional, but useful when your actions need extra context."
                      value={form.self_perspective}
                      onChange={(e) => updateForm('self_perspective', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="other-perspective">What does the other person think?</label>
                    <textarea
                      id="other-perspective"
                      className="dark-textarea"
                      rows={4}
                      value={form.other_perspective}
                      onChange={(e) => updateForm('other_perspective', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="why-right">Why do you believe you were right?</label>
                    <textarea
                      id="why-right"
                      className="dark-textarea"
                      rows={4}
                      value={form.why_right}
                      onChange={(e) => updateForm('why_right', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="extra-context">Any extra context we should know?</label>
                    <textarea
                      id="extra-context"
                      className="dark-textarea"
                      rows={4}
                      value={form.extra_context}
                      onChange={(e) => updateForm('extra_context', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {submitStep === 4 && (
                <div className="grid gap-4">
                  <div className="rounded-md border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">Review</p>
                    <h3 className="mt-2 font-serif text-2xl text-white">{form.hook}</h3>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      <span>{formatHashtag(cats.find((category) => category.slug === form.category))}</span>
                      <span>{storyWordCount} words</span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{form.story}</p>
                  </div>

                  {canPostAsSignedInUser && (
                    <label className="flex items-start gap-3 rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={anon}
                        onChange={(e) => setAnon(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-white/20"
                      />
                      <span>
                        <span className="block font-semibold text-white">Publish anonymously</span>
                        <span className="mt-1 block text-slate-400">
                          Keep the case public while hiding your permanent identity from the feed.
                        </span>
                      </span>
                    </label>
                  )}

                  {canChooseVisibility ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => updateForm('is_public', true)}
                        className={`rounded-md border p-4 text-left transition ${form.is_public ? 'border-emerald-400/24 bg-emerald-400/10' : 'border-white/8 bg-white/[0.03]'}`}
                      >
                        <div className="inline-flex items-center gap-2 text-emerald-300">
                          <Globe2 size={16} />
                          <span className="text-sm font-bold uppercase tracking-[0.12em]">Publish to Internet Court</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">Your case enters the public feed immediately and starts its debate window.</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateForm('is_public', false)}
                        className={`rounded-md border p-4 text-left transition ${!form.is_public ? 'border-amber-400/24 bg-amber-400/10' : 'border-white/8 bg-white/[0.03]'}`}
                      >
                        <div className="inline-flex items-center gap-2 text-amber-200">
                          <EyeOff size={16} />
                          <span className="text-sm font-bold uppercase tracking-[0.12em]">Keep private</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">Save it to your archive without sending it into the public feed yet.</p>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                      Temporary identities publish directly to the public feed. Claim your identity if you want private drafts and a persistent archive.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="field-label" htmlFor="fb-type">Feedback category</label>
                <select
                  id="fb-type"
                  className="dark-select"
                  value={form.feedback_type}
                  onChange={(e) => updateForm('feedback_type', e.target.value)}
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
                  onChange={(e) => updateForm('message', e.target.value)}
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
                  onChange={(e) => updateForm('email', e.target.value)}
                />
              </div>
            </>
          )}

          {isSubmitFlow ? (
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={() => (submitStep === 0 ? onClose() : moveStep(-1))}
              >
                <ArrowLeft size={18} />
                {submitStep === 0 ? 'Cancel' : 'Back'}
              </button>

              {submitStep < submitSteps.length - 1 ? (
                <button
                  type="button"
                  className="btn-primary w-full sm:w-auto"
                  disabled={!submitStepReady}
                  onClick={() => moveStep(1)}
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button id="modal-submit" type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
                  {loading ? 'Transmitting...' : submitLabels[type]}
                </button>
              )}
            </div>
          ) : (
            <button id="modal-submit" type="submit" className="btn-primary mt-1 w-full" disabled={loading}>
              {loading ? 'Transmitting...' : submitLabels[type]}
            </button>
          )}

          {isSubmitFlow && !submitStepReady && currentStep?.id === 'story' && (
            <p className="text-sm text-amber-200">The story step needs between 100 and 1000 words before you can continue.</p>
          )}
        </form>
      </MotionDiv>
    </MotionDiv>
  );
};

export default Modal;
