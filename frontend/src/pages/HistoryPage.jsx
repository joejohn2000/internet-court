import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import axios, { API } from '../lib/api';
import { fadeIn } from '../lib/animations';

const HistoryPage = ({ showToast }) => {
  const MotionDiv = motion.div;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const [cRes, vRes] = await Promise.all([
          axios.get(`${API}/cases/?author_id=${user.id}`),
          axios.get(`${API}/votes/?user_id=${user.id}`)
        ]);

        const cases = (Array.isArray(cRes.data) ? cRes.data : cRes.data.results || []).map(c => ({
          ...c,
          type: 'case'
        }));
        const votes = (Array.isArray(vRes.data) ? vRes.data : vRes.data.results || []).map(v => ({
          ...v,
          type: 'vote'
        }));

        setRecords([...cases, ...votes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch {
        showToast('Protocol failed to retrieve history.', 'error');
      }
      setLoading(false);
    };
    fetchHistory();
  }, [user.id, showToast]);

  const filtered = records.filter(r => filter === 'all' || r.type === (filter === 'cases' ? 'case' : 'vote'));

  return (
    <MotionDiv {...fadeIn} className="page-shell-paper">
      <header className="sticky top-0 z-30 border-b border-slate-900/10 bg-[#f6efe4]/95 backdrop-blur">
        <div className="content-shell flex flex-wrap items-center justify-between gap-3 py-4">
          <button
            type="button"
            className="btn-paper w-full justify-center sm:w-auto sm:justify-start"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft size={18} />
            Back to docket
          </button>

          <div className="chip-paper w-full justify-center sm:w-auto">
            <UserCheck size={16} />
            <span>{user?.username}</span>
          </div>
        </div>
      </header>

      <main className="content-shell max-w-4xl py-8 sm:py-10">
        <section className="mb-6 border-b border-slate-900/10 pb-6">
          <h1 className="font-serif text-3xl text-slate-950 sm:text-4xl">Personal Logs</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Review the cases you filed and the verdicts you submitted without squeezing through a desktop-sized archive.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {['all', 'cases', 'votes'].map(f => (
              <button
                key={f}
                className={filter === f ? 'btn-paper w-full sm:w-auto bg-slate-950 text-white hover:bg-slate-900' : 'btn-paper w-full sm:w-auto'}
                onClick={() => setFilter(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="rounded-md border border-slate-900/10 bg-white/60 px-5 py-8 text-sm text-slate-600">
            Accessing archive...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-900/14 bg-white/60 px-5 py-8 text-sm leading-6 text-slate-600">
            No records found in this cycle.
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5">
            {filtered.map(r => {
              const source = r.type === 'case' ? r : r.case_details;
              const totalVotes = source?.total_votes || 0;
              const guiltyPct = Math.round(((source?.votes_guilty / totalVotes) || 0) * 100);
              const innocentPct = Math.round(((source?.votes_not_guilty / totalVotes) || 0) * 100);

              return (
                <article
                  key={`${r.type}-${r.id}`}
                  className="rounded-md border border-slate-900/10 bg-white/75 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="status-badge-paper">
                        {r.type.toUpperCase()}
                      </span>
                      {r.type === 'vote' && (
                        <span className="status-badge-paper bg-slate-950 text-white">
                          Your verdict: {r.decision.toUpperCase().replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <time className="text-sm text-slate-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </time>
                  </div>

                  <h2 className="mt-4 font-serif text-2xl leading-tight text-slate-950">
                    {source?.title_hook}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
                    {source?.full_story}
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-3 rounded-md border border-slate-900/8 bg-slate-900/[0.035] p-4 sm:grid-cols-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        Public verdict
                      </span>
                      <p className="mt-2 text-lg font-bold text-slate-900">{guiltyPct}% guilty</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        Censure intensity
                      </span>
                      <p className="mt-2 text-lg font-bold text-slate-900">{innocentPct}% innocent</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        Total jurors
                      </span>
                      <p className="mt-2 text-lg font-bold text-slate-900">{totalVotes} recorded</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </MotionDiv>
  );
};

export default HistoryPage;
