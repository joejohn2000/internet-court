import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Scale, Lock, Bot } from 'lucide-react';

import axios, { API } from '../lib/api';
import CommentSection from './CommentSection';

const CaseDetail = ({ item, showToast, onRefresh }) => {
  const [optimisticVoted, setOptimisticVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [judgeAnalysis, setJudgeAnalysis] = useState(item.judge_analysis || null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);

  const triggerJudgeAnalysis = useCallback(async () => {
    setAnalysisLoading(true);
    setAnalysisFailed(false);
    try {
      const res = await axios.post(`${API}/cases/${item.id}/generate_judge_analysis/`);
      setJudgeAnalysis(res.data.judge_analysis);
      showToast('Judge opinion formulated.');
    } catch {
      setAnalysisFailed(true);
    }
    setAnalysisLoading(false);
  }, [item.id, showToast]);

  useEffect(() => {
    if (!item.created_at) return;
    const createdAt = new Date(item.created_at).getTime();
    const unlockTime = createdAt + 60 * 1000;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((unlockTime - now) / 1000));
      setTimeRemaining(remaining);
      return remaining;
    };

    let interval;
    let triggerTimer;
    if (tick() > 0) {
      interval = setInterval(() => {
        const remaining = tick();
        if (remaining === 0) {
          clearInterval(interval);
          if (!judgeAnalysis && !analysisLoading && !analysisFailed) {
            triggerTimer = window.setTimeout(() => {
              triggerJudgeAnalysis();
            }, 0);
          }
        }
      }, 1000);
    } else if (!judgeAnalysis && !analysisLoading && !analysisFailed) {
      triggerTimer = window.setTimeout(() => {
        triggerJudgeAnalysis();
      }, 0);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (triggerTimer) window.clearTimeout(triggerTimer);
    };
  }, [item.created_at, judgeAnalysis, analysisLoading, analysisFailed, triggerJudgeAnalysis]);

  const hasActuallyVoted = optimisticVoted || item.user_has_voted;

  const handleVote = async (decision) => {
    setLoading(true);
    try {
      await axios.post(`${API}/votes/`, { case: item.id, decision });
      setOptimisticVoted(true);
      showToast('Verdict recorded in blockchain.');
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Transmission error.', 'error');
    }
    setLoading(false);
  };

  const total = item.total_votes || 0;
  const voteData = [
    {
      label: 'Guilty',
      key: 'guilty',
      votes: item.votes_guilty,
      percent: total > 0 ? Math.round((item.votes_guilty / total) * 100) : 0,
      barClass: 'bg-rose-600'
    },
    {
      label: 'Neutral',
      key: 'neutral',
      votes: item.votes_esh,
      percent: total > 0 ? Math.round((item.votes_esh / total) * 100) : 0,
      barClass: 'bg-amber-600'
    },
    {
      label: 'Not guilty',
      key: 'not-guilty',
      votes: item.votes_not_guilty,
      percent: total > 0 ? Math.round((item.votes_not_guilty / total) * 100) : 0,
      barClass: 'bg-emerald-600'
    }
  ];

  return (
    <article className="panel-paper overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 border-b border-slate-900/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="chip-paper">{item.category?.name || 'Public docket'}</span>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Archive ref #{item.id}
        </span>
      </div>

      <header className="mt-5">
        <h1 className="font-serif text-3xl leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
          {item.title_hook}
        </h1>
      </header>

      <section className="mt-6 border-y border-slate-900/10 py-5">
        <p className="text-base leading-8 text-slate-800 sm:text-lg">{item.full_story}</p>
      </section>

      <section className="mt-6 rounded-md border border-slate-900/10 bg-white/55 p-4 sm:p-6">
        {hasActuallyVoted ? (
          <div className="rounded-md border border-dashed border-emerald-600/20 bg-emerald-600/5 px-4 py-6 text-center sm:px-6">
            <CheckCircle2 size={42} className="mx-auto text-court-success" />
            <h2 className="mt-4 text-xl font-bold uppercase tracking-[0.12em] text-slate-900">
              Verdict sealed
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Your contribution to digital justice has been recorded. Thank you for your service, juror.
            </p>
          </div>
        ) : (
          <>
            <h2 className="flex items-center gap-3 text-lg font-bold uppercase tracking-[0.12em] text-slate-900">
              <Scale size={20} />
              Submit final verdict
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                className="btn-paper w-full"
                onClick={() => handleVote('guilty')}
                disabled={loading}
              >
                Guilty
              </button>
              <button
                className="btn-paper w-full"
                onClick={() => handleVote('esh')}
                disabled={loading}
              >
                Neutral
              </button>
              <button
                className="btn-paper w-full"
                onClick={() => handleVote('not_guilty')}
                disabled={loading}
              >
                Not guilty
              </button>
            </div>
          </>
        )}

        <div className="mt-6 space-y-4 border-t border-slate-900/10 pt-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Live adjudication data
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Current verdict split</h3>
            </div>
            <span className="text-sm font-semibold text-slate-600">{total} total verdicts</span>
          </header>

          <div className="vote-track">
            {voteData.map(({ key, percent, barClass }) => (
              <div key={key} className={barClass} style={{ width: `${percent}%` }} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {voteData.map(({ key, label, votes, percent }) => (
              <div key={key} className="rounded-md border border-slate-900/8 bg-white/70 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{percent}%</p>
                <p className="text-sm text-slate-600">{votes} votes</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-md border border-slate-900/10 bg-slate-900/[0.035] p-4 sm:p-6">
        <h2 className="flex items-center gap-3 text-lg font-bold uppercase tracking-[0.12em] text-slate-900">
          <Bot size={22} />
          AI Judge Analysis
        </h2>

        <div className="mt-4 rounded-md border border-slate-900/10 bg-white/85 p-4 sm:p-5">
          {timeRemaining > 0 ? (
            <div className="flex flex-col items-center text-center">
              <Lock size={42} className="text-slate-500" />
              <h3 className="mt-4 text-lg font-bold uppercase tracking-[0.12em] text-slate-900">
                Chambers locked
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                The AI Judge is reviewing evidence. Opinion releases in <strong>{timeRemaining}</strong> seconds.
              </p>
            </div>
          ) : analysisLoading ? (
            <p className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-slate-600 sm:text-base">
              Formulating legal perspective...
            </p>
          ) : judgeAnalysis ? (
            <div className="border-l-4 border-slate-900 pl-4 text-base leading-8 whitespace-pre-line text-slate-700">
              {judgeAnalysis}
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">Analysis failed to load.</p>
          )}
        </div>
      </section>

      <CommentSection
        caseId={item.id}
        comments={item.comments}
        showToast={showToast}
        onRefresh={onRefresh}
      />
    </article>
  );
};

export default CaseDetail;
