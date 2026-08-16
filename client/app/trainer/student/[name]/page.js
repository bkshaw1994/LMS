'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../lib/authContext';
import { fetchApi } from '../../../../lib/api';
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  CheckCircle2,
  Square,
  Github,
  ExternalLink,
  Trophy,
  RefreshCw,
  FileText,
  AlertCircle,
  BarChart3,
  Sparkles,
  BookOpen,
  Check
} from 'lucide-react';

export default function TrainerStudentDetailPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const studentIdentifier = params?.name || params?.id;

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'submitted' | 'quizzes'

  const isTrainerRole = user && (user.role === 'trainer' || user.role === 'admin' || user.role === 'instructor');

  useEffect(() => {
    if (studentIdentifier && isTrainerRole) {
      loadStudentDetail();
    }
  }, [studentIdentifier, isTrainerRole]);

  const loadStudentDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi(`/trainer/student/${studentIdentifier}`);
      if (res.success) {
        setStudentData(res.student);
      } else {
        setError(res.message || 'Failed to load student details');
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
      setError(err.message || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && !studentData && !error)) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 bg-slate-50/50">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-xs">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-700">Loading Student Intelligence Profile...</p>
      </div>
    );
  }

  if (!user || !isTrainerRole) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900">Trainer Access Required</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          You must be logged in with a Trainer account to inspect individual student progress and test marks.
        </p>
        <Link
          href="/trainer"
          className="inline-flex items-center space-x-2 gradient-bg-indigo text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Go to Trainer Sign In</span>
        </Link>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-center">
        <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-red-700 space-y-3">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold">Error Loading Student Profile</h2>
          <p className="text-xs font-medium">{error || 'Student record not found.'}</p>
          <Link
            href="/trainer"
            className="inline-flex items-center space-x-2 bg-white text-slate-800 border border-slate-200 font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trainer Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const { metrics, weeks } = studentData;

  // Filter weeks by active tab
  const filteredWeeks = weeks.filter((w) => {
    if (activeTab === 'submitted') return !!w.submission;
    if (activeTab === 'quizzes') return !!w.quizResult;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            href="/trainer"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs border border-slate-200 shadow-2xs transition-all hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Cohort Dashboard</span>
          </Link>
          <span className="text-slate-300 font-medium">/</span>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
            {studentData.name}
          </span>
        </div>

        <button
          onClick={loadStudentDetail}
          className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs border border-slate-200 shadow-2xs transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Student Profile Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/30 overflow-hidden flex-shrink-0 border-2 border-white/20">
              {studentData.avatar ? (
                <img src={studentData.avatar} alt={studentData.name} className="w-full h-full object-cover" />
              ) : (
                studentData.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase">
                  Student Record
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase flex items-center space-x-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>{studentData.rank}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {studentData.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-medium pt-1">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{studentData.email}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{studentData.mobile}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Joined: {new Date(studentData.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {studentData.resumeUrl ? (
              <a
                href={studentData.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-5 py-3 rounded-2xl text-xs transition-all shadow-md shadow-indigo-600/30"
              >
                <FileText className="w-4 h-4" />
                <span>Download Resume PDF</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </a>
            ) : (
              <span className="text-xs font-semibold text-slate-400 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                Resume PDF Not Uploaded
              </span>
            )}
          </div>
        </div>

        {/* 4 Summary Stat Panels */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Overall Progress</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-indigo-400">{metrics.overallPercentage}%</span>
              <span className="text-slate-400 text-[11px]">({metrics.completedLessonsCount}/{metrics.totalCourseLessons})</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${metrics.overallPercentage}%` }}></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">GitHub Repositories</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-purple-400">{metrics.assignmentsSubmittedCount}</span>
              <span className="text-slate-400 text-[11px]">/ 12 Repos</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(metrics.assignmentsSubmittedCount / 12) * 100}%` }}></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Quizzes Passed</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-400">{metrics.quizzesPassedCount}</span>
              <span className="text-slate-400 text-[11px]">/ 12 Tests</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(metrics.quizzesPassedCount / 12) * 100}%` }}></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Average Test Score</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-amber-400">{metrics.avgQuizScore}%</span>
              <span className="text-slate-400 text-[11px]">Marks Avg</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${metrics.avgQuizScore}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Matrix Heading */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              12-Week Curriculum, Submissions & Marks Matrix
            </h2>
            <p className="text-slate-600 text-xs font-medium mt-0.5">
              Inspect lesson checklists, code repository links, and test marks for each module.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Weeks (12)
            </button>
            <button
              onClick={() => setActiveTab('submitted')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'submitted' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Submitted Repos ({metrics.assignmentsSubmittedCount})
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'quizzes' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Test Marks ({metrics.quizzesAttemptedCount})
            </button>
          </div>
        </div>

        {/* 12-Week Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredWeeks.map((week) => {
            const hasSub = !!week.submission;
            const hasQuiz = !!week.quizResult;

            return (
              <div
                key={week.weekNumber}
                className={`light-card p-6 rounded-3xl border flex flex-col justify-between space-y-6 transition-all shadow-xs ${
                  week.isLessonsFinished && hasSub && hasQuiz && week.quizResult?.passed
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : week.completedCount > 0 || hasSub || hasQuiz
                    ? 'border-indigo-200 bg-white'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Week Badge & Category */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                      WEEK {week.weekNumber}
                    </span>
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {week.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{week.title}</h3>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1 font-medium">
                      <span>Lessons Completed:</span>
                      <span className="font-extrabold text-indigo-600">
                        {week.completedCount} / {week.totalLessons} Lessons
                      </span>
                    </div>
                  </div>

                  {/* Syllabus Lessons Checklist */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Lessons Checklist
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      {week.lessons.map((lesson, lIdx) => {
                        const isDone = week.completedLessons.includes(lesson.title);
                        return (
                          <div
                            key={lIdx}
                            className={`flex items-center justify-between p-2.5 rounded-xl border ${
                              isDone ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              )}
                              <span>{lesson.title}</span>
                            </div>
                            {isDone && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-800">
                                Done
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Submissions & Test Marks Footer Box */}
                <div className="pt-4 border-t border-slate-200/80 space-y-3">
                  {/* GitHub Submission Box */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 flex items-center space-x-1">
                        <Github className="w-3.5 h-3.5 text-purple-600" />
                        <span>GitHub Repository Submission</span>
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          hasSub ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-slate-200 text-slate-500 border-slate-300'
                        }`}
                      >
                        {hasSub ? 'Submitted' : 'Pending'}
                      </span>
                    </div>

                    {hasSub ? (
                      <div className="space-y-1 pt-1">
                        <a
                          href={week.submission.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 underline flex items-center space-x-1 truncate"
                        >
                          <span className="truncate">{week.submission.submissionUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 ml-1" />
                        </a>
                        <p className="text-[10px] text-slate-400">
                          Submitted: {new Date(week.submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium">No GitHub repository submitted yet.</p>
                    )}
                  </div>

                  {/* Weekly Knowledge Test & Marks Box */}
                  <div
                    className={`p-3.5 rounded-2xl border space-y-1.5 ${
                      hasQuiz
                        ? week.quizResult.passed
                          ? 'bg-emerald-50/80 border-emerald-200'
                          : 'bg-red-50/80 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        <span>Weekly Knowledge Test & Marks</span>
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          hasQuiz
                            ? week.quizResult.passed
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-slate-200 text-slate-500 border-slate-300'
                        }`}
                      >
                        {hasQuiz ? (week.quizResult.passed ? 'PASSED (≥70%)' : 'FAILED (<70%)') : 'NOT ATTEMPTED'}
                      </span>
                    </div>

                    {hasQuiz ? (
                      <div className="space-y-1 pt-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Student Test Marks:</span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {week.quizResult.score} / {week.quizResult.totalQuestions} Marks ({week.quizResult.percentage}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Attempt Date:</span>
                          <span>{new Date(week.quizResult.attemptedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium">Student has not attempted this weekly test yet.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
