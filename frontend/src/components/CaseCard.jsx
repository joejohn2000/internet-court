import React from 'react';
import { motion } from 'framer-motion';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  User
} from 'lucide-react';

const CaseCard = ({ item, isActive, onClick }) => {
  const MotionButton = motion.button;
  const total = item.total_votes || 0;
  const guilty = total ? Math.round((item.votes_guilty / total) * 100) : 0;
  const esh = total ? Math.round((item.votes_esh / total) * 100) : 0;
  const notGuilty = total ? Math.round((item.votes_not_guilty / total) * 100) : 0;

  const stats = [
    {
      key: 'guilty',
      icon: ThumbsUp,
      label: 'Guilty',
      count: item.votes_guilty,
      percent: guilty,
      tone: 'text-rose-300'
    },
    {
      key: 'neutral',
      icon: MessageCircle,
      label: 'Neutral',
      count: item.votes_esh,
      percent: esh,
      tone: 'text-amber-200'
    },
    {
      key: 'not-guilty',
      icon: ThumbsDown,
      label: 'Not guilty',
      count: item.votes_not_guilty,
      percent: notGuilty,
      tone: 'text-emerald-300'
    }
  ];

  return (
    <MotionButton
      layout
      whileHover={{ y: -3 }}
      type="button"
      onClick={onClick}
      className={`w-full rounded-md border p-4 text-left shadow-[0_16px_36px_rgba(0,0,0,0.22)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-court-accent/80 focus-visible:ring-offset-2 focus-visible:ring-offset-court-ink sm:p-5 ${
        isActive
          ? 'border-amber-300/60 bg-amber-300/10'
          : 'border-white/10 bg-white/5 hover:border-white/18 hover:bg-white/[0.07]'
      }`}
    >
      <header className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">File #{item.id}</p>
          <h2 className="mt-2 font-serif text-xl leading-tight text-white sm:text-2xl">
            {item.title_hook}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {item.user_has_voted && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-emerald-300">
              <CheckCircle2 size={12} />
              Verdict secured
            </span>
          )}
          <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-amber-100">
            {item.category?.name || 'General'}
          </span>
        </div>
      </header>

      {total > 0 && (
        <div className="mt-4 space-y-3">
          <div className="vote-track-dark">
            <div className="bg-rose-600" style={{ width: `${guilty}%` }} />
            <div className="bg-amber-600" style={{ width: `${esh}%` }} />
            <div className="bg-emerald-600" style={{ width: `${notGuilty}%` }} />
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs font-semibold text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ key, icon: Icon, label, count, percent, tone }) => (
              <span key={key} className={`inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 ${tone}`}>
                {React.createElement(Icon, { size: 14 })}
                <span className="text-slate-100">{label}</span>
                <span className="text-slate-400">{percent}% ({count})</span>
              </span>
            ))}
            <span className="inline-flex items-center rounded-md bg-white/5 px-3 py-2 text-slate-300">
              {total} verdicts
            </span>
          </div>
        </div>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/8 pt-4 text-sm text-slate-300">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-400/10 text-amber-200">
          <User size={15} />
        </span>
        <span className="min-w-0 flex-1 truncate">{item.author_name || 'Anonymous'}</span>
        <ChevronRight size={18} className="text-slate-500" />
      </footer>
    </MotionButton>
  );
};

export default CaseCard;
