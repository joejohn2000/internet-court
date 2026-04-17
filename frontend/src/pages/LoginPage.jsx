import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios, { API } from '../lib/api';
import { slideUp } from '../lib/animations';

const LoginPage = ({ showToast }) => {
  const MotionDiv = motion.div;
  const navigate = useNavigate();
  const { handleAuthSuccess } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/users/login/`, form);
      handleAuthSuccess(res.data, false);
    } catch (err) {
      showToast(err.response?.data?.error || 'Authentication failed.', 'error');
    }
    setLoading(false);
  };

  return (
    <MotionDiv {...slideUp} className="page-shell flex items-center py-8 sm:py-12">
      <div className="content-shell">
        <div className="mx-auto w-full max-w-md">
          <div className="panel-paper relative p-5 sm:p-8">
            <button
              className="btn-paper absolute right-4 top-4 min-h-10 px-3 py-2"
              onClick={() => navigate('/')}
              aria-label="Back to landing page"
            >
              <X size={18} />
            </button>

            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-900/10 bg-white/70 text-court-accent shadow-sm">
              <Shield size={28} />
            </div>
            <h1 className="mt-5 font-serif text-3xl leading-tight text-slate-950 sm:text-4xl">Authorization</h1>
            <p className="mt-2 border-b border-slate-900/10 pb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
              Citizenship ID verification
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
              <div>
                <label htmlFor="user-login-username" className="field-label">Username</label>
                <input
                  id="user-login-username"
                  className="input-field"
                  placeholder="e.g. adjudicator_7"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="user-login-password" className="field-label">Password</label>
                <div className="relative">
                  <input
                    id="user-login-password"
                    type={showPassword ? "text" : "password"}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                id="user-login-submit"
                className="btn-primary mt-1 w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Access Court'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm leading-6 text-slate-600">
              New to the court?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-bold text-court-accent transition hover:text-court-accent-deep"
              >
                Create an ID
              </button>
            </p>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default LoginPage;
