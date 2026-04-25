// components/layout/MobileNav.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Menu, X, PlusCircle, History, BookOpen, MessageCircle, LogOut } from 'lucide-react';
import SideNavItem from '../sidebar/SideNavItem';

const MotionDiv = motion.div;

const MobileNav = ({
  user,
  mobileMenuOpen,
  setMobileMenuOpen,
  selectedCase,
  cases,
  onSubmitCase,
  onFeedback,
  onBrowseDocket,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 shrink-0 border-b border-white/8 bg-[#0a0a0b]/95 backdrop-blur xl:hidden">
      <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <button
            type="button"
            className="flex min-w-0 items-center gap-2.5 rounded-md px-1 py-1 transition hover:bg-white/5"
            onClick={onBrowseDocket}
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
            <MotionDiv
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
                    onClick={onSubmitCase}
                  />
                )}
                {!user?.is_guest && (
                  <SideNavItem
                    icon={History}
                    label="Case History"
                    onClick={() => {
                      navigate('/history');
                      setMobileMenuOpen(false);
                    }}
                  />
                )}
                <SideNavItem
                  icon={BookOpen}
                  label="Browse Docket"
                  isActive={!selectedCase}
                  badge={cases.length || undefined}
                  onClick={onBrowseDocket}
                />
                <SideNavItem
                  icon={MessageCircle}
                  label="Send Feedback"
                  onClick={onFeedback}
                />
                <SideNavItem
                  icon={LogOut}
                  label="Log Out"
                  variant="danger"
                  onClick={onLogout}
                />
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default MobileNav;
