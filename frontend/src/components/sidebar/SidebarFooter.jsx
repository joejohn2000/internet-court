// components/sidebar/SidebarFooter.jsx
import { Scale } from 'lucide-react';

const SidebarFooter = ({ collapsed, caseCount }) => (
  <div
    className={`shrink-0 border-t border-white/8 transition-all duration-260 ${
      collapsed ? 'flex justify-center py-3.5' : 'px-5 py-4'
    }`}
  >
    {collapsed ? (
      <div title={`${caseCount} open cases`} className="flex h-6 w-6 items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
      </div>
    ) : (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={13} className="text-amber-400/60" />
          <span className="text-[10px] uppercase tracking-widest text-slate-600">Docket</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-700">{caseCount} open</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
        </div>
      </div>
    )}
  </div>
);

export default SidebarFooter;
