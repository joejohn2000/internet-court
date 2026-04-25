// components/sidebar/Sidebar.jsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, History, BookOpen, MessageCircle, LogOut } from 'lucide-react';

import SideLabel from './SideLabel';
import SideNavItem from './SideNavItem';
import SidebarUserCard from './SidebarUserCard';
import SidebarFooter from './SidebarFooter';
import SidebarFilterDrawer from './SidebarFilterDrawer';

const MotionAside = motion.aside;
const MotionDiv = motion.div;

const Sidebar = ({
  collapsed,
  onMouseEnter,
  onMouseLeave,
  user,
  cases,
  cats,
  selectedCase,
  docketOpen,
  setDocketOpen,
  activeCategory,
  setActiveCategory,
  activeSortFilter,
  setActiveSortFilter,
  filteredCases,
  onSubmitCase,
  onFeedback,
  onBrowseDocket,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <MotionAside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="hidden xl:flex xl:shrink-0 xl:flex-col xl:border-r xl:border-white/8 xl:bg-[#0c0c0e] xl:overflow-hidden z-30"
      style={{ willChange: 'width' }}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-white/8 py-[18px] transition-all duration-260 ${
          collapsed ? 'justify-center px-0' : 'gap-3 px-5'
        }`}
      >
        <button
          type="button"
          className="flex min-w-0 items-center gap-3 rounded-md transition hover:opacity-80"
          onClick={onBrowseDocket}
        >
          <img src="/assets/logo.png" alt="Internet Court" className="h-9 w-auto shrink-0" />
          <MotionDiv
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            transition={{ duration: 0.18 }}
            className="min-w-0 overflow-hidden"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300 whitespace-nowrap">
              Internet Court
            </p>
            <p className="text-[10px] text-slate-600 tracking-wide whitespace-nowrap">
              Public Docket
            </p>
          </MotionDiv>
        </button>
      </div>

      {/* User Card */}
      <SidebarUserCard user={user} collapsed={collapsed} />

      {/* Nav */}
      <nav
        className={`flex-1 overflow-y-auto overflow-x-hidden py-3 transition-all duration-260 ${
          collapsed ? 'px-2' : 'px-3'
        }`}
      >
        <SideLabel collapsed={collapsed}>Actions</SideLabel>
        {user && (
          <SideNavItem
            icon={PlusCircle}
            label="Submit Docket"
            variant="primary"
            onClick={onSubmitCase}
            collapsed={collapsed}
          />
        )}

        <SideLabel collapsed={collapsed}>Navigate</SideLabel>
        {!user?.is_guest && (
          <SideNavItem
            icon={History}
            label="Case History"
            isActive={false}
            onClick={() => navigate('/history')}
            collapsed={collapsed}
          />
        )}

        <SideNavItem
          icon={BookOpen}
          label="Browse Docket"
          isActive={!selectedCase}
          badge={!collapsed ? (cases.length || undefined) : undefined}
          onClick={() => {
            if (!collapsed && !selectedCase) {
              setDocketOpen((o) => !o);
            } else {
              onBrowseDocket();
              setDocketOpen(true);
            }
          }}
          collapsed={collapsed}
          hasChildren={!collapsed}
          isOpen={docketOpen}
        />

        <SidebarFilterDrawer
          collapsed={collapsed}
          isOpen={docketOpen}
          cats={cats}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeSortFilter={activeSortFilter}
          setActiveSortFilter={setActiveSortFilter}
          filteredCount={filteredCases.length}
          totalCount={cases.length}
        />

        <SideLabel collapsed={collapsed}>Support</SideLabel>
        <SideNavItem
          icon={MessageCircle}
          label="Send Feedback"
          onClick={onFeedback}
          collapsed={collapsed}
        />

        <SideLabel collapsed={collapsed}>Account</SideLabel>
        <SideNavItem
          icon={LogOut}
          label="Log Out"
          variant="danger"
          onClick={onLogout}
          collapsed={collapsed}
        />
      </nav>

      <SidebarFooter collapsed={collapsed} caseCount={cases.length} />
    </MotionAside>
  );
};

export default Sidebar;
