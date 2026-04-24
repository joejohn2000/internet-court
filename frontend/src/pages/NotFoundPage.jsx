import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const MotionDiv = motion.div;
  const MotionH1 = motion.h1;
  const navigate = useNavigate();

  return (
    <div className="not-found-root">
      <style>{`
        .not-found-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0b;
          font-family: 'Georgia', serif;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .not-found-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 79px,
              rgba(255,255,255,0.02) 79px,
              rgba(255,255,255,0.02) 80px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 79px,
              rgba(255,255,255,0.02) 79px,
              rgba(255,255,255,0.02) 80px
            );
          pointer-events: none;
        }

        .nf-card {
          position: relative;
          width: 100%;
          max-width: 580px;
          background: #111113;
          border: 1px solid rgba(255,255,255,0.08);
          border-top: 3px solid #c9a84c;
          padding: 3.5rem 3rem;
          text-align: center;
        }

        .nf-seal {
          width: 72px;
          height: 72px;
          margin: 0 auto 2rem;
          position: relative;
        }

        .nf-seal svg {
          width: 100%;
          height: 100%;
        }

        .nf-divider-top {
          width: 40px;
          height: 1px;
          background: #c9a84c;
          margin: 0 auto 1.5rem;
        }

        .nf-case-label {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          letter-spacing: 0.25em;
          color: #c9a84c;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .nf-code {
          font-family: 'Georgia', serif;
          font-size: clamp(5rem, 18vw, 8rem);
          font-weight: normal;
          color: #ffffff;
          line-height: 1;
          margin: 0 0 0.25rem;
          letter-spacing: -0.02em;
        }

        .nf-ruling {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          margin-bottom: 2rem;
        }

        .nf-divider-mid {
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 0 0 2rem;
          position: relative;
        }

        .nf-divider-mid::before,
        .nf-divider-mid::after {
          content: '';
          position: absolute;
          top: -3px;
          width: 6px;
          height: 6px;
          background: #c9a84c;
          transform: rotate(45deg);
        }

        .nf-divider-mid::before { left: 0; }
        .nf-divider-mid::after { right: 0; }

        .nf-title {
          font-family: 'Georgia', serif;
          font-size: 1.125rem;
          font-weight: normal;
          color: rgba(255,255,255,0.85);
          margin: 0 0 0.75rem;
          letter-spacing: 0.01em;
        }

        .nf-body {
          font-family: 'Georgia', serif;
          font-size: 0.9375rem;
          color: rgba(255,255,255,0.4);
          line-height: 1.75;
          margin: 0 0 2.5rem;
          font-style: italic;
        }

        .nf-stamp {
          display: inline-block;
          border: 2px solid rgba(180, 30, 30, 0.6);
          color: rgba(180, 30, 30, 0.7);
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding: 0.35rem 1rem;
          transform: rotate(-2deg);
          margin-bottom: 2.5rem;
        }

        .nf-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          background: transparent;
          border: 1px solid rgba(201, 168, 76, 0.5);
          color: #c9a84c;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.875rem 2rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .nf-btn:hover {
          background: rgba(201, 168, 76, 0.08);
          border-color: #c9a84c;
          color: #e8c96a;
        }

        .nf-btn-arrow {
          font-size: 14px;
          transition: transform 0.2s ease;
        }

        .nf-btn:hover .nf-btn-arrow {
          transform: translateX(3px);
        }

        .nf-footer {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          font-family: 'Courier New', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.15);
          text-transform: uppercase;
        }

        @media (max-width: 480px) {
          .nf-card {
            padding: 2.5rem 1.5rem;
          }
        }
      `}</style>

      <MotionDiv
        className="nf-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Seal */}
        <div className="nf-seal">
          <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="33" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.5" />
            <circle cx="36" cy="36" r="28" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.3" />
            {[...Array(24)].map((_, i) => {
              const angle = (i * 15 * Math.PI) / 180;
              const x1 = 36 + 29 * Math.cos(angle);
              const y1 = 36 + 29 * Math.sin(angle);
              const x2 = 36 + 32 * Math.cos(angle);
              const y2 = 36 + 32 * Math.sin(angle);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a84c" strokeWidth="0.75" strokeOpacity="0.4" />;
            })}
            {/* Scales of justice */}
            <line x1="36" y1="20" x2="36" y2="52" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.8" />
            <line x1="24" y1="28" x2="48" y2="28" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.8" />
            <line x1="24" y1="28" x2="20" y2="38" stroke="#c9a84c" strokeWidth="0.75" strokeOpacity="0.7" />
            <line x1="48" y1="28" x2="52" y2="38" stroke="#c9a84c" strokeWidth="0.75" strokeOpacity="0.7" />
            <path d="M17 38 Q20 42 23 38" stroke="#c9a84c" strokeWidth="0.75" fill="none" strokeOpacity="0.7" />
            <path d="M49 38 Q52 42 55 38" stroke="#c9a84c" strokeWidth="0.75" fill="none" strokeOpacity="0.7" />
            <line x1="32" y1="52" x2="40" y2="52" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.8" />
          </svg>
        </div>

        <div className="nf-divider-top" />

        <div className="nf-case-label">Case No. ERR-404 · Not Found</div>

        <MotionH1
          className="nf-code"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          404
        </MotionH1>

        <div className="nf-ruling">Judgment rendered</div>

        <div className="nf-divider-mid" />

        <h2 className="nf-title">This page does not exist in our records</h2>
        <p className="nf-body">
          The court has reviewed the submitted URL and finds no corresponding
          case, exhibit, or proceeding on file. The requested resource has
          either been removed, relocated, or never existed.
        </p>

        <div className="nf-stamp">Case Dismissed</div>

        <br />

        <button className="nf-btn" onClick={() => navigate('/')}>
          Return to Court
          <span className="nf-btn-arrow">→</span>
        </button>

        <div className="nf-footer">
          Internet Court · All proceedings are final
        </div>
      </MotionDiv>
    </div>
  );
};

export default NotFoundPage;
