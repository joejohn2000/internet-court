import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const MotionDiv = motion.div;

const Toast = ({ toast }) => (
  <AnimatePresence>
    {toast && (
      <MotionDiv
        initial={{ opacity: 0, y: 50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 20, x: '-50%' }}
        className={`fixed bottom-4 left-1/2 z-[9999] flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-md border border-white/10 bg-black/90 px-4 py-3 text-sm font-semibold text-slate-50 shadow-[0_16px_36px_rgba(0,0,0,0.4)] backdrop-blur md:bottom-6 md:px-5 ${
          toast.type === 'success'
            ? 'border-l-4 border-l-green-500'
            : 'border-l-4 border-l-rose-500'
        }`}
      >
        {toast.type === 'success' ? (
          <CheckCircle2 className="mt-0.5 shrink-0 text-green-500" size={20} />
        ) : (
          <AlertCircle className="mt-0.5 shrink-0 text-rose-500" size={20} />
        )}
        <span className="leading-6">{toast.msg}</span>
      </MotionDiv>
    )}
  </AnimatePresence>
);

export default Toast;
