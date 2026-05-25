import React, { useEffect, useRef, useState } from 'react';

import axios, { API } from '../lib/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_SCRIPT_ID = 'google-identity-services';

const GoogleMark = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 10.2v3.92h5.45c-.24 1.26-.96 2.33-2.03 3.05l3.28 2.54c1.91-1.76 3.01-4.36 3.01-7.46 0-.72-.06-1.4-.19-2.05H12Z"
    />
    <path
      fill="#4285F4"
      d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.28-2.54c-.91.61-2.08.97-3.35.97-2.57 0-4.74-1.74-5.51-4.08H3.11v2.61A9.99 9.99 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.49 13.91A5.98 5.98 0 0 1 6.18 12c0-.66.11-1.31.31-1.91V7.48H3.11A9.99 9.99 0 0 0 2 12c0 1.61.38 3.14 1.11 4.52l3.38-2.61Z"
    />
    <path
      fill="#34A853"
      d="M12 6.01c1.47 0 2.79.51 3.83 1.51l2.87-2.87C16.97 3.03 14.7 2 12 2a9.99 9.99 0 0 0-8.89 5.48l3.38 2.61c.77-2.34 2.94-4.08 5.51-4.08Z"
    />
  </svg>
);

const GoogleSignInPanel = ({ handleAuthSuccess, showToast, setLoading, helperText }) => {
  const googleButtonRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(Boolean(GOOGLE_CLIENT_ID));
  const originHint = typeof window !== 'undefined' ? window.location.origin : '';

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
            const res = await axios.post(`${API}/users/google-login/`, { credential });
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
        type: 'standard',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 320,
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
  }, [handleAuthSuccess, setLoading, showToast]);

  return (
    <div className="mt-6 border-t border-slate-900/10 pt-5">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Google sign-in
      </p>
      {GOOGLE_CLIENT_ID ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="relative w-full max-w-xs">
            <div className="pointer-events-none flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm">
              <GoogleMark />
              <span>Continue with Google</span>
            </div>
            <div
              ref={googleButtonRef}
              className="absolute inset-0 overflow-hidden rounded-2xl opacity-0"
              aria-hidden="true"
            />
          </div>
          <p className="text-center text-sm leading-6 text-slate-500">
            {helperText || 'Tap the Google icon to sign in instantly.'}
          </p>
          {originHint ? (
            <p className="text-center text-xs leading-5 text-slate-400">
              If Google rejects this sign-in, add <span className="font-semibold text-slate-500">{originHint}</span> to
              the client&apos;s authorized JavaScript origins.
            </p>
          ) : null}
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
  );
};

export default GoogleSignInPanel;
