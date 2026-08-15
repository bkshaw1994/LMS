'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  BookOpen,
  CheckCircle2,
  Square,
  Github,
  ExternalLink,
  Trophy,
  RefreshCw,
  FileText,
  AlertCircle,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';

export default function TrainerStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const studentId = params?.id;

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isTrainerRole = user && (user.role === 'trainer' || user.role === 'admin' || user.role === 'instructor');

  useEffect(() => {
    if (studentId && isTrainerRole) {
      loadStudentDetail();
    }
  }, [studentId, isTrainerRole]);

  const loadStudentDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi(`/trainer/student/${studentId}`);
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading Student Performance & Test Marks...</p>
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
          <span>Go to Trainer Portal Sign In</span>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            href="/trainer"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Cohort Roster</span>
          </Link>
          <span className="text-xs font-semibold text-slate-400">/ Student Dynamic Inspector</span>
        </div>

        <button
          onClick={loadStudentDetail}
          className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-200 shadow-2xs transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Student Data</span>
        </button>
      </div>

      {/* Student Profile Spotlight Card */}
      <div className="light-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left Avatar & Identity */}
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-md overflow-hidden flex-shrink-0">
              {studentData.avatar ? (
                <img src={studentData.avatar} alt={studentData.name} className="w-full h-full object-cover" />
              ) : (
                studentData.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Student Record
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {studentData.rank}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {studentData.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{studentData.email}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{studentData.mobile}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Enrolled: {new Date(studentData.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action: Resume */}
          <div>
            {studentData.resumeUrl ? (
              <a
                href={studentData.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold px-5 py-3 rounded-xl text-xs transition-all"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>View Student Resume PDF</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            ) : (
              <span className="text-xs font-semibold text-slate-400 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 inline-block">
                Resume PDF Not Uploaded
              </span>
            )}
          </div>
        </div>

        {/* 4 Summary Metric Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Overall Progress</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-indigo-600">{metrics.overallPercentage}%</span>
              <span className="text-slate-400 text-[11px]">({metrics.completedLessonsCount}/{metrics.totalCourseLessons} Lessons)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">GitHub Assignments</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-purple-600">{metrics.assignmentsSubmittedCount}</span>
              <span className="text-slate-400 text-[11px]">/ 12 Submitted</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Quizzes Passed</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-600">{metrics.quizzesPassedCount}</span>
              <span className="text-slate-400 text-[11px]">/ 12 Tests</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Average Quiz Score</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-amber-600">{metrics.avgQuizScore}%</span>
              <span className="text-slate-400 text-[11px]">Marks Average</span>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Week Comprehensive Milestone & Marks Inspection */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              12-Week Progress, Submissions & Test Marks Inspection
            </h2>
            <p className="text-slate-600 text-xs font-medium mt-0.5">
              Complete breakdown of lessons completed, GitHub project submissions, and test scores for {studentData.name}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {weeks.map((week) => {
            const hasSub = !!week.submission;
            const hasQuiz = !!week.quizResult;

            return (
              <div
                key={week.weekNumber}
                className={`light-card p-6 rounded-3xl border flex flex-col justify-between space-y-6 transition-all ${
                  week.isLessonsFinished && hasSub && hasQuiz && week.quizResult?.passed
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : week.completedCount > 0 || hasSub || hasQuiz
                    ? 'border-indigo-200 bg-white'
                    : 'border-slate-200 bg-slate-50/50 opacity-90'
                }`}
              >
                {/* Card Top: Week Badge & Title */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                      WEEK {week.weekNumber}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {week.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{week.title}</h3>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1 font-medium">
                      <span>Lessons Completed:</span>
                      <span className="font-extrabold text-slate-900">
                        {week.completedCount} / {week.totalLessons}
                      </span>
                    </div>
                  </div>

                  {/* Lessons List Checklist */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Video Lessons Checklist
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      {week.lessons.map((lesson, lIdx) => {
                        const isDone = week.completedLessons.includes(lesson.title);
                        return (
                          <div
                            key={lIdx}
                            className={`flex items-center justify-between p-2 rounded-xl border ${
                              isDone ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              )}
                              <span className={`font-semibold ${isDone ? 'text-emerald-950 font-bold' : ''}`}>
                                {lesson.title}
                              </span>
                            </div>
                            {isDone && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-800">
                                Completed
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Submissions & Test Marks */}
                <div className="pt-4 border-t border-slate-200/80 space-y-3">
                  {/* GitHub Project Submission Section */}
                  <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 flex items-center space-x-1">
                        <Github className="w-3.5 h-3.5 text-purple-600" />
                        <span>GitHub Project Submission</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          hasSub ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {hasSub ? 'Submitted' : 'Pending'}
                      </span>
                    </div>

                    {hasSub ? (
                      <div className="space-y-1 pt-1">
                        <p className="text-[11px] text-slate-600 font-medium truncate">
                          <strong>Repository URL:</strong>
                        </p>
                        <a
                          href={week.submission.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 underline flex items-center space-x-1 truncate"
                        >
                          <span className="truncate">{week.submission.submissionUrl}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0 ml-1" />
                        </a>
                        <p className="text-[10px] text-slate-400">
                          Submitted: {new Date(week.submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium">No GitHub repository submitted yet.</p>
                    )}
                  </div>

                  {/* Weekly Knowledge Test & Marks Section */}
                  <div
                    className={`p-3 rounded-2xl border space-y-1.5 ${
                      hasQuiz
                        ? week.quizResult.passed
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-red-50/60 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        <span>Weekly Knowledge Test & Marks</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          hasQuiz
                            ? week.quizResult.passed
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}
                      >
                        {hasQuiz ? (week.quizResult.passed ? 'PASSED (≥70%)' : 'FAILED (<70%)') : 'NOT ATTEMPTED'}
                      </span>
                    </div>

                    {hasQuiz ? (
                      <div className="space-y-1 pt-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Student Test Score:</span>
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
