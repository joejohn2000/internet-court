import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios, { API } from '../lib/api';
import { slideUp } from '../lib/animations';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_SCRIPT_ID = 'google-identity-services';

const LoginPage = ({ showToast }) => {
  const MotionDiv = motion.div;
  const navigate = useNavigate();
  const { handleAuthSuccess } = useAuth();
  const googleButtonRef = useRef(null);
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(Boolean(GOOGLE_CLIENT_ID));

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

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return undefined;

    const initializeGoogleButton = () => {
      const google = window.google;
      if (!google?.accounts?.id || !googleButtonRef.current) {
        setGoogleLoading(false);
        return;
      }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          if (!credential) {
            showToast('Google sign-in did not return a credential.', 'error');
            return;
          }

          setLoading(true);
          try {
            const res = await axios.post(`${API}/users/google-login/`, {
              client_id: GOOGLE_CLIENT_ID,
              credential,
            });
            handleAuthSuccess(res.data, false);
          } catch (err) {
            showToast(err.response?.data?.error || 'Google authentication failed.', 'error');
          }
          setLoading(false);
        },
      });

      googleButtonRef.current.innerHTML = '';
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        type: 'icon',
        size: 'large',
        shape: 'circle',
        logo_alignment: 'center',
        width: 44,
      });

      setGoogleReady(true);
      setGoogleLoading(false);
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
      return undefined;
    }

    let script = document.getElementById(GOOGLE_SCRIPT_ID);
    const handleLoad = () => initializeGoogleButton();
    const handleError = () => {
      setGoogleLoading(false);
      showToast('Failed to load Google sign-in.', 'error');
    };

    if (!script) {
      script = document.createElement('script');
      script.id = GOOGLE_SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);
    }

    return () => {
      script?.removeEventListener('load', handleLoad);
      script?.removeEventListener('error', handleError);
    };
  }, [handleAuthSuccess, showToast]);

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

            <div className="mt-6 border-t border-slate-900/10 pt-5">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Google sign-in
              </p>
              {GOOGLE_CLIENT_ID ? (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <div ref={googleButtonRef} className="min-h-11" />
                  <p className="text-center text-sm leading-6 text-slate-500">
                    Tap the Google icon to sign in instantly.
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-center text-sm leading-6 text-slate-500">
                  Google sign-in will appear here after `VITE_GOOGLE_CLIENT_ID` is configured.
                </p>
              )}
              {GOOGLE_CLIENT_ID && googleLoading && (
                <p className="mt-3 text-center text-sm text-slate-500">Loading Google sign-in...</p>
              )}
              {GOOGLE_CLIENT_ID && !googleLoading && !googleReady && (
                <p className="mt-3 text-center text-sm text-slate-500">
                  Google sign-in is unavailable right now. Please try username and password instead.
                </p>
              )}
            </div>

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
