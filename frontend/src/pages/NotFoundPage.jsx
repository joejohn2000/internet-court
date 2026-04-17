import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { fadeIn } from '../lib/animations';

const NotFoundPage = () => {
  const MotionDiv = motion.div;
  const navigate = useNavigate();

  return (
    <MotionDiv
      {...fadeIn}
      className="page-shell flex items-center"
    >
      <div className="content-shell py-10">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-md border border-white/10 bg-black/40 px-6 py-12 text-center shadow-[0_20px_45px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:px-10">
          <Shield size={56} className="mb-6 text-amber-300/80" />
          <h1 className="font-serif text-6xl leading-none text-white sm:text-8xl">404</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-300 sm:text-lg">
            This case does not exist in our records.
          </p>
          <button className="btn-primary mt-8 w-full sm:w-auto" onClick={() => navigate('/')}>
            Return to Court
          </button>
        </div>
      </div>
    </MotionDiv>
  );
};

export default NotFoundPage;
