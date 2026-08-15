'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext';
import { fetchApi } from '../../lib/api';
import {
  Users,
  ShieldCheck,
  Search,
  BookOpen,
  Award,
  CheckCircle2,
  ExternalLink,
  Lock,
  Mail,
  Key,
  LogOut,
  RefreshCw,
  Eye,
  X,
  FileText,
  Github,
  Trophy,
  BarChart3,
  GraduationCap,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';

export default function TrainerPage() {
  const { user, login, logout, loading: authLoading } = useAuth();
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dashboard state
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Check if current logged-in user is a trainer / instructor / admin
  const isTrainerRole = user && (user.role === 'trainer' || user.role === 'admin' || user.role === 'instructor');

  useEffect(() => {
    if (isTrainerRole) {
      loadTrainerData();
    }
  }, [isTrainerRole]);

  const loadTrainerData = async () => {
    setLoadingData(true);
    setDataError('');
    try {
      const res = await fetchApi('/trainer/students');
      if (res.success) {
        setData(res);
      } else {
        setDataError(res.message || 'Failed to load trainer cohort data');
      }
    } catch (err) {
      console.error('Error fetching trainer cohort data:', err);
      setDataError(err.message || 'Failed to load trainer cohort data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleTrainerLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password, 'trainer');
      if (loggedUser) {
        if (loggedUser.role !== 'trainer' && loggedUser.role !== 'admin' && loggedUser.role !== 'instructor') {
          logout();
          setLoginError('Access Denied: This account is a Student account and cannot access the Trainer Portal. Please use a designated Trainer account.');
        }
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter students based on search query & status filter
  const filteredStudents = data?.students?.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'completed') return student.metrics.overallPercentage === 100;
    if (statusFilter === 'active') return student.metrics.overallPercentage > 0 && student.metrics.overallPercentage < 100;
    if (statusFilter === 'high') return student.metrics.overallPercentage >= 75;
    if (statusFilter === 'behind') return student.metrics.overallPercentage < 25;

    return true;
  }) || [];

  // Helper to generate name slug for routing
  const getStudentSlug = (student) => {
    if (student.slug) return student.slug;
    return encodeURIComponent(student.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'));
  };

  // Render Access Restricted card if user is logged in as a student
  if (user && user.role === 'student') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-dot-pattern">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Access Restricted</h1>
          <p className="text-slate-600 text-xs font-medium leading-relaxed max-w-sm mx-auto">
            You are currently logged in as a Student (<strong>{user.name}</strong>). Student accounts cannot access the Trainer Portal.
          </p>
          <div className="flex flex-col space-y-2.5 pt-2">
            <Link
              href="/dashboard"
              className="w-full gradient-bg-indigo text-white font-black py-3.5 rounded-xl text-xs shadow-md shadow-indigo-500/20"
            >
              Return to Student Dashboard
            </Link>
            <button
              onClick={logout}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs shadow-sm"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Trainer Login Screen if user is not authenticated or not a trainer
  if (!user || !isTrainerRole) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-dot-pattern">
        <div className="w-full max-w-md space-y-6">
          {/* Header Badge */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-indigo-400 border border-slate-800 shadow-md">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-extrabold tracking-wider uppercase">Instructor Portal Control</span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Trainer Sign In
            </h1>
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              Access executive cohort metrics, track student progress, inspect GitHub repositories & evaluate test marks.
            </p>
          </div>

          {/* Login Card */}
          <div className="light-card p-8 rounded-3xl border border-slate-200 shadow-xl bg-white space-y-6">
            {loginError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleTrainerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Trainer Email Address
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
                    placeholder="b.kumarshaw94@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 inline-flex items-center justify-center space-x-2 gradient-bg-indigo text-white font-black py-3.5 rounded-xl text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Access Instructor Portal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Render Trainer Dashboard when logged in as a Trainer
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold border border-indigo-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Executive Lead Instructor Control</span>
              </span>
              <span className="text-slate-400 text-xs font-semibold">• 12-Week Bootcamp Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Student Cohort Analytics Dashboard
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
              Real-time monitoring of enrolled student lesson progression, GitHub repository submissions, and weekly test marks. Click any student to open their detailed workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/trainer/assignments"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Update Weekly Assignments</span>
            </Link>

            <button
              onClick={loadTrainerData}
              disabled={loadingData}
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-white/20 shadow-xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span>Refresh Roster</span>
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center space-x-2 bg-red-600/80 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Trainer Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cohort Metric Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="light-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-2 hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold uppercase tracking-wider">
              <span>Total Enrolled Students</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.cohortSummary.totalStudents}</p>
            <p className="text-xs text-indigo-600 font-bold">Active Cohort Trainees</p>
          </div>

          <div className="light-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-2 hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold uppercase tracking-wider">
              <span>Cohort Avg Completion</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.cohortSummary.avgCohortCompletion}%</p>
            <p className="text-xs text-emerald-600 font-bold">Course Completion Rate</p>
          </div>

          <div className="light-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-2 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold uppercase tracking-wider">
              <span>GitHub Submissions</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                <Github className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.cohortSummary.totalSubmissions}</p>
            <p className="text-xs text-purple-600 font-bold">Submitted Code Repositories</p>
          </div>

          <div className="light-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-2 hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold uppercase tracking-wider">
              <span>Quizzes Passed</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.cohortSummary.totalQuizzesPassed}</p>
            <p className="text-xs text-amber-600 font-bold">Passed Weekly Tests (≥70%)</p>
          </div>
        </div>
      )}

      {/* Search & Filter Controls Bar */}
      <div className="light-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name or email address..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex-shrink-0">
            Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
          >
            <option value="all">All Trainees ({data?.students?.length || 0})</option>
            <option value="high">Top Performers (≥75%)</option>
            <option value="active">In Progress (&gt;0%)</option>
            <option value="completed">Fully Completed (100%)</option>
            <option value="behind">Needs Attention (&lt;25%)</option>
          </select>
        </div>
      </div>

      {/* Student Cohort Roster Table */}
      {loadingData ? (
        <div className="p-12 text-center space-y-4 light-card rounded-3xl border border-slate-200 bg-white">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading Student Cohort Metrics...</p>
        </div>
      ) : dataError ? (
        <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-red-700 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="font-bold text-sm">{dataError}</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center space-y-3 light-card rounded-3xl border border-slate-200 bg-white">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Students Found</h3>
          <p className="text-xs text-slate-500">No registered student matches your search query or status filter.</p>
        </div>
      ) : (
        <div className="light-card rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 font-extrabold uppercase tracking-wider text-[10px] text-slate-500">
                <tr>
                  <th className="py-4 px-6">Student Information</th>
                  <th className="py-4 px-6">Specialist Rank</th>
                  <th className="py-4 px-6 text-center">Lessons Progress</th>
                  <th className="py-4 px-6 text-center">GitHub Projects</th>
                  <th className="py-4 px-6 text-center">Tests Passed</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((student) => {
                  const studentSlug = getStudentSlug(student);
                  const targetUrl = `/trainer/student/${studentSlug}`;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Student Info (Name-based route link) */}
                      <td className="py-4 px-6">
                        <Link href={targetUrl} className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm shadow-xs overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                            {student.avatar ? (
                              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              student.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors flex items-center space-x-1">
                              <span>{student.name}</span>
                              <ArrowUpRight className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-slate-500 text-[11px] font-medium">{student.email}</p>
                          </div>
                        </Link>
                      </td>

                      {/* Rank Badge */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Award className="w-3 h-3 text-indigo-600" />
                          <span>{student.rank}</span>
                        </span>
                      </td>

                      {/* Lessons Progress */}
                      <td className="py-4 px-6 text-center">
                        <div className="max-w-[140px] mx-auto space-y-1">
                          <div className="flex justify-between text-[11px] font-extrabold">
                            <span className="text-slate-900">{student.metrics.overallPercentage}%</span>
                            <span className="text-slate-400 font-semibold">
                              {student.metrics.completedLessonsCount}/{student.metrics.totalCourseLessons}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                              style={{ width: `${student.metrics.overallPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* GitHub Submissions Count */}
                      <td className="py-4 px-6 text-center font-extrabold text-slate-900 text-sm">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs">
                          <Github className="w-3.5 h-3.5 text-purple-600" />
                          <span>{student.metrics.assignmentsSubmittedCount} / 12</span>
                        </span>
                      </td>

                      {/* Tests Passed Count */}
                      <td className="py-4 px-6 text-center font-extrabold text-slate-900 text-sm">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                          <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{student.metrics.quizzesPassedCount} / 12</span>
                        </span>
                      </td>

                      {/* Action Button: Links directly to /trainer/student/[name] */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={targetUrl}
                          className="inline-flex items-center space-x-1.5 gradient-bg-indigo text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-xs hover:scale-105 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Student Marks</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
