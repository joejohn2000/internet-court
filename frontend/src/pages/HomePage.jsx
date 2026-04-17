import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  MessageCircle,
  Shield,
  LogOut,
  PlusCircle,
  UserCheck,
  History
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import axios, { API } from '../lib/api';
import CaseCard from '../components/CaseCard';
import CaseDetail from '../components/CaseDetail';
import Modal from '../components/Modal';

const HomePage = ({ showToast }) => {
  const MotionDiv = motion.div;
  const MotionSection = motion.section;
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [cats, setCats] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchContent = useCallback(async (syncSelection = false) => {
    try {
      const [cs, ct] = await Promise.all([
        axios.get(`${API}/cases/`),
        axios.get(`${API}/categories/`)
      ]);
      const newCases = Array.isArray(cs.data) ? cs.data : cs.data.results || [];
      setCases(newCases);
      setCats(Array.isArray(ct.data) ? ct.data : ct.data.results || []);

      if (syncSelection) {
        setSelectedCase(prev => {
          if (!prev) return null;
          return newCases.find(c => c.id === prev.id) || prev;
        });
      }
    } catch {
      // Silent fail to preserve current UX pattern.
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchContent();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchContent]);

  const openCase = (nextCase) => {
    setSelectedCase(nextCase);
    if (window.matchMedia('(max-width: 1279px)').matches) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setMobileMenuOpen(false);
  };

  return (
    <div className="page-shell">
      <nav className="sticky top-0 z-40 border-b border-amber-400/20 bg-black/88 backdrop-blur">
        <div className="content-shell relative">
          <div className="flex min-h-18 items-center justify-between gap-4 py-3">
            <button
              type="button"
              className="flex min-w-0 items-center gap-3 rounded-md px-1 py-1 text-left transition hover:bg-white/5"
              onClick={() => setSelectedCase(null)}
            >
              <img
                src="/assets/logo.png"
                alt="Internet Court"
                className="h-11 w-auto sm:h-12"
              />
              <span className="hidden text-sm font-bold uppercase tracking-[0.18em] text-slate-300 sm:block">
                Public Docket
              </span>
            </button>

            <button
              className="icon-button md:hidden"
              type="button"
              onClick={() => setMobileMenuOpen(open => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div
              className={`absolute left-4 right-4 top-full mt-3 flex-col gap-3 rounded-md border border-white/10 bg-black/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.38)] md:static md:mt-0 md:flex md:w-auto md:flex-row md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
                mobileMenuOpen ? 'flex' : 'hidden'
              }`}
            >
              {user && (
                <button
                  id="nav-case"
                  className="btn-primary w-full md:w-auto"
                  onClick={() => openModal('submit')}
                >
                  <PlusCircle size={18} />
                  <span>Submit Docket</span>
                </button>
              )}

              {!user?.is_guest && (
                <button
                  id="nav-history"
                  className="btn-secondary w-full md:w-auto"
                  onClick={() => {
                    navigate('/history');
                    setMobileMenuOpen(false);
                  }}
                >
                  <History size={18} />
                  <span>View Records</span>
                </button>
              )}

              <button
                id="nav-feedback"
                className="btn-secondary w-full md:w-auto"
                onClick={() => openModal('feedback')}
              >
                <MessageCircle size={18} />
                <span>Send Feedback</span>
              </button>

              <div
                className={`chip w-full justify-center md:w-auto ${
                  user?.is_guest ? 'border-dashed opacity-80' : ''
                }`}
              >
                {user?.is_guest ? <Shield size={16} /> : <UserCheck size={16} />}
                <span className="truncate">{user?.username || 'Visitor'}</span>
              </div>

              <button
                id="nav-logout"
                className="btn-secondary w-full border-rose-500/20 text-rose-200 hover:bg-rose-500/10 md:w-auto"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="content-shell py-6 sm:py-8 lg:py-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(380px,1.08fr)] xl:items-start">
          <section className={selectedCase ? 'order-2 xl:order-1' : 'order-1'}>
            <header className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-serif text-3xl text-white sm:text-4xl lg:text-5xl">Public Docket</h1>
                <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
                  Browse open cases, review the evidence, and cast a verdict without wading through cramped layouts.
                </p>
              </div>
              <span className="chip w-fit bg-amber-400/10 text-amber-100">
                {cases.length} unresolved casefiles
              </span>
            </header>

            <LayoutGroup>
              <MotionDiv layout className="grid gap-4 sm:gap-5">
                {loading ? (
                  <div className="section-card p-5 text-sm text-slate-300 sm:p-6">
                    Accessing database...
                  </div>
                ) : cases.length === 0 ? (
                  <div className="section-card p-6 text-center sm:p-10">
                    <MessageCircle size={42} className="mx-auto text-slate-500" />
                    <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
                      The docket is currently clear. Submit a case to begin.
                    </p>
                  </div>
                ) : (
                  cases.map(c => (
                    <CaseCard
                      key={c.id}
                      item={c}
                      isActive={selectedCase?.id === c.id}
                      onClick={() => openCase(c)}
                    />
                  ))
                )}
              </MotionDiv>
            </LayoutGroup>
          </section>

          <AnimatePresence>
            {selectedCase && (
              <MotionSection
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                className="order-1 xl:order-2 xl:sticky xl:top-24"
              >
                <div className="relative">
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="btn-paper absolute right-4 top-4 z-10 min-h-10 px-3 py-2"
                    aria-label="Close case detail"
                  >
                    <X size={18} />
                  </button>
                  <CaseDetail
                    key={selectedCase.id}
                    item={selectedCase}
                    showToast={showToast}
                    onRefresh={() => {
                      fetchContent(true);
                    }}
                  />
                </div>
              </MotionSection>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {modalType && (
          <Modal
            type={modalType}
            cats={cats}
            user={user}
            onClose={() => setModalType(null)}
            onSuccess={() => {
              setModalType(null);
              fetchContent();
            }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
