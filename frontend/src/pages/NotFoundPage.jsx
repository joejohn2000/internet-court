import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { fadeIn } from '../lib/animations';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      {...fadeIn}
      className="auth-page"
      style={{ flexDirection: 'column', textAlign: 'center' }}
    >
      <Shield size={64} color="var(--accent)" style={{ marginBottom: '32px', opacity: 0.5 }} />
      <h1 className="font-serif" style={{ fontSize: '8rem', color: '#fff', lineHeight: 0.9, marginBottom: '16px' }}>404</h1>
      <p style={{ fontSize: '1.4rem', color: 'var(--text-on-dark)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '48px' }}>
        This case does not exist in our records.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/')} style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
        Return to Court
      </button>
    </motion.div>
  );
};

export default NotFoundPage;
