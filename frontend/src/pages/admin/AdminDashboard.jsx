import React, { useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
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
    <div className="min-h-screen bg-court-ink text-slate-50 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <button
        className="fixed bottom-4 left-4 right-4 z-50 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-court-accent px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-950 shadow-[0_14px_34px_rgba(0,0,0,0.42)] lg:hidden"
        type="button"
        aria-label={sidebarOpen ? 'Close admin menu' : 'Open admin menu'}
        aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen(open => !open)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        <span>Admin menu</span>
      </button>

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          type="button"
          aria-label="Close admin navigation"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(280px,calc(100vw-2rem))] flex-col border-r border-white/10 bg-black/96 transition-transform lg:static lg:w-auto lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/8 px-5 py-5">
          <img src="/assets/logo.png" alt="Internet Court" className="h-11 w-auto" />
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Internet Court</span>
            <h2 className="mt-1 font-serif text-xl text-white">Admin Console</h2>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin sections">
          {adminSections.map(({ path, label, description, icon: Icon }) => (
            <NavLink
              key={path}
              to={`/admin/${path}`}
              className={({ isActive }) =>
                `flex items-start gap-3 rounded-md border px-3 py-3 text-left transition ${
                  isActive
                    ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
                    : 'border-transparent text-slate-300 hover:border-white/8 hover:bg-white/5 hover:text-white'
                }`
              }
              onClick={closeSidebar}
            >
              {React.createElement(Icon, { size: 18, className: 'mt-0.5 shrink-0' })}
              <span className="min-w-0">
                <strong className="block text-sm font-semibold">{label}</strong>
                <small className="mt-1 block text-xs leading-5 text-slate-400">{description}</small>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-white/8 px-4 py-4">
          <div className="chip justify-start">
            <Shield size={14} />
            <span>{user?.username || 'Admin'}</span>
          </div>
          <button
            id="admin-logout"
            className="btn-secondary w-full border-rose-500/20 text-rose-200 hover:bg-rose-500/10"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Restricted console</p>
            <h1 className="mt-2 font-serif text-3xl text-white sm:text-4xl lg:text-5xl">{currentSection.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">{currentSection.subtitle}</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.8)]" />
            Operational
          </div>
        </header>

        <div key={location.pathname} className="grid gap-5 sm:gap-6">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverviewPage />} />
            <Route path="cases" element={<AdminCasesPage showToast={showToast} />} />
            <Route path="domains" element={<AdminDomainsPage showToast={showToast} />} />
            <Route path="feedback" element={<AdminFeedbackPage />} />
            <Route path="operators" element={<AdminOperatorsPage showToast={showToast} />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
