'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { 
  LogOut, 
  LayoutDashboard, 
  Sparkles, 
  Menu, 
  X, 
  ChevronDown,
  User,
  GraduationCap
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 light-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl gradient-bg-indigo flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">FullStack</span>
                <span className="font-extrabold text-lg gradient-text-light">Pro</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">12-Week Bootcamp</span>
            </div>
          </Link>

          {/* Navigation Items (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Curriculum Roadmap
            </Link>

            {user ? (
              /* User Dropdown Menu */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3.5 py-1.5 rounded-xl transition-all text-left focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-lg gradient-bg-indigo flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    {user.name ? user.name[0].toUpperCase() : 'S'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 leading-tight">{user.name}</span>
                    <span className="text-[10px] text-slate-500 capitalize font-medium">{user.role || 'Student'}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Card */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    {(user.role === 'trainer' || user.role === 'admin' || user.role === 'instructor') ? (
                      <Link
                        href="/trainer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/80 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Instructor Portal</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/80 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                          <span>Student Portal</span>
                        </Link>

                        <Link
                          href="/dashboard/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/80 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          <span>My Profile</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-2 gradient-bg-indigo text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enroll Now</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 space-y-3 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg text-base font-semibold"
          >
            Curriculum Roadmap
          </Link>

          {user ? (
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <div className="flex items-center space-x-3 px-3 pb-2">
                <div className="w-9 h-9 rounded-xl gradient-bg-indigo flex items-center justify-center text-white font-bold">
                  {user.name ? user.name[0].toUpperCase() : 'S'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              {(user.role === 'trainer' || user.role === 'admin' || user.role === 'instructor') ? (
                <Link
                  href="/trainer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center space-x-2 text-indigo-700 bg-indigo-50 border border-indigo-200 px-4 py-3 rounded-xl text-sm font-bold"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Instructor Portal</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center space-x-2 text-indigo-700 bg-indigo-50 border border-indigo-200 px-4 py-3 rounded-xl text-sm font-bold"
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                    <span>Student Portal</span>
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center space-x-2 text-slate-700 bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>My Profile</span>
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm font-bold"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-slate-700 font-bold px-4 py-3 rounded-xl border border-slate-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center gradient-bg-indigo text-white font-bold px-4 py-3 rounded-xl shadow-md"
              >
                Enroll Now
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
