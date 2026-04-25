// components/layout/CaseListPanel.jsx
import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ChevronDown, FileText, Filter, PlusCircle, Tag } from 'lucide-react';
import CaseCard from '../CaseCard';

const LOADING_CARDS = [1, 2, 3];
const MotionDiv = motion.div;
const STATUS_FILTERS = [
  { value: 'all', label: 'All cases' },
  { value: 'recent', label: 'Recent' },
  { value: 'trending', label: 'Trending' },
  { value: 'resolved', label: 'Resolved' },
];

const CaseListPanel = ({
  loading,
  cases,
  cats,
  filteredCases,
  selectedCase,
  user,
  activeCategory,
  setActiveCategory,
  activeSortFilter,
  setActiveSortFilter,
  activeFilterCount,
  onCaseClick,
  onSubmitCase,
  onClearFilters,
  listRef,
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const selectedCategory = cats.find((cat) => cat.id === activeCategory);

  return (
    <section
      className={`${
        selectedCase ? 'order-2 xl:order-1' : 'order-1'
      } flex flex-col xl:border-r xl:border-white/8 xl:overflow-hidden`}
    >
      <div className="shrink-0 border-b border-white/6 bg-[#0a0a0b]/40 px-6 py-5 xl:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl text-white sm:text-3xl">Active Cases</h1>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Review open cases and render a verdict.
            </p>
          </div>
          {!loading && cases.length > 0 && (
            <span className="shrink-0 rounded-md border border-amber-400/20 bg-amber-400/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
              {filteredCases.length}
              {filteredCases.length !== cases.length ? ' filtered' : ' unresolved'}
            </span>
          )}
        </div>

        {!loading && cases.length > 0 && (
          <div className="mt-4 xl:hidden">
            <div className="rounded-md border border-white/8 bg-white/[0.03] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Docket controls
                  </p>
                  <p className="mt-1 text-sm text-slate-200">
                    {activeFilterCount > 0
                      ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`
                      : 'Browse all open filings'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {filteredCases.length} of {cases.length} cases shown
                    {selectedCategory ? ` · ${selectedCategory.name}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen((open) => !open)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-amber-300/20 bg-amber-300/8 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-200 transition hover:bg-amber-300/12"
                  aria-expanded={mobileFiltersOpen}
                  aria-label={mobileFiltersOpen ? 'Hide docket filters' : 'Show docket filters'}
                >
                  <Filter size={14} />
                  {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${mobileFiltersOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {mobileFiltersOpen && (
                  <MotionDiv
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 border-t border-white/8 pt-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                          Status
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {STATUS_FILTERS.map((option) => {
                            const isActive = activeSortFilter === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setActiveSortFilter(option.value)}
                                className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                                  isActive
                                    ? 'border-amber-300/35 bg-amber-300/14 text-amber-200'
                                    : 'border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {cats.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            Category
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveCategory(null)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                                activeCategory == null
                                  ? 'border-amber-300/35 bg-amber-300/14 text-amber-200'
                                  : 'border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                              }`}
                            >
                              <Tag size={12} />
                              All categories
                            </button>
                            {cats.map((cat) => {
                              const isActive = activeCategory === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setActiveCategory(isActive ? null : cat.id)}
                                  className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                                    isActive
                                      ? 'border-amber-300/35 bg-amber-300/14 text-amber-200'
                                      : 'border-white/8 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                                  }`}
                                >
                                  {cat.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={onClearFilters}
                          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-200 transition hover:bg-white/[0.08]"
                        >
                          <Filter size={13} />
                          Clear filters
                        </button>
                      )}
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <LayoutGroup>
        <MotionDiv
          layout
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-5 xl:px-6"
        >
          <div className="flex flex-col gap-3">
            {loading ? (
              LOADING_CARDS.map((card) => (
                <div key={card} className="docket-loading-card" aria-hidden="true">
                  <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="docket-loading-kicker w-24" />
                      <span className="docket-loading-line mt-3 w-[82%]" />
                      <span className="docket-loading-line mt-2 w-[64%]" />
                    </div>
                    <span className="docket-loading-pill w-28" />
                  </div>
                  <div className="mt-4">
                    <div className="docket-loading-meter">
                      <span className="w-[34%]" />
                      <span className="w-[27%]" />
                      <span className="w-[39%]" />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3">
                        <span className="docket-loading-chip w-20" />
                        <span className="docket-loading-chip w-24" />
                      </div>
                      <span className="docket-loading-chip w-18" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3 border-t border-white/8 pt-4">
                    <span className="docket-loading-avatar" />
                    <span className="docket-loading-line w-40 max-w-[45%]" />
                    <span className="ml-auto docket-loading-chevron" />
                  </div>
                </div>
              ))
            ) : filteredCases.length === 0 ? (
              <div className="section-card p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/4">
                  <FileText size={22} className="text-slate-500" />
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  {cases.length === 0
                    ? 'The docket is clear. Submit a case to begin.'
                    : 'No cases match the current filters.'}
                </p>
                {cases.length === 0 && user ? (
                  <button
                    type="button"
                    onClick={onSubmitCase}
                    className="btn-primary mx-auto mt-5"
                  >
                    <PlusCircle size={16} />
                    <span>Submit First Case</span>
                  </button>
                ) : cases.length > 0 ? (
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="btn-secondary mx-auto mt-5"
                  >
                    <Filter size={14} />
                    <span>Clear Filters</span>
                  </button>
                ) : null}
              </div>
            ) : (
              filteredCases.map((c) => (
                <CaseCard
                  key={c.id}
                  item={c}
                  isActive={selectedCase?.id === c.id}
                  onClick={() => onCaseClick(c)}
                />
              ))
            )}
          </div>
        </MotionDiv>
      </LayoutGroup>
    </section>
  );
};

export default CaseListPanel;
