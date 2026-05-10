// components/layout/DesktopTopBar.jsx
import { Gavel, Filter } from 'lucide-react';

const DesktopTopBar = ({ totalCasesCount, filteredCasesCount, activeFilterCount }) => (
  <header className="hidden shrink-0 items-center justify-between border-b border-white/8 bg-[#0a0a0b]/80 px-8 py-4 backdrop-blur xl:flex">
    <div className="flex items-center gap-3">
      <Gavel size={16} className="text-amber-400/70" />
      <h2 className="text-sm font-semibold text-slate-300 tracking-wide">Public Docket</h2>
      <span className="h-3.5 w-px bg-white/10" />
      <span className="text-xs text-slate-500">
        {filteredCasesCount !== totalCasesCount
          ? `${filteredCasesCount} filtered · ${totalCasesCount} total`
          : `${totalCasesCount} active case${totalCasesCount !== 1 ? 's' : ''}`}
      </span>
      {activeFilterCount > 0 && (
        <span className="flex h-5 items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 text-[10px] font-semibold text-amber-300">
          <Filter size={9} />
          {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
        </span>
      )}
    </div>
  </header>
);

export default DesktopTopBar;
