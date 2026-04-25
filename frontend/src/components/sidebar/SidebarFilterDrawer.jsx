// components/sidebar/SidebarFilterDrawer.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Clock, TrendingUp, CheckCircle2, Tag } from 'lucide-react';
import FilterChip from './FilterChip';

const MotionDiv = motion.div;

const SidebarFilterDrawer = ({
  collapsed,
  isOpen,
  cats,
  activeCategory,
  setActiveCategory,
  activeSortFilter,
  setActiveSortFilter,
  filteredCount,
  totalCount,
}) => (
  <AnimatePresence initial={false}>
    {!collapsed && isOpen && (
      <MotionDiv
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
            <FilterChip
              label="All"
              active={activeSortFilter === 'all'}
              onClick={() => setActiveSortFilter('all')}
              icon={Filter}
            />
            <FilterChip
              label="Recent"
              active={activeSortFilter === 'recent'}
              onClick={() => setActiveSortFilter('recent')}
              icon={Clock}
            />
            <FilterChip
              label="Trending"
              active={activeSortFilter === 'trending'}
              onClick={() => setActiveSortFilter('trending')}
              icon={TrendingUp}
            />
            <FilterChip
              label="Resolved"
              active={activeSortFilter === 'resolved'}
              onClick={() => setActiveSortFilter('resolved')}
              icon={CheckCircle2}
            />
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
            {filteredCount} of {totalCount} cases
          </p>
        </div>
      </MotionDiv>
    )}
  </AnimatePresence>
);

export default SidebarFilterDrawer;
