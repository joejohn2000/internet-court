// components/sidebar/SideNavItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';

const MotionSpan = motion.span;

const SideNavItem = ({
  icon,
  label,
  onClick,
  variant = 'default',
  badge,
  isActive,
  collapsed,
  hasChildren,
  isOpen,
}) => {
  const base =
    'group relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer select-none overflow-hidden';

  const variants = {
    default: isActive
      ? 'text-white bg-white/8'
      : 'text-slate-400 hover:text-white hover:bg-white/6',
    primary:
      'bg-gradient-to-r from-amber-500/18 to-amber-400/8 text-amber-200 border border-amber-400/20 hover:border-amber-400/40 hover:from-amber-500/28 hover:to-amber-400/14',
    danger: 'text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/8',
  };

  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${collapsed ? 'justify-center gap-0' : 'gap-3'}`}
      onClick={onClick}
      title={collapsed ? label : undefined}
    >
      {isActive && variant === 'default' && !collapsed && (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-amber-400" />
      )}

      {/* Icon */}
      <span
        className={`flex shrink-0 items-center justify-center rounded-md transition-colors duration-200 ${
          collapsed ? 'h-8 w-8' : 'h-7 w-7'
        } ${
          variant === 'primary'
            ? 'bg-amber-400/12 text-amber-300'
            : variant === 'danger'
            ? 'bg-rose-500/10 text-rose-400'
            : isActive
            ? 'bg-white/10 text-white'
            : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-slate-200'
        }`}
      >
        {icon ? React.createElement(icon, { size: 15 }) : null}
      </span>

      {/* Label + accessories */}
      <MotionSpan
        animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
        transition={{ duration: 0.18 }}
        className="flex flex-1 items-center gap-2 overflow-hidden whitespace-nowrap"
        style={{ minWidth: 0 }}
      >
        <span className="flex-1 text-left text-sm">{label}</span>
        {badge != null && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400/20 px-1.5 text-[10px] font-semibold text-amber-300">
            {badge}
          </span>
        )}
        {hasChildren ? (
          <ChevronDown
            size={13}
            className={`shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        ) : variant === 'default' && !isActive ? (
          <ChevronRight
            size={13}
            className="shrink-0 text-slate-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
          />
        ) : null}
      </MotionSpan>
    </button>
  );
};

export default SideNavItem;
