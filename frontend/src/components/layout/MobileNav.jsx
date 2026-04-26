// components/layout/MobileNav.jsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Menu, X, PlusCircle, History, BookOpen,
  MessageCircle, LogOut, Tag
} from 'lucide-react';
import SideNavItem from '../sidebar/SideNavItem';

const MotionDiv = motion.div;

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'recent', label: 'Recent' },
  { value: 'trending', label: 'Trending' },
  { value: 'resolved', label: 'Resolved' },
];

const MobileNav = ({
  user,
  mobileMenuOpen,
  setMobileMenuOpen,
  selectedCase,
  cases,
  cats,
  activeCategory,
  setActiveCategory,
  activeSortFilter,

  setActiveSortFilter,
  onSubmitCase,
  onFeedback,
  onBrowseDocket,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [docketExpanded, setDocketExpanded] = useState(false);

  return (
    <nav className="sticky top-0 z-40 shrink-0 border-b border-white/8 bg-[#0a0a0b]/95 backdrop-blur xl:hidden relative">
      <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <button
            type="button"
            className="flex min-w-0 items-center gap-2.5 rounded-md px-1 py-1 transition hover:bg-white/5"
            onClick={onBrowseDocket}
          >
            <img src="/assets/logo.png" alt="Internet Court" className="h-9 w-auto" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Public Docket
            </span>
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[60] bg-black/60"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Floating menu */}
              <MotionDiv
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute left-4 right-4 top-[calc(100%+8px)] z-[70] rounded-xl border border-white/10 bg-[#0c0c0e]/98 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur"
              >
                <div className="flex flex-col gap-1.5">

                  {/* Submit Docket */}
                  {user && (
                    <SideNavItem
                      icon={PlusCircle}
                      label="Submit Docket"
                      variant="primary"
                      onClick={onSubmitCase}
                    />
                  )}

                  {/* Case History */}
                  {!user?.is_guest && (
                    <SideNavItem
                      icon={History}
                      label="Case History"
                      onClick={() => {
                        navigate('/history');
                        setMobileMenuOpen(false);
                      }}
                    />
                  )}

                  {/* Browse Docket with inline filter drawer */}
                  <div>
                    <SideNavItem
                      icon={BookOpen}
                      label="Browse Docket"
                      isActive={!selectedCase}
                      badge={cases.length || undefined}
                      hasChildren={true}
                      isOpen={docketExpanded}
                      onClick={() => setDocketExpanded((o) => !o)}
                    />

                    <AnimatePresence initial={false}>
                      {docketExpanded && (
                        <MotionDiv
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-3 mt-1 border-l border-white/8 pl-3 pb-3">

                            {/* Status */}
                            <p className="mt-2 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                              Status
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {STATUS_FILTERS.map((f) => (
                                <button
                                  key={f.value}
                                  type="button"
                                  onClick={() => setActiveSortFilter(f.value)}
                                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition ${activeSortFilter === f.value
                                    ? 'border-amber-300/35 bg-amber-300/14 text-amber-200'
                                    : 'border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]'
                                    }`}
                                >
                                  {f.label}
                                </button>
                              ))}
                            </div>

                            {/* Category */}
                            {cats?.length > 0 && (
                              <>
                                <p className="mt-3 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                                  Category
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setActiveCategory(null)}
                                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition ${activeCategory == null
                                      ? 'border-amber-300/35 bg-amber-300/14 text-amber-200'
                                      : 'border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]'
                                      }`}
                                  >
                                    <Tag size={10} />
                                    All
                                  </button>
                                  {cats.map((cat) => (
                                    <button
                                      key={cat.id}
                                      type="button"
                                      onClick={() =>
                                        setActiveCategory(activeCategory === cat.id ? null : cat.id)
                                      }
                                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition ${activeCategory === cat.id
                                        ? 'border-amber-300/35 bg-amber-300/14 text-amber-200'
                                        : 'border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]'
                                        }`}
                                    >
                                      {cat.name}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}

                            {/* Clear filters */}
                            {(activeCategory != null || activeSortFilter !== 'all') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCategory(null);
                                  setActiveSortFilter('all');
                                }}
                                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-400 hover:text-rose-300 transition"
                              >
                                <X size={11} />
                                Clear filters
                              </button>
                            )}

                            {/* Go to docket */}
                            <button
                              type="button"
                              onClick={() => {
                                onBrowseDocket();
                                setDocketExpanded(false);
                                setMobileMenuOpen(false);
                              }}
                              className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-amber-200 transition"
                            >
                              <BookOpen size={11} />
                              Go to docket
                            </button>
                          </div>
                        </MotionDiv>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Feedback */}
                  <SideNavItem
                    icon={MessageCircle}
                    label="Send Feedback"
                    onClick={onFeedback}
                  />

                  {/* Log Out */}
                  <SideNavItem
                    icon={LogOut}
                    label="Log Out"
                    variant="danger"
                    onClick={onLogout}
                  />

                </div>
              </MotionDiv>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default MobileNav;