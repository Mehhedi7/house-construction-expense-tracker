'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  // UI state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // new field for sign‑up
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // --------------------------------------------------------------------
  // 1️⃣ Redirect if a session already exists
  // --------------------------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard');
      } else {
        setCheckingSession(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // --------------------------------------------------------------------
  // 2️⃣ Form submit handler
  // --------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error(
          'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel project settings.'
        );
      }

      // ----------- SIGN‑UP -----------
      if (isSignUp) {
        // simple client‑side password match check
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        // if email‑confirmation is disabled, Supabase returns a session right away
        if (data.session) {
          router.replace('/dashboard');
        } else {
          // otherwise tell the user to confirm their email
          setInfoMsg(
            'Account created! Please check your inbox for the confirmation email before logging in.'
          );
        }
      }
      // ----------- LOG‑IN -----------
      else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.replace('/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------
  // 3️⃣ UI rendering
  // --------------------------------------------------------------------
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-200 border-t-[#166534] rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Checking session…</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center px-4 py-8">
      {/* 1️⃣ Missing‑config notice */}
      {!isSupabaseConfigured && (
        <div className="w-full max-w-md mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          <p className="font-semibold mb-1">⚙️ Supabase credentials not configured</p>
          <p className="text-xs">
            Please configure <code className="bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your Vercel project environment variables.
          </p>
        </div>
      )}

      {/* 2️⃣ Card container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-gray-100 p-8 sm:p-10 transition-all">
        {/* Brand & heading */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-sm">
            🏠
          </div>
          <h1 className="text-2xl font-bold text-[#212121] tracking-tight">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isSignUp
              ? 'Sign up to start tracking your construction expenses'
              : 'Log in to manage your house construction budget'}
          </p>
        </div>

        {/* 3️⃣ Error / info banners */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <span className="text-base leading-none mt-0.5">⚠️</span>
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}
        {infoMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
            <span className="text-base leading-none mt-0.5">✅</span>
            <span className="flex-1">{infoMsg}</span>
          </div>
        )}

        {/* 4️⃣ Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent transition"
            />
            {isSignUp && (
              <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          {/* Confirm password – only for sign‑up */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent transition"
              />
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold text-white bg-[#166534] hover:bg-[#14532d] active:scale-[0.99] transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isSignUp ? 'Signing up…' : 'Logging in…'}</span>
              </>
            ) : (
              <span>{isSignUp ? 'Sign up' : 'Log in'}</span>
            )}
          </button>
        </form>

        {/* 5️⃣ Toggle between modes */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          {isSignUp ? (
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg('');
                setInfoMsg('');
              }}
              className="text-sm text-gray-600 hover:text-[#166534] transition focus:outline-none cursor-pointer"
            >
              Already have an account?{' '}
              <span className="font-semibold text-[#166534] underline">Log in</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg('');
                setInfoMsg('');
              }}
              className="text-sm text-gray-600 hover:text-[#166534] transition focus:outline-none cursor-pointer"
            >
              Don’t have an account?{' '}
              <span className="font-semibold text-[#166534] underline">Sign up</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
