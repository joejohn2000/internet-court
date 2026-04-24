import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Scale } from 'lucide-react';

import { useLoading } from '../context/LoadingContext';

const loaderMessages = [
  'Reviewing filings',
  'Syncing evidence',
  'Updating the docket',
];

const GlobalLoader = () => {
  const MotionDiv = motion.div;
  const MotionSpan = motion.span;
  const MotionP = motion.p;
  const { isLoading } = useLoading();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return undefined;

    const timer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % loaderMessages.length);
    }, 900);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <MotionDiv
          className="loading-veil"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <MotionDiv
            className="loading-panel"
            initial={{ y: 18, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="loading-seal">
              <MotionSpan
                className="loading-seal-ring"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              />
              <Scale size={18} />
            </div>

            <div className="min-w-0">
              <p className="loading-label">Court systems active</p>
              <MotionP
                key={loaderMessages[messageIndex]}
                className="loading-message"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {loaderMessages[messageIndex]}
              </MotionP>
            </div>

            <div className="loading-bar" aria-hidden="true">
              <MotionSpan
                className="loading-bar-fill"
                animate={{ x: ['-120%', '180%'] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;
