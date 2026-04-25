// components/layout/CaseDetailPanel.jsx
import { AnimatePresence, motion } from 'framer-motion';
import CaseDetail from '../CaseDetail';

const MotionSection = motion.section;

const CaseDetailPanel = ({ selectedCase, showToast, onRefresh, onClose }) => (
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
            onRefresh={onRefresh}
            onClose={onClose}
          />
        </MotionSection>
      </div>
    )}
  </AnimatePresence>
);

export default CaseDetailPanel;
