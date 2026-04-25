// components/sidebar/SideLabel.jsx

const SideLabel = ({ children, collapsed }) =>
  collapsed ? (
    <div className="my-1.5 mx-auto h-px w-5 rounded-full bg-white/8" />
  ) : (
    <p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 first:mt-0">
      {children}
    </p>
  );

export default SideLabel;
