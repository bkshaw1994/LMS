'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle
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
  const [selectedStudent, setSelectedStudent] = useState(null);

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
      const loggedUser = await login(email, password);
      if (loggedUser) {
        if (loggedUser.role !== 'trainer' && loggedUser.role !== 'admin' && loggedUser.role !== 'instructor') {
          setLoginError('Access Denied: Account does not have Trainer privileges.');
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

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Verifying Trainer Credentials...</p>
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
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 text-indigo-400 border border-slate-800 shadow-md">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold tracking-wide uppercase">Trainer & Portal Control</span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Instructor Portal Sign In
            </h1>
            <p className="text-slate-600 text-xs font-medium">
              Access cohort dashboard, track student progress, review assignments & test results.
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
                    placeholder="trainer@lms.com"
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
                className="w-full mt-2 inline-flex items-center justify-center space-x-2 gradient-bg-indigo text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
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

            {/* Quick Demo Credentials Box */}
            <div className="pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-indigo-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Default Seeded Trainer Credentials:</span>
              </div>
              <p className="text-slate-600 font-mono text-[11px] pt-1">
                <strong>Email:</strong> trainer@lms.com
              </p>
              <p className="text-slate-600 font-mono text-[11px]">
                <strong>Password:</strong> trainer123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Trainer Dashboard when logged in as a Trainer
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Trainer Executive Portal</span>
            </span>
            <span className="text-slate-400 text-xs font-medium">• 12-Week Cohort Monitoring</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Cohort Executive Dashboard
          </h1>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Real-time view of student lesson completions, GitHub assignment submissions, and quiz performance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadTrainerData}
            disabled={loadingData}
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-2xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Refresh Roster</span>
          </button>

          <button
            onClick={logout}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Trainer Logout</span>
          </button>
        </div>
      </div>

      {/* Cohort Metric Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="light-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Total Enrolled Students</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.cohortSummary.totalStudents}</p>
            <p className="text-xs text-indigo-600 font-semibold">Active Full-Stack Trainees</p>
          </div>

          <div className="light-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Avg Cohort Completion</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.cohortSummary.avgCohortCompletion}%</p>
            <p className="text-xs text-emerald-600 font-semibold">Course Progress Average</p>
          </div>

          <div className="light-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>GitHub Submissions</span>
              <div className="w-9 h-9 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Github className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.cohortSummary.totalSubmissions}</p>
            <p className="text-xs text-purple-600 font-semibold">Weekly Code Repositories</p>
          </div>

          <div className="light-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Quizzes Passed</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.cohortSummary.totalQuizzesPassed}</p>
            <p className="text-xs text-amber-600 font-semibold">Passing Score Tests (≥70%)</p>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="light-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name or email..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">
            Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
          >
            <option value="all">All Students ({data?.students?.length || 0})</option>
            <option value="high">Top Performers (≥75%)</option>
            <option value="active">In Progress (&gt;0%)</option>
            <option value="completed">Fully Completed (100%)</option>
            <option value="behind">Needs Attention (&lt;25%)</option>
          </select>
        </div>
      </div>

      {/* Student Cohort Roster Table / Grid */}
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
          <p className="text-xs text-slate-500">No registered student matches your query filters.</p>
        </div>
      ) : (
        <div className="light-card rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px] text-slate-500">
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
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-xs overflow-hidden flex-shrink-0">
                          {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            student.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                          <p className="text-slate-500 text-[11px]">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rank Badge */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Award className="w-3 h-3 text-indigo-600" />
                        <span>{student.rank}</span>
                      </span>
                    </td>

                    {/* Lessons Progress */}
                    <td className="py-4 px-6 text-center">
                      <div className="max-w-[140px] mx-auto space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-800">{student.metrics.overallPercentage}%</span>
                          <span className="text-slate-400">
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
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                        <Github className="w-3.5 h-3.5 text-purple-600" />
                        <span>{student.metrics.assignmentsSubmittedCount} / 12</span>
                      </span>
                    </td>

                    {/* Tests Passed Count */}
                    <td className="py-4 px-6 text-center font-extrabold text-slate-900 text-sm">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{student.metrics.quizzesPassedCount} / 12</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="inline-flex items-center space-x-1.5 gradient-bg-indigo text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs hover:scale-105 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Progress</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Student Progress Inspection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl gradient-bg-indigo flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedStudent.email} • {selectedStudent.mobile}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow text-xs">
              {/* Profile Links & Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Completion</span>
                  <span className="text-lg font-black text-indigo-600">{selectedStudent.metrics.overallPercentage}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Quiz Score</span>
                  <span className="text-lg font-black text-emerald-600">{selectedStudent.metrics.avgQuizPercentage}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Resume File</span>
                  {selectedStudent.resumeUrl ? (
                    <a
                      href={selectedStudent.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center space-x-1 mt-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Download Resume</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 font-medium">Not Uploaded</span>
                  )}
                </div>
              </div>

              {/* 12-Week Matrix List */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  12-Week Module Milestone Matrix
                </h4>

                <div className="space-y-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((weekNum) => {
                    const prog = selectedStudent.progressByWeek[weekNum];
                    const sub = selectedStudent.submissionsByWeek[weekNum];
                    const quiz = selectedStudent.quizzesByWeek[weekNum];

                    return (
                      <div
                        key={weekNum}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:bg-slate-50/50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center border border-indigo-200">
                            W{weekNum}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">Week {weekNum} Curriculum</p>
                            <p className="text-[11px] text-slate-500">
                              Lessons: {prog ? `${prog.completedCount}/${prog.totalLessons}` : '0 Completed'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          {/* GitHub Submission Link */}
                          {sub ? (
                            <a
                              href={sub.submissionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[11px] inline-flex items-center space-x-1 hover:underline"
                            >
                              <Github className="w-3.5 h-3.5 text-purple-600" />
                              <span>View Repo</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </a>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-medium">
                              No Repo
                            </span>
                          )}

                          {/* Quiz Score Badge */}
                          {quiz ? (
                            <span
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border inline-flex items-center space-x-1 ${
                                quiz.passed
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              <Trophy className="w-3.5 h-3.5" />
                              <span>Quiz: {quiz.percentage}% ({quiz.passed ? 'PASSED' : 'FAILED'})</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-medium">
                              No Test Score
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
