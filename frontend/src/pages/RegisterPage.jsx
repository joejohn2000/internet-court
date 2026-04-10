import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios, { API } from '../lib/api';
import { slideUp } from '../lib/animations';

const RegisterPage = ({ showToast }) => {
  const navigate = useNavigate();
  const { handleAuthSuccess } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/users/register/`, form);
      handleAuthSuccess(res.data, true);
    } catch (err) {
      showToast(err.response?.data?.error || 'Registration failed.', 'error');
    }
    setLoading(false);
  };

  return (
    <motion.div {...slideUp} className="auth-page">
      <div className="auth-card">
        <button className="btn btn-glass" onClick={() => navigate('/')} style={{ position: 'absolute', top: '24px', right: '24px', padding: '10px' }}>
          <X size={20} />
        </button>

        <div className="auth-icon-wrap">
          <UserPlus size={32} color="var(--accent)" />
        </div>
        <h2 className="auth-title">Enlistment</h2>
        <p className="auth-sub">Register for the Global Jury Pool</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="user-register-username">Username</label>
            <input
              id="user-register-username"
              className="form-input"
              placeholder="e.g. adjudicator_7"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="reg-email">Email (to verify status)</label>
            <input id="reg-email" className="form-input" type="email" placeholder="juror@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field-group">
            <label htmlFor="user-register-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="user-register-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ paddingRight: '48px' }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} className="eye-blink" />}
              </button>
            </div>
          </div>
          <button id="user-register-submit" className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '16px', minHeight: '56px', marginBottom: '24px' }}>
            {loading ? 'Processing...' : 'Register for Service'}
          </button>
        </form>
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          Already registered? <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Sign in here</button>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
