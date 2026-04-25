// components/sidebar/FilterChip.jsx

const FilterChip = ({ label, active, onClick, icon: Icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150 ${
      active
        ? 'bg-amber-400/18 text-amber-200 border border-amber-400/30'
        : 'bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8 hover:text-slate-200 hover:border-white/14'
    }`}
  >
    {Icon && <Icon size={11} />}
    {label}
  </button>
);

export default FilterChip;
