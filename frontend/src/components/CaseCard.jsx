import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  User
} from 'lucide-react';

const CaseCard = ({ item, isActive, onClick, cardRef }) => {
  const MotionButton = motion.button;
  const total = item.total_votes || 0;
  const guilty = total ? Math.round((item.votes_guilty / total) * 100) : 0;
  const esh = total ? Math.round((item.votes_esh / total) * 100) : 0;
  const notGuilty = total ? Math.round((item.votes_not_guilty / total) * 100) : 0;

  const legend = [
    { label: 'Guilty', percent: guilty, color: 'bg-rose-600', dot: 'bg-rose-500' },
    { label: 'Neutral', percent: esh, color: 'bg-amber-600', dot: 'bg-amber-500' },
    { label: 'Not guilty', percent: notGuilty, color: 'bg-emerald-600', dot: 'bg-emerald-500' },
  ];

  return (
    <MotionButton
      layout
      whileHover={{ y: -3 }}
      ref={cardRef}
      type="button"
      onClick={onClick}
      className={`w-full rounded-md border p-4 text-left shadow-[0_16px_36px_rgba(0,0,0,0.22)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-court-accent/80 focus-visible:ring-offset-2 focus-visible:ring-offset-court-ink sm:p-5 ${isActive
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
        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
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

      <div className="mt-4 space-y-2">
        {/* Segmented bar */}
        <div className="flex h-2 w-full overflow-hidden rounded-full">
          {total > 0 ? (
            legend.map(({ label, percent, color }) =>
              percent > 0 ? (
                <div
                  key={label}
                  className={`${color} h-full`}
                  style={{ width: `${percent}%` }}
                />
              ) : null
            )
          ) : (
            <>
              <div className="h-full w-1/2 bg-slate-600/50" />
              <div className="h-full w-1/2 bg-slate-700/50" />
            </>
          )}
        </div>

        {/* Legend + vote count */}
        <div className="flex items-center justify-between">
          {total > 0 ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {legend.map(({ label, percent, dot }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <span className={`inline-block h-2 w-2 rounded-sm ${dot}`} />
                  {label}
                  <span className="text-slate-500">{percent}%</span>
                </span>
              ))}
            </div>
          ) : (
            <div className="flex gap-x-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                <span className="inline-block h-2 w-2 rounded-sm bg-slate-600/50" />
                Guilty
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                <span className="inline-block h-2 w-2 rounded-sm bg-slate-700/50" />
                Not guilty
              </span>
            </div>
          )}
          <span className="text-xs text-slate-500">{total > 0 ? `${total} votes` : 'No votes yet'}</span>
        </div>
      </div>

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