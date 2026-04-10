import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fadeIn, spring } from '../lib/animations';

const LandingPage = () => {
  const navigate = useNavigate();
  const { handleGuest } = useAuth();

  return (
    <motion.div
      {...fadeIn}
      className="auth-page"
      style={{ flexDirection: 'column', textAlign: 'center' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.1 }}
        style={{ marginBottom: '60px' }}
      >
        <img src="/assets/logo.png" alt="Logo" className="logo-img" style={{ height: '180px', width: 'auto' }} />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="hero-title"
      >
        Internet COURT
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: '1.65rem', color: 'var(--text-on-dark)', fontWeight: 300, maxWidth: '800px', margin: '0 auto 60px', textTransform: 'uppercase', letterSpacing: '4px' }}
      >
        Where the masses settle the score.<br />Face the verdict.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="hero-actions"
      >
        <button id="landing-login" className="btn btn-primary hero-btn" onClick={() => navigate('/login')}>
          <Shield size={24} /><span>Enter Court</span>
        </button>
        <button id="landing-guest" className="btn btn-glass hero-btn" onClick={handleGuest}>
          <Eye size={24} /><span>Spectate</span>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;
