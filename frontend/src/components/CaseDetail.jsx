import React, { useState, useEffect } from 'react';
import { CheckCircle2, Scale, Lock, Bot } from 'lucide-react';
import axios, { API } from '../lib/api';
import CommentSection from './CommentSection';

const CaseDetail = ({ item, user, showToast, onRefresh }) => {
  const [optimisticVoted, setOptimisticVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [judgeAnalysis, setJudgeAnalysis] = useState(item.judge_analysis || null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);

  // Reset optimistic flag and analysis state when switching cases
  useEffect(() => {
    setOptimisticVoted(false);
    setJudgeAnalysis(item.judge_analysis || null);
    setAnalysisFailed(false);
  }, [item]);

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
    if (tick() > 0) {
      interval = setInterval(() => {
        const remaining = tick();
        if (remaining === 0) {
          clearInterval(interval);
          if (!judgeAnalysis && !analysisLoading && !analysisFailed) {
            triggerJudgeAnalysis();
          }
        }
      }, 1000);
    } else if (!judgeAnalysis && !analysisLoading && !analysisFailed) {
       triggerJudgeAnalysis();
    }

    return () => { if (interval) clearInterval(interval); };
  }, [item.created_at, item.id, judgeAnalysis, analysisLoading, analysisFailed]);

  const triggerJudgeAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisFailed(false);
    try {
      const res = await axios.post(`${API}/cases/${item.id}/generate_judge_analysis/`);
      setJudgeAnalysis(res.data.judge_analysis);
      showToast('Judge opinion formulated.');
    } catch (err) {
      setAnalysisFailed(true);
    }
    setAnalysisLoading(false);
  };

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

  return (
    <div className="paper-card" style={{ padding: '48px', minHeight: '100%', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <span className="case-tag">{item.category?.name || 'PUBLIC DOCKET'}</span>
        <span className="case-id">ARCHIVE REF: #{item.id}</span>
      </div>

      <h1 style={{ fontSize: '3.5rem', marginBottom: '32px', color: '#1a1a1a', lineHeight: 1 }}>{item.title_hook}</h1>

      <div style={{ padding: '32px 0', borderTop: '1px solid rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: '48px' }}>
        <p className="full-story" style={{ color: '#222', fontSize: '1.25rem' }}>{item.full_story}</p>
      </div>

      <div className="verdict-section">
        {hasActuallyVoted ? (
          <div style={{ padding: '40px', background: 'rgba(0,0,0,0.03)', border: '2px dashed rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '16px', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', color: '#1a1a1a' }}>VERDICT SEALED</h3>
            <p style={{ color: '#444', fontSize: '1rem' }}>Your contribution to digital justice has been recorded. Thank you for your service, juror.</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#1a1a1a', textTransform: 'uppercase' }}>
              <Scale size={24} /> Submit Final Verdict
            </h3>
            <div className="vote-btn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <button className="btn btn-glass" onClick={() => handleVote('guilty')} style={{ padding: '16px', minHeight: '56px' }}>GUILTY</button>
              <button className="btn btn-glass" onClick={() => handleVote('esh')} style={{ padding: '16px', minHeight: '56px' }}>NEUTRAL</button>
              <button className="btn btn-glass" onClick={() => handleVote('not_guilty')} style={{ padding: '16px', minHeight: '56px' }}>NOT GUILTY</button>
            </div>
          </>
        )}

        <div style={{ marginTop: '60px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1a1a1a' }}>LIVE ADJUDICATION DATA</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#444' }}>{total} TOTAL VERDICTS</span>
          </header>

          <div className="vote-bar-track">
            <div className="vote-bar-guilty" style={{ width: total > 0 ? `${Math.round((item.votes_guilty / total) * 100)}%` : '0%', background: '#b91c1c' }} />
            <div className="vote-bar-esh" style={{ width: total > 0 ? `${Math.round((item.votes_esh / total) * 100)}%` : '0%', background: '#a16207' }} />
            <div className="vote-bar-not-guilty" style={{ width: total > 0 ? `${Math.round((item.votes_not_guilty / total) * 100)}%` : '0%', background: '#15803d' }} />
          </div>

          <div className="vote-stats-row" style={{ color: '#1a1a1a' }}>
            <span>GUILTY {total > 0 ? Math.round((item.votes_guilty / total) * 100) : 0}%</span>
            <span>NEUTRAL {total > 0 ? Math.round((item.votes_esh / total) * 100) : 0}%</span>
            <span>NOT GUILTY {total > 0 ? Math.round((item.votes_not_guilty / total) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      <div className="judge-analysis-section" style={{ marginTop: '60px', padding: '40px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.1)', position: 'relative' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#1a1a1a', textTransform: 'uppercase' }}>
          <Bot size={28} /> AI Judge Analysis
        </h3>
        
        {timeRemaining > 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', border: '2px dashed rgba(0,0,0,0.1)', background: '#fff' }}>
            <Lock size={48} color="#666" style={{ margin: '0 auto 16px' }} />
            <h4 style={{ fontWeight: 800, margin: '0 0 8px 0', color: '#1a1a1a', fontSize: '1.2rem', textTransform: 'uppercase' }}>CHAMBERS LOCKED</h4>
            <p style={{ color: '#666', margin: 0 }}>The AI Judge is reviewing evidence. Opinion releases in <b>{timeRemaining}</b> seconds.</p>
          </div>
        ) : analysisLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', background: '#fff', border: '1px solid rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.1rem' }}>FORMULATING LEGAL PERSPECTIVE...</p>
          </div>
        ) : judgeAnalysis ? (
          <div style={{ background: '#fff', padding: '32px', borderLeft: '4px solid #1a1a1a', fontStyle: 'italic', color: '#333', fontSize: '1.1rem', lineHeight: '1.8' }}>
            {judgeAnalysis.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </div>
        ) : (
           <p style={{ color: '#666' }}>Analysis failed to load.</p>
        )}
      </div>

      <CommentSection
        caseId={item.id}
        comments={item.comments}
        showToast={showToast}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default CaseDetail;
