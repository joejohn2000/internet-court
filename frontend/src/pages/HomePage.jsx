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

const normalizeList = (payload) => (Array.isArray(payload) ? payload : payload.results || []);

// ─── Component ───────────────────────────────────────────────────────────────

const HomePage = ({ showToast }) => {
  const { user, handleLogout } = useAuth();

  // Data
  const [cases, setCases] = useState([]);
  const [totalCasesCount, setTotalCasesCount] = useState(0);
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

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/categories/`);
      setCats(normalizeList(response.data));
    } catch {
      // Silent fail
    }
  }, []);

  const fetchContent = useCallback(async (syncSelection = false) => {
    setLoading(true);
    const filterParams = {};

    if (activeCategory != null) {
      filterParams.category_id = activeCategory;
    }

    if (activeSortFilter !== 'all') {
      filterParams.feed = activeSortFilter;
    }

    try {
      const response = await axios.get(`${API}/cases/`, { params: filterParams });
      const newCases = normalizeList(response.data);
      const totalCases = response.data?.total_public_count;

      setCases(newCases);
      setTotalCasesCount(typeof totalCases === 'number' ? totalCases : newCases.length);
      if (syncSelection) {
        setSelectedCase((prev) =>
          prev ? newCases.find((c) => c.id === prev.id) || null : null
        );
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSortFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = window.setTimeout(() => fetchContent(true), 0);
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

  const filteredCases = cases;
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
        totalCasesCount={totalCasesCount}
        cats={cats}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeSortFilter={activeSortFilter}
        setActiveSortFilter={setActiveSortFilter}
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
        totalCasesCount={totalCasesCount}
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
          totalCasesCount={totalCasesCount}
          filteredCasesCount={filteredCases.length}
          activeFilterCount={activeFilterCount}
        />

        <main className="flex-1 overflow-hidden">
          <div className={`h-full grid gap-0 ${selectedCase ? 'xl:grid-cols-2' : 'xl:grid-cols-1'}`}>

            <CaseListPanel
              loading={loading}
              cases={cases}
              totalCasesCount={totalCasesCount}
              cats={cats}
              filteredCases={filteredCases}
              selectedCase={selectedCase}
              user={user}
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
              onSuccess={() => { setModalType(null); fetchContent(true); }}
              showToast={showToast}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
