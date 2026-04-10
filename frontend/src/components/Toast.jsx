import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Toast = ({ toast }) => (
  <AnimatePresence>
    {toast && (
      <motion.div
        initial={{ opacity: 0, y: 50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 20, x: '-50%' }}
        className="toast glass"
        style={{
          position: 'fixed', bottom: '40px', left: '50%', zIndex: 9999,
          padding: '16px 32px', borderRadius: '12px', borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#f43f5e'}`,
          display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, minWidth: '320px'
        }}
      >
        {toast.type === 'success' ? <CheckCircle2 color="#10b981" /> : <AlertCircle color="#f43f5e" />}
        <span>{toast.msg}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Toast;
