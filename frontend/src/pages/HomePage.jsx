import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  History,
  Scale,
  Gavel,
  FileText,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Filter,
  Clock,
  TrendingUp,
  CheckCircle2,
  Tag,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import axios, { API } from '../lib/api';
import CaseCard from '../components/CaseCard';
import CaseDetail from '../components/CaseDetail';
import Modal from '../components/Modal';

const loadingCaseCards = [1, 2, 3];

// ─── Filter Chip ───────────────────────────────────────────────────────────
const FilterChip = ({ label, active, onClick, icon: Icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150 ${active
      ? 'bg-amber-400/18 text-amber-200 border border-amber-400/30'
      : 'bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8 hover:text-slate-200 hover:border-white/14'
      }`}
  >
    {Icon && <Icon size={11} />}
    {label}
  </button>
);

// ─── Sidebar Nav Item ──────────────────────────────────────────────────────
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
        className={`flex shrink-0 items-center justify-center rounded-md transition-colors duration-200 ${collapsed ? 'h-8 w-8' : 'h-7 w-7'
          } ${variant === 'primary'
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

      {/* Label + accessories — slide in/out with the sidebar */}
      <motion.span
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
      </motion.span>
    </button>
  );
};

// ─── Sidebar Section Label ─────────────────────────────────────────────────
const SideLabel = ({ children, collapsed }) =>
  collapsed ? (
    <div className="my-1.5 mx-auto h-px w-5 rounded-full bg-white/8" />
  ) : (
    <p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 first:mt-0">
      {children}
    </p>
  );

// ─── Main Component ────────────────────────────────────────────────────────
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

  // Sidebar: hover-driven expand/collapse
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const hoverLeaveTimer = useRef(null);
  const sidebarCollapsed = !sidebarHovered;

  // Browse docket expand + filter state
  const [docketOpen, setDocketOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSortFilter, setActiveSortFilter] = useState('all');

  const caseListRef = useRef(null);

  const fetchContent = useCallback(async (syncSelection = false) => {
    try {
      const [cs, ct] = await Promise.all([
        axios.get(`${API}/cases/`),
        axios.get(`${API}/categories/`),
      ]);
      const newCases = Array.isArray(cs.data) ? cs.data : cs.data.results || [];
      setCases(newCases);
      setCats(Array.isArray(ct.data) ? ct.data : ct.data.results || []);
      if (syncSelection) {
        setSelectedCase((prev) => {
          if (!prev) return null;
          return newCases.find((c) => c.id === prev.id) || prev;
        });
      }
    } catch {
      // Silent fail
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => fetchContent(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchContent]);

  const openCase = (nextCase) => {
    setSelectedCase(nextCase);
    setSidebarHovered(false); // collapse on case open
    if (window.matchMedia('(max-width: 1279px)').matches) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setMobileMenuOpen(false);
  };

  const handleBrowseDocket = () => {
    setSelectedCase(null);
    setMobileMenuOpen(false);
    setDocketOpen(true);
    requestAnimationFrame(() => {
      caseListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // Debounced mouse leave — prevents flicker when moving between items
  const handleSidebarEnter = () => {
    clearTimeout(hoverLeaveTimer.current);
    setSidebarHovered(true);
  };
  const handleSidebarLeave = () => {
    hoverLeaveTimer.current = setTimeout(() => setSidebarHovered(false), 120);
  };

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const catMatch =
      activeCategory == null ||
      c.category === activeCategory ||
      c.category?.id === activeCategory;
    const statusMatch =
      activeSortFilter === 'all' ||
      (activeSortFilter === 'resolved' && c.is_resolved) ||
      (activeSortFilter === 'recent' && !c.is_resolved) ||
      (activeSortFilter === 'trending' && c.vote_count > 5);
    return catMatch && statusMatch;
  });

  const activeFilterCount =
    (activeCategory != null ? 1 : 0) + (activeSortFilter !== 'all' ? 1 : 0);

  return (
    <div className="page-shell xl:flex xl:h-screen xl:overflow-hidden">

      {/* ── MOBILE TOP NAV ─────────────────────────── */}
      <nav className="sticky top-0 z-40 shrink-0 border-b border-white/8 bg-[#0a0a0b]/95 backdrop-blur xl:hidden">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6">
          <div className="flex min-h-16 items-center justify-between gap-4">
            <button
              type="button"
              className="flex min-w-0 items-center gap-2.5 rounded-md px-1 py-1 transition hover:bg-white/5"
              onClick={handleBrowseDocket}
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
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="border-t border-white/8 pb-4 pt-3"
              >
                <div className="flex flex-col gap-1.5">
                  {user && (
                    <SideNavItem
                      icon={PlusCircle}
                      label="Submit Docket"
                      variant="primary"
                      onClick={() => openModal('submit')}
                    />
                  )}
                  {!user?.is_guest && (
                    <SideNavItem
                      icon={History}
                      label="Case History"
                      onClick={() => { navigate('/history'); setMobileMenuOpen(false); }}
                    />
                  )}
                  <SideNavItem
                    icon={BookOpen}
                    label="Browse Docket"
                    isActive={!selectedCase}
                    badge={cases.length || undefined}
                    onClick={handleBrowseDocket}
                  />
                  <SideNavItem
                    icon={MessageCircle}
                    label="Send Feedback"
                    onClick={() => openModal('feedback')}
                  />
                  <SideNavItem
                    icon={LogOut}
                    label="Log Out"
                    variant="danger"
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ── SIDEBAR (desktop) — hover to expand ───── */}
      <motion.aside
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
        animate={{ width: sidebarCollapsed ? 64 : 256 }}
        transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden xl:flex xl:shrink-0 xl:flex-col xl:border-r xl:border-white/8 xl:bg-[#0c0c0e] xl:overflow-hidden z-30"
        style={{ willChange: 'width' }}
      >
        {/* Logo row */}
        <div
          className={`flex items-center border-b border-white/8 py-[18px] transition-all duration-260 ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-5'
            }`}
        >
          <button
            type="button"
            className="flex min-w-0 items-center gap-3 rounded-md transition hover:opacity-80"
            onClick={handleBrowseDocket}
          >
            <img src="/assets/logo.png" alt="Internet Court" className="h-9 w-auto shrink-0" />
            <motion.div
              animate={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : 'auto' }}
              transition={{ duration: 0.18 }}
              className="min-w-0 overflow-hidden"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300 whitespace-nowrap">
                Internet Court
              </p>
              <p className="text-[10px] text-slate-600 tracking-wide whitespace-nowrap">Public Docket</p>
            </motion.div>
          </button>
        </div>

        {/* User Identity */}
        <div className={`mt-4 transition-all duration-260 ${sidebarCollapsed ? 'mx-2' : 'mx-4'}`}>
          <div
            className={`rounded-xl border border-white/8 bg-white/3 transition-all duration-260 ${sidebarCollapsed ? 'p-1.5 flex justify-center' : 'p-3.5'
              }`}
          >
            {sidebarCollapsed ? (
              <div
                title={user?.username || 'Visitor'}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold ${user?.is_guest ? 'bg-slate-700/60 text-slate-400' : 'bg-amber-400/15 text-amber-300'
                  }`}
              >
                {user?.username?.[0]?.toUpperCase() || '?'}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold ${user?.is_guest ? 'bg-slate-700/60 text-slate-400' : 'bg-amber-400/15 text-amber-300'
                    }`}
                >
                  {user?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-200">
                    {user?.username || 'Visitor'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {user?.is_guest ? 'Guest Session' : 'Authenticated'}
                  </p>
                </div>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${user?.is_guest ? 'bg-slate-700/60' : 'bg-emerald-500/15'
                    }`}
                >
                  {user?.is_guest ? (
                    <Shield size={11} className="text-slate-500" />
                  ) : (
                    <UserCheck size={11} className="text-emerald-400" />
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden py-3 transition-all duration-260 ${sidebarCollapsed ? 'px-2' : 'px-3'
            }`}
        >
          <SideLabel collapsed={sidebarCollapsed}>Actions</SideLabel>
          {user && (
            <SideNavItem
              icon={PlusCircle}
              label="Submit Docket"
              variant="primary"
              onClick={() => openModal('submit')}
              collapsed={sidebarCollapsed}
            />
          )}

          <SideLabel collapsed={sidebarCollapsed}>Navigate</SideLabel>
          {!user?.is_guest && (
            <SideNavItem
              icon={History}
              label="Case History"
              isActive={false}
              onClick={() => navigate('/history')}
              collapsed={sidebarCollapsed}
            />
          )}

          {/* Browse Docket — expandable filter drawer */}
          <SideNavItem
            icon={BookOpen}
            label="Browse Docket"
            isActive={!selectedCase}
            badge={!sidebarCollapsed ? (cases.length || undefined) : undefined}
            onClick={() => {
              if (!sidebarCollapsed && !selectedCase) {
                // Already on docket view — just toggle the filter drawer
                setDocketOpen((o) => !o);
              } else {
                // Navigate to docket, then open the drawer
                handleBrowseDocket();
                setDocketOpen(true);
              }
            }}
            collapsed={sidebarCollapsed}
            hasChildren={!sidebarCollapsed}
            isOpen={docketOpen}
          />
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && docketOpen && (
              <motion.div
                key="filter-drawer"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                <div className="mb-2 ml-3 mt-1 border-l border-white/8 pl-3">
                  <p className="mb-2 mt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterChip label="All" active={activeSortFilter === 'all'} onClick={() => setActiveSortFilter('all')} icon={Filter} />
                    <FilterChip label="Recent" active={activeSortFilter === 'recent'} onClick={() => setActiveSortFilter('recent')} icon={Clock} />
                    <FilterChip label="Trending" active={activeSortFilter === 'trending'} onClick={() => setActiveSortFilter('trending')} icon={TrendingUp} />
                    <FilterChip label="Resolved" active={activeSortFilter === 'resolved'} onClick={() => setActiveSortFilter('resolved')} icon={CheckCircle2} />
                  </div>

                  {cats.length > 0 && (
                    <>
                      <p className="mb-2 mt-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                        Category
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <FilterChip
                          label="All"
                          active={activeCategory == null}
                          onClick={() => setActiveCategory(null)}
                          icon={Tag}
                        />
                        {cats.map((cat) => (
                          <FilterChip
                            key={cat.id}
                            label={cat.name}
                            active={activeCategory === cat.id}
                            onClick={() =>
                              setActiveCategory(activeCategory === cat.id ? null : cat.id)
                            }
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <p className="mt-3 text-[10px] text-slate-600">
                    {filteredCases.length} of {cases.length} cases
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <SideLabel collapsed={sidebarCollapsed}>Support</SideLabel>
          <SideNavItem
            icon={MessageCircle}
            label="Send Feedback"
            onClick={() => openModal('feedback')}
            collapsed={sidebarCollapsed}
          />

          <SideLabel collapsed={sidebarCollapsed}>Account</SideLabel>
          <SideNavItem
            icon={LogOut}
            label="Log Out"
            variant="danger"
            onClick={handleLogout}
            collapsed={sidebarCollapsed}
          />
        </nav>

        {/* Footer */}
        <div
          className={`shrink-0 border-t border-white/8 transition-all duration-260 ${sidebarCollapsed ? 'flex justify-center py-3.5' : 'px-5 py-4'
            }`}
        >
          {sidebarCollapsed ? (
            <div title={`${cases.length} open cases`} className="flex h-6 w-6 items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale size={13} className="text-amber-400/60" />
                <span className="text-[10px] uppercase tracking-widest text-slate-600">Docket</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-700">{cases.length} open</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ── MAIN CONTENT ──────────────────────────── */}
      <div className="flex flex-1 flex-col xl:overflow-hidden">

        {/* Desktop top bar */}
        <header className="hidden shrink-0 items-center justify-between border-b border-white/8 bg-[#0a0a0b]/80 px-8 py-4 backdrop-blur xl:flex">
          <div className="flex items-center gap-3">
            <Gavel size={16} className="text-amber-400/70" />
            <h2 className="text-sm font-semibold text-slate-300 tracking-wide">Public Docket</h2>
            <span className="h-3.5 w-px bg-white/10" />
            <span className="text-xs text-slate-500">
              {filteredCases.length !== cases.length
                ? `${filteredCases.length} filtered · ${cases.length} total`
                : `${cases.length} active case${cases.length !== 1 ? 's' : ''}`}
            </span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 text-[10px] font-semibold text-amber-300">
                <Filter size={9} />
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
            )}
          </div>
        </header>

        {/* Content grid */}
        <main className="flex-1 overflow-hidden">
          <div className={`h-full grid gap-0 ${selectedCase ? 'xl:grid-cols-2' : 'xl:grid-cols-1'}`}>

            {/* Case List Panel */}
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
                      {filteredCases.length}{filteredCases.length !== cases.length ? ' filtered' : ' unresolved'}
                    </span>
                  )}
                </div>
              </div>

              <LayoutGroup>
                <MotionDiv layout ref={caseListRef} className="flex-1 overflow-y-auto px-4 py-5 xl:px-6">
                  <div className="flex flex-col gap-3">
                    {loading ? (
                      loadingCaseCards.map((card) => (
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
                              <span className="w-[34%]" /><span className="w-[27%]" /><span className="w-[39%]" />
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
                          <button type="button" onClick={() => openModal('submit')} className="btn-primary mx-auto mt-5">
                            <PlusCircle size={16} />
                            <span>Submit First Case</span>
                          </button>
                        ) : cases.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => { setActiveCategory(null); setActiveSortFilter('all'); }}
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
                          onClick={() => openCase(c)}
                        />
                      ))
                    )}
                  </div>
                </MotionDiv>
              </LayoutGroup>
            </section>

            {/* Case Detail Panel */}
            <AnimatePresence>
              {selectedCase && (
                <div className="order-1 xl:order-2 xl:overflow-y-auto xl:bg-[#0b0b0d]">
                  <MotionSection
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="min-h-full"
                  >
                    <CaseDetail
                      key={selectedCase.id}
                      item={selectedCase}
                      showToast={showToast}
                      onRefresh={() => fetchContent(true)}
                      onClose={() => setSelectedCase(null)}
                    />
                  </MotionSection>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {modalType && (
          <Modal
            type={modalType}
            cats={cats}
            user={user}
            onClose={() => setModalType(null)}
            onSuccess={() => { setModalType(null); fetchContent(); }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
