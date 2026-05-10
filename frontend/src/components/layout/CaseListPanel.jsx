// components/layout/CaseListPanel.jsx

import { LayoutGroup, motion } from 'framer-motion';
import { FileText, Filter, PlusCircle } from 'lucide-react';
import CaseCard from '../CaseCard';

const LOADING_CARDS = [1, 2, 3];
const MotionDiv = motion.div;

const CaseListPanel = ({
  loading,
  cases,
  totalCasesCount,
  filteredCases,
  selectedCase,
  user,
  onCaseClick,
  onSubmitCase,
  onClearFilters,
  listRef,
}) => {


  return (
    <section
      className={`${selectedCase ? 'order-2 xl:order-1' : 'order-1'
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
              {filteredCases.length !== totalCasesCount ? ' filtered' : ' active'}
            </span>
          )}
        </div>


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
                  {totalCasesCount === 0
                    ? 'The docket is clear. Submit a case to begin.'
                    : 'No cases match the current filters.'}
                </p>
                {totalCasesCount === 0 && user ? (
                  <button
                    type="button"
                    onClick={onSubmitCase}
                    className="btn-primary mx-auto mt-5"
                  >
                    <PlusCircle size={16} />
                    <span>Submit First Case</span>
                  </button>
                ) : totalCasesCount > 0 ? (
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
