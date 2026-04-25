// pages/HomePage.jsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import axios, { API } from '../lib/api';
import { cleanupAdSenseArtifacts, loadAdSenseScript } from '../lib/adsense';
import Modal from '../components/Modal';

import Sidebar from '../components/sidebar/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import DesktopTopBar from '../components/layout/DesktopTopBar';
import CaseListPanel from '../components/layout/CaseListPanel';
import CaseDetailPanel from '../components/layout/CaseDetailPanel';

// ─── Helpers ────────────────────────────────────────────────────────────────

const filterCases = (cases, activeCategory, activeSortFilter) =>
  cases.filter((c) => {
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

// ─── Component ───────────────────────────────────────────────────────────────

const HomePage = ({ showToast }) => {
  const { user, handleLogout } = useAuth();

  // Data
  const [cases, setCases] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection / modal
  const [selectedCase, setSelectedCase] = useState(null);
  const [modalType, setModalType] = useState(null);

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sidebar collapse (hover-driven)
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const hoverLeaveTimer = useRef(null);
  const sidebarCollapsed = !sidebarHovered;

  // Filter state
  const [docketOpen, setDocketOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSortFilter, setActiveSortFilter] = useState('all');

  const caseListRef = useRef(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

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
        setSelectedCase((prev) =>
          prev ? newCases.find((c) => c.id === prev.id) || prev : null
        );
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

  useEffect(() => {
    if (loading || cases.length === 0) {
      cleanupAdSenseArtifacts();
      return undefined;
    }

    let ignore = false;

    loadAdSenseScript().catch(() => {
      if (!ignore) {
        cleanupAdSenseArtifacts();
      }
    });

    return () => {
      ignore = true;
      cleanupAdSenseArtifacts();
    };
  }, [loading, cases.length]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openCase = (nextCase) => {
    setSelectedCase(nextCase);
    setSidebarHovered(false);
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

  const handleSidebarEnter = () => {
    clearTimeout(hoverLeaveTimer.current);
    setSidebarHovered(true);
  };
  const handleSidebarLeave = () => {
    hoverLeaveTimer.current = setTimeout(() => setSidebarHovered(false), 120);
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredCases = filterCases(cases, activeCategory, activeSortFilter);
  const activeFilterCount =
    (activeCategory != null ? 1 : 0) + (activeSortFilter !== 'all' ? 1 : 0);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page-shell xl:flex xl:h-screen xl:overflow-hidden">

      {/* Mobile top nav */}
      <MobileNav
        user={user}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        selectedCase={selectedCase}
        cases={cases}
        onSubmitCase={() => openModal('submit')}
        onFeedback={() => openModal('feedback')}
        onBrowseDocket={handleBrowseDocket}
        onLogout={() => { handleLogout(); setMobileMenuOpen(false); }}
      />

      {/* Desktop sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
        user={user}
        cases={cases}
        cats={cats}
        selectedCase={selectedCase}
        docketOpen={docketOpen}
        setDocketOpen={setDocketOpen}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeSortFilter={activeSortFilter}
        setActiveSortFilter={setActiveSortFilter}
        filteredCases={filteredCases}
        onSubmitCase={() => openModal('submit')}
        onFeedback={() => openModal('feedback')}
        onBrowseDocket={handleBrowseDocket}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col xl:overflow-hidden">

        <DesktopTopBar
          cases={cases}
          filteredCases={filteredCases}
          activeFilterCount={activeFilterCount}
        />

        <main className="flex-1 overflow-hidden">
          <div className={`h-full grid gap-0 ${selectedCase ? 'xl:grid-cols-2' : 'xl:grid-cols-1'}`}>

            <CaseListPanel
              loading={loading}
              cases={cases}
              cats={cats}
              filteredCases={filteredCases}
              selectedCase={selectedCase}
              user={user}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              activeSortFilter={activeSortFilter}
              setActiveSortFilter={setActiveSortFilter}
              activeFilterCount={activeFilterCount}
              onCaseClick={openCase}
              onSubmitCase={() => openModal('submit')}
              onClearFilters={() => { setActiveCategory(null); setActiveSortFilter('all'); }}
              listRef={caseListRef}
            />

            <CaseDetailPanel
              selectedCase={selectedCase}
              showToast={showToast}
              onRefresh={() => fetchContent(true)}
              onClose={() => setSelectedCase(null)}
            />
          </div>
        </main>
      </div>

      {/* Modal */}
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
