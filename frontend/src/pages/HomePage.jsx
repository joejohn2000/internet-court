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
  const [filteredCasesCount, setFilteredCasesCount] = useState(0);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);

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

  const fetchContent = useCallback(async ({ page = 1, syncSelection = false, append = false } = {}) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    const filterParams = {};

    if (activeCategory != null) {
      filterParams.category_id = activeCategory;
    }

    if (activeSortFilter !== 'all') {
      filterParams.feed = activeSortFilter;
    }
    filterParams.page = page;

    try {
      const response = await axios.get(`${API}/cases/`, { params: filterParams });
      const newCases = normalizeList(response.data);
      const totalCases = response.data?.total_public_count;
      const filteredTotal = response.data?.count;

      setCases((current) => (append ? [...current, ...newCases] : newCases));
      setTotalCasesCount(typeof totalCases === 'number' ? totalCases : newCases.length);
      setFilteredCasesCount(typeof filteredTotal === 'number' ? filteredTotal : newCases.length);
      setNextPage(response.data?.next || null);
      if (syncSelection) {
        setSelectedCase((prev) =>
          prev ? newCases.find((c) => c.id === prev.id) || null : null
        );
      }
    } catch {
      // Silent fail
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [activeCategory, activeSortFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = window.setTimeout(() => fetchContent({ syncSelection: true }), 0);
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

  const handleLoadMore = () => {
    if (!nextPage || loadingMore) return;
    const nextUrl = new URL(nextPage);
    const page = Number(nextUrl.searchParams.get('page') || '1');
    fetchContent({ page, append: true });
  };

  const refreshSelectedCase = useCallback(async (caseId) => {
    try {
      const response = await axios.get(`${API}/cases/${caseId}/`);
      const detailedCase = response.data;
      setSelectedCase(detailedCase);
      setCases((current) => current.map((entry) => (
        entry.id === detailedCase.id
          ? {
            ...entry,
            votes_guilty: detailedCase.votes_guilty,
            votes_not_guilty: detailedCase.votes_not_guilty,
            votes_esh: detailedCase.votes_esh,
            votes_nobody: detailedCase.votes_nobody,
            total_votes: detailedCase.total_votes,
            user_has_voted: detailedCase.user_has_voted,
            can_view_distribution: detailedCase.can_view_distribution,
            can_view_ai_verdict: detailedCase.can_view_ai_verdict,
            judge_analysis: detailedCase.judge_analysis,
            verdict_timer_ends: detailedCase.verdict_timer_ends,
            status: detailedCase.status,
          }
          : entry
      )));
    } catch {
      showToast('Case details could not be refreshed.', 'error');
    }
  }, [showToast]);

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
        filteredCasesCount={filteredCasesCount}
        onSubmitCase={() => openModal('submit')}
        onFeedback={() => openModal('feedback')}
        onBrowseDocket={handleBrowseDocket}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col xl:overflow-hidden">

        <DesktopTopBar
          totalCasesCount={totalCasesCount}
          filteredCasesCount={filteredCasesCount}
          activeFilterCount={activeFilterCount}
        />

        <main className="flex-1 overflow-hidden">
          <div className={`h-full grid gap-0 ${selectedCase ? 'xl:grid-cols-2' : 'xl:grid-cols-1'}`}>

            <CaseListPanel
              loading={loading}
              cases={cases}
              totalCasesCount={totalCasesCount}
              filteredCasesCount={filteredCasesCount}
              cats={cats}
              filteredCases={filteredCases}
              selectedCase={selectedCase}
              user={user}
              hasMoreCases={Boolean(nextPage)}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
              onCaseClick={openCase}
              onSubmitCase={() => openModal('submit')}
              onClearFilters={() => { setActiveCategory(null); setActiveSortFilter('all'); }}
              listRef={caseListRef}
            />

            <CaseDetailPanel
              selectedCase={selectedCase}
              showToast={showToast}
              onRefresh={refreshSelectedCase}
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
              onSuccess={() => { setModalType(null); fetchContent({ syncSelection: true }); }}
              showToast={showToast}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
