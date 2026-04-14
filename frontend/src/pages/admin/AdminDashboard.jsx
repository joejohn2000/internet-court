import React, { useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart2,
  FolderKanban,
  Layers,
  LogOut,
  Menu,
  MessageCircle,
  PlusCircle,
  Shield,
  X
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { fadeIn } from '../../lib/animations';
import AdminCasesPage from './AdminCasesPage';
import AdminDomainsPage from './AdminDomainsPage';
import AdminFeedbackPage from './AdminFeedbackPage';
import AdminOperatorsPage from './AdminOperatorsPage';
import AdminOverviewPage from './AdminOverviewPage';

const adminSections = [
  {
    path: 'overview',
    label: 'Overview',
    description: 'System health and quick actions',
    icon: BarChart2,
    title: 'Admin Overview',
    subtitle: 'A calm command center for case activity, citizens, and next actions.'
  },
  {
    path: 'cases',
    label: 'Cases',
    description: 'Review, filter, and manage disputes',
    icon: FolderKanban,
    title: 'Case Management',
    subtitle: 'Find the right docket quickly, update records, and remove unsafe entries.'
  },
  {
    path: 'domains',
    label: 'Domains',
    description: 'Organize public case categories',
    icon: Layers,
    title: 'Domain Pages',
    subtitle: 'Keep each category clean, named clearly, and ready for new cases.'
  },
  {
    path: 'feedback',
    label: 'Feedback',
    description: 'Read reports from users',
    icon: MessageCircle,
    title: 'Feedback Inbox',
    subtitle: 'Review bug reports, feature requests, and notes from the public.'
  },
  {
    path: 'operators',
    label: 'Operators',
    description: 'Invite admins and review users',
    icon: PlusCircle,
    title: 'Operator Access',
    subtitle: 'Create administrator accounts and audit who can access the court.'
  }
];

const getCurrentSection = (pathname) => (
  adminSections.find(section => pathname.includes(`/admin/${section.path}`)) || adminSections[0]
);

const AdminDashboard = ({ showToast }) => {
  const { user, handleLogout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentSection = getCurrentSection(location.pathname);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      <button
        className="admin-mobile-toggle"
        type="button"
        aria-label={sidebarOpen ? 'Close admin menu' : 'Open admin menu'}
        aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen(open => !open)}
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        <span>Menu</span>
      </button>

      {sidebarOpen && (
        <button
          className="admin-sidebar-scrim"
          type="button"
          aria-label="Close admin navigation"
          onClick={closeSidebar}
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <img src="/assets/logo.png" alt="Internet Court" />
          <div>
            <span>Internet Court</span>
            <h2 className="font-serif">Admin Console</h2>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin sections">
          {adminSections.map(({ path, label, description, icon: Icon }) => (
            <NavLink
              key={path}
              to={`/admin/${path}`}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Icon size={20} />
              <span>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="nav-user-chip admin-user-chip">
            <Shield size={14} />
            <span>{user?.username || 'Admin'}</span>
          </div>
          <button
            id="admin-logout"
            className="admin-nav-item logout-item"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>
              <strong>Sign Out</strong>
              <small>Leave the console</small>
            </span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Restricted console</p>
            <h1 className="font-serif">{currentSection.title}</h1>
            <p>{currentSection.subtitle}</p>
          </div>
          <div className="admin-status-pill" aria-label="System status">
            <span />
            Operational
          </div>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={location.pathname} {...fadeIn} className="admin-route-body">
            <Routes>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminOverviewPage />} />
              <Route path="cases" element={<AdminCasesPage showToast={showToast} />} />
              <Route path="domains" element={<AdminDomainsPage showToast={showToast} />} />
              <Route path="feedback" element={<AdminFeedbackPage />} />
              <Route path="operators" element={<AdminOperatorsPage showToast={showToast} />} />
              <Route path="*" element={<Navigate to="overview" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
