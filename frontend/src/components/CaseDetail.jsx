import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Scale, Lock, Bot, Clock3, EyeOff, X } from 'lucide-react';
import axios, { API } from '../lib/api';
import CommentSection from './CommentSection';
import CaseAuthorBadge from './CaseAuthorBadge';

const formatTimeRemaining = (seconds) => {
  const safeSeconds = Math.max(seconds, 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
};

const formatHashtag = (category) => `#${(category?.slug || category?.name || 'General').replace(/[^a-zA-Z0-9]/g, '')}`;

const CaseDetail = ({ item, showToast, onRefresh, onClose }) => {
  const [caseData, setCaseData] = useState(item);
  const [optimisticVoted, setOptimisticVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [judgeAnalysis, setJudgeAnalysis] = useState(item.judge_analysis || null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const displayedJudgeAnalysis = judgeAnalysis || caseData.judge_analysis || null;

  useEffect(() => {
    const hasFullDetail = typeof item.full_story === 'string' && Array.isArray(item.comments);
    if (hasFullDetail) {
      return undefined;
    }

    let active = true;

    const fetchCaseDetail = async () => {
      try {
        const response = await axios.get(`${API}/cases/${item.id}/`);
        if (!active) return;
        setCaseData(response.data);
        setJudgeAnalysis(response.data.judge_analysis || null);
      } catch {
        if (active) {
          showToast('Case details could not be loaded.', 'error');
        }
      }
    };

    fetchCaseDetail();
    return () => {
      active = false;
    };
  }, [item.id, item.full_story, item.comments, showToast]);

  const triggerJudgeAnalysis = useCallback(async () => {
    setAnalysisLoading(true);
    setAnalysisFailed(false);
    try {
      const res = await axios.post(`${API}/cases/${caseData.id}/generate_judge_analysis/`);
      setJudgeAnalysis(res.data.judge_analysis);
      showToast('Judge opinion formulated.');
    } catch {
      setAnalysisFailed(true);
    }
    setAnalysisLoading(false);
  }, [caseData.id, showToast]);

  useEffect(() => {
    if (!caseData.verdict_timer_ends) return;
    const unlockTime = new Date(caseData.verdict_timer_ends).getTime();
    const isUnlockedNow = () => Date.now() >= unlockTime;

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
          if (isUnlockedNow() && !displayedJudgeAnalysis && !analysisLoading && !analysisFailed) {
            triggerTimer = window.setTimeout(() => {
              triggerJudgeAnalysis();
            }, 0);
          }
        }
      }, 1000);
    } else if (isUnlockedNow() && !displayedJudgeAnalysis && !analysisLoading && !analysisFailed) {
      triggerTimer = window.setTimeout(() => {
        triggerJudgeAnalysis();
      }, 0);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (triggerTimer) window.clearTimeout(triggerTimer);
    };
  }, [caseData.verdict_timer_ends, displayedJudgeAnalysis, analysisLoading, analysisFailed, triggerJudgeAnalysis]);

  const isUnlockedByTime = Boolean(caseData.verdict_timer_ends) && timeRemaining === 0;
  const hasActuallyVoted = optimisticVoted || caseData.user_has_voted;
  const canViewDistribution = Boolean(caseData.can_view_distribution) || optimisticVoted || isUnlockedByTime;
  const canViewAIVerdict = Boolean(caseData.can_view_ai_verdict) || isUnlockedByTime;

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

  const total = caseData.total_votes || 0;
  const guiltyVotes = caseData.votes_guilty ?? 0;
  const eshVotes = caseData.votes_esh ?? 0;
  const notGuiltyVotes = caseData.votes_not_guilty ?? 0;
  const nobodyVotes = caseData.votes_nobody ?? 0;
  const voteData = [
    {
      label: 'You messed up',
      key: 'you-messed-up',
      votes: guiltyVotes,
      percent: total > 0 ? Math.round((guiltyVotes / total) * 100) : 0,
      barClass: 'bg-rose-600'
    },
    {
      label: 'Both messed up',
      key: 'both-messed-up',
      votes: eshVotes,
      percent: total > 0 ? Math.round((eshVotes / total) * 100) : 0,
      barClass: 'bg-amber-600'
    },
    {
      label: 'They messed up',
      key: 'they-messed-up',
      votes: notGuiltyVotes,
      percent: total > 0 ? Math.round((notGuiltyVotes / total) * 100) : 0,
      barClass: 'bg-emerald-600'
    },
    {
      label: 'Nobody messed up',
      key: 'nobody-messed-up',
      votes: nobodyVotes,
      percent: total > 0 ? Math.round((nobodyVotes / total) * 100) : 0,
      barClass: 'bg-sky-500'
    }
  ];

  const contextBlocks = [
    ['Your perspective', caseData.self_perspective],
    ['Other perspective', caseData.other_perspective],
    ['Why you felt right', caseData.why_right],
    ['Extra context', caseData.extra_context],
  ].filter(([, value]) => value);

  return (
    <article className="panel-paper overflow-hidden p-4 sm:p-6 lg:p-8">

      <div className="flex flex-col gap-3 border-b border-slate-900/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip-paper">{formatHashtag(caseData.category)}</span>
          {!caseData.is_public && (
            <span className="chip-paper bg-slate-950 text-white">
              <EyeOff size={12} />
              Private archive
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Case #{caseData.id}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="btn-paper min-h-8 px-2 py-1"
              aria-label="Close case detail"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <header className="mt-5">
        <h1 className="font-serif text-3xl leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
          {caseData.title_hook}
        </h1>
        <CaseAuthorBadge
          authorName={caseData.author_name}
          profileImage={caseData.author_profile_image}
          className="mt-4"
        />
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Clock3 size={14} />
            AI reveal {canViewAIVerdict ? 'unlocked' : `in ${formatTimeRemaining(timeRemaining)}`}
          </span>
          <span>{caseData.read_time_minutes} min read</span>
          <span>{caseData.author_name || 'Anonymous'} filed this case</span>
        </div>
      </header>

      <section className="mt-6 border-y border-slate-900/10 py-5">
        <p className="text-base leading-8 text-slate-800 sm:text-lg">{caseData.full_story}</p>
      </section>

      {contextBlocks.length > 0 && (
        <section className="mt-6 rounded-md border border-slate-900/10 bg-white/60 p-4 sm:p-6">
          <h2 className="text-lg font-bold uppercase tracking-[0.12em] text-slate-900">Context notes</h2>
          <div className="mt-4 grid gap-4">
            {contextBlocks.map(([label, value]) => (
              <div key={label} className="rounded-md border border-slate-900/8 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-base">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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
                onClick={() => handleVote('you_messed_up')}
                disabled={loading}
              >
                You messed up
              </button>
              <button
                className="btn-paper w-full"
                onClick={() => handleVote('they_messed_up')}
                disabled={loading}
              >
                They messed up
              </button>
              <button
                className="btn-paper w-full"
                onClick={() => handleVote('both_messed_up')}
                disabled={loading}
              >
                Both messed up
              </button>
              <button
                className="btn-paper w-full sm:col-span-3"
                onClick={() => handleVote('nobody_messed_up')}
                disabled={loading}
              >
                Nobody messed up
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

          {canViewDistribution ? (
            <>
              <div className="vote-track">
                {voteData.map(({ key, percent, barClass }) => (
                  <div key={key} className={barClass} style={{ width: `${percent}%` }} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {voteData.map(({ key, label, votes, percent }) => (
                  <div key={key} className="rounded-md border border-slate-900/8 bg-white/70 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{percent}%</p>
                    <p className="text-sm text-slate-600">{votes} votes</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              Vote percentages are hidden until you cast a vote or the debate window ends.
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-md border border-slate-900/10 bg-slate-900/[0.035] p-4 sm:p-6">
        <h2 className="flex items-center gap-3 text-lg font-bold uppercase tracking-[0.12em] text-slate-900">
          <Bot size={22} />
          AI Judge Analysis
        </h2>

        <div className="mt-4 rounded-md border border-slate-900/10 bg-white/85 p-4 sm:p-5">
          {!canViewAIVerdict ? (
            <div className="flex flex-col items-center text-center">
              <Lock size={42} className="text-slate-500" />
              <h3 className="mt-4 text-lg font-bold uppercase tracking-[0.12em] text-slate-900">
                Chambers locked
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                The AI Judge is reviewing evidence. Opinion releases in{' '}
                <strong>{formatTimeRemaining(timeRemaining)}</strong>.
              </p>
            </div>
          ) : analysisLoading ? (
            <p className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-slate-600 sm:text-base">
              Formulating legal perspective...
            </p>
          ) : displayedJudgeAnalysis ? (
            <div className="border-l-4 border-slate-900 pl-4 text-base leading-8 whitespace-pre-line text-slate-700">
              {displayedJudgeAnalysis}
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              The court is preparing the first public AI opinion. Please check back in a moment.
            </p>
          )}
        </div>
      </section>

      <CommentSection
        caseId={item.id}
        comments={caseData.comments}
        showToast={showToast}
        onRefresh={onRefresh}
      />
    </article>
  );
};

export default CaseDetail;
