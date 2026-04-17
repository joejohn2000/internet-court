import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fadeIn, spring } from '../lib/animations';

const LandingPage = () => {
  const MotionDiv = motion.div;
  const MotionH1 = motion.h1;
  const MotionP = motion.p;
  const MotionSection = motion.section;
  const navigate = useNavigate();
  const { handleGuest } = useAuth();

  return (
    <MotionDiv
      {...fadeIn}
      className="page-shell flex items-center"
    >
      <div className="content-shell flex min-h-screen items-center py-10 sm:py-16">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center lg:gap-12">
          <section className="order-2 space-y-6 text-center lg:order-1 lg:text-left">
            <MotionDiv
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-200"
            >
              Public juries. Faster verdicts.
            </MotionDiv>

            <MotionH1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-5xl leading-none text-white sm:text-6xl lg:text-7xl"
            >
              Internet
              <span className="mt-2 block text-amber-300">Court</span>
            </MotionH1>

            <MotionP
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mx-auto max-w-2xl text-base leading-7 text-slate-300 sm:text-lg lg:mx-0 lg:text-xl"
            >
              Bring a dispute, let the crowd weigh the evidence, and follow the verdict without fighting the interface.
            </MotionP>

            <MotionDiv
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <button
                id="landing-login"
                className="btn-primary w-full sm:w-auto sm:min-w-52"
                onClick={() => navigate('/login')}
              >
                <Shield size={20} />
                <span>Enter Court</span>
              </button>
              <button
                id="landing-guest"
                className="btn-secondary w-full sm:w-auto sm:min-w-52"
                onClick={handleGuest}
              >
                <Eye size={20} />
                <span>Spectate</span>
              </button>
            </MotionDiv>
          </section>

          <MotionSection
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...spring, delay: 0.1 }}
            className="order-1 panel-dark overflow-hidden p-4 sm:p-6 lg:order-2"
          >
            <div className="rounded-md border border-white/10 bg-gradient-to-br from-white/8 via-white/4 to-transparent p-6 sm:p-8">
              <div className="flex items-center justify-center sm:justify-start">
                <img
                  src="/assets/logo.png"
                  alt="Internet Court"
                  className="h-24 w-auto drop-shadow-[0_0_24px_rgba(255,255,255,0.12)] sm:h-28"
                />
              </div>
              <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
                {[
                  ['Browse dockets', 'Read active cases with clean summaries and live vote data.'],
                  ['Vote quickly', 'Large verdict actions stay thumb-friendly on smaller screens.'],
                  ['Track outcomes', 'Check your history and admin work without cramped tables.']
                ].map(([title, text]) => (
                  <div key={title} className="rounded-md border border-white/8 bg-black/30 p-4">
                    <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-amber-200">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </MotionSection>
        </div>
      </div>
    </MotionDiv>
  );
};

export default LandingPage;
