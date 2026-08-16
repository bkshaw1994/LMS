'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-dot-pattern">
      <div className="w-full max-w-md space-y-6">
        {/* Top Header Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black tracking-wider uppercase">12-Week Full-Stack Bootcamp</span>
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Student Registration
          </h1>
          <p className="text-slate-600 text-xs font-medium max-w-sm mx-auto leading-relaxed">
            Create your student account to get instant access to all 12 modules, YouTube video lectures, and project submissions.
          </p>
        </div>

        {/* Main Card */}
        <div className="light-card p-8 rounded-3xl border border-slate-200 shadow-xl bg-white space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Developer"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center space-x-2 gradient-bg-indigo text-white font-black py-3.5 rounded-xl text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link Footer */}
          <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
            Already registered?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-extrabold underline">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
