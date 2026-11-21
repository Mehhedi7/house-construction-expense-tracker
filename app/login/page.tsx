'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // If user already has an active session, redirect directly to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/');
      } else {
        setCheckingSession(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error(
          'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your project.'
        );
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        if (data.session) {
          router.replace('/');
        } else if (data.user) {
          setInfoMsg(
            'Account created successfully! If email confirmation is enabled on your Supabase project, check your inbox to confirm your account before logging in.'
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        if (data.session) {
          router.replace('/');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-200 border-t-[#166534] rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center px-4 py-8">
      {/* Missing configuration notice */}
      {!isSupabaseConfigured && (
        <div className="w-full max-w-md mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          <p className="font-semibold mb-1">⚙️ Supabase credentials not configured</p>
          <p className="text-xs text-amber-800">
            Please configure <code className="bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your Vercel project environment variables.
          </p>
        </div>
      )}

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft border border-gray-100 p-8 sm:p-10 transition-all">
        {/* Brand Header */}
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

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <span className="text-base leading-none mt-0.5">⚠️</span>
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Info notification */}
        {infoMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
            <span className="text-base leading-none mt-0.5">✅</span>
            <span className="flex-1">{infoMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#212121] text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold text-white bg-[#166534] hover:bg-[#14532d] active:scale-[0.99] transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isSignUp ? 'Creating account...' : 'Logging in...'}</span>
              </>
            ) : (
              <span>{isSignUp ? 'Sign up' : 'Log in'}</span>
            )}
          </button>
        </form>

        {/* Toggle between Login and Sign Up */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          {isSignUp ? (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="font-semibold text-[#166534] hover:underline focus:outline-none cursor-pointer"
              >
                Log in
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="font-semibold text-[#166534] hover:underline focus:outline-none cursor-pointer"
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
