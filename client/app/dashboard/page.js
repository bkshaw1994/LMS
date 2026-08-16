'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext';
import { fetchApi } from '../../lib/api';
import { 
  Trophy, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Loader2,
  Flame,
  Award,
  Zap,
  PlayCircle,
  Lock,
  Github,
  FileCheck
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [modules, setModules] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTrainer = user && (user.role === 'trainer' || user.role === 'admin' || user.role === 'instructor');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (isTrainer) {
        router.push('/trainer');
      }
    }
  }, [user, authLoading, isTrainer, router]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;
      try {
        const [modRes, progRes] = await Promise.all([
          fetchApi('/modules'),
          fetchApi('/progress'),
        ]);

        if (modRes.success) setModules(modRes.data);
        if (progRes.success) setProgressData(progRes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboard();
    }
  }, [user]);

  if (isTrainer) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-dot-pattern">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trainer Portal Active</h1>
          <p className="text-slate-600 text-xs font-medium leading-relaxed max-w-sm mx-auto">
            You are currently logged in as a Trainer (<strong>{user?.name}</strong>). Trainers cannot view student portal pages.
          </p>
          <div className="flex flex-col space-y-2.5 pt-2">
            <Link
              href="/trainer"
              className="w-full gradient-bg-indigo text-white font-black py-3.5 rounded-xl text-xs shadow-md shadow-indigo-500/20"
            >
              Go to Trainer Executive Portal
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

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-600 text-sm font-semibold">Loading your student dashboard...</p>
      </div>
    );
  }

  const overallPercentage = progressData ? progressData.overallPercentage : 0;
  const completedLessons = progressData ? progressData.completedLessonsCount : 0;
  const totalLessons = progressData ? progressData.totalLessonsCount : 48;
  const submissions = progressData && progressData.submissions ? progressData.submissions : [];
  const quizResults = progressData && progressData.quizResults ? progressData.quizResults : [];

  // Helper to extract string ID
  const extractId = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object') return obj._id ? obj._id.toString() : obj.toString();
    return String(obj);
  };

  // Map progress per module
  const progressMap = {};
  if (progressData && progressData.data) {
    progressData.data.forEach(p => {
      const modId = extractId(p.module);
      if (modId) progressMap[modId] = p;
    });
  }

  // Helper: Are video lessons finished for a module?
  const areLessonsCompleted = (mod) => {
    if (!mod) return false;
    const modId = extractId(mod._id);
    const prog = progressMap[modId];
    const completedCount = prog && prog.completedLessons ? prog.completedLessons.length : 0;
    const totalCount = mod.lessons ? mod.lessons.length : 0;
    return totalCount > 0 && completedCount >= totalCount;
  };

  // Helper: Is assignment submitted for a module?
  const isAssignmentSubmitted = (mod) => {
    if (!mod) return false;
    const modId = extractId(mod._id);
    return submissions.some(s => extractId(s.module) === modId);
  };

  // Helper: Is quiz passed for a module?
  const isQuizPassed = (mod) => {
    if (!mod) return false;
    const modId = extractId(mod._id);
    return quizResults.some(q => extractId(q.module) === modId && (q.passed || q.score >= 70));
  };

  // Helper: Is a week 100% completed? (Lessons + Assignment + Passed Quiz)
  const isModuleFullyCompleted = (mod) => {
    return areLessonsCompleted(mod) && isAssignmentSubmitted(mod) && isQuizPassed(mod);
  };

  // Helper: Is a week unlocked?
  // Week lock system disabled - all weeks unlocked by default.
  const isModuleUnlocked = (mod) => {
    return true;
  };

  // Active unlocked module to study
  let nextUpModule = modules.find(m => isModuleUnlocked(m) && !isModuleFullyCompleted(m)) || modules[0];

  // Determine rank based on percentage
  let rankBadge = 'Full-Stack Apprentice';
  if (overallPercentage >= 100) rankBadge = 'Master Software Engineer';
  else if (overallPercentage >= 75) rankBadge = 'Senior Full-Stack Architect';
  else if (overallPercentage >= 50) rankBadge = 'Full-Stack Engineer';
  else if (overallPercentage >= 25) rankBadge = 'Junior Developer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-dot-pattern">
      {/* Executive Welcome Header */}
      <div className="light-card p-8 sm:p-10 rounded-3xl border border-slate-200 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 bg-white shadow-md">
        <div className="space-y-3 z-10 text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Active Student Portal</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>7 Day Streak</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
              <Trophy className="w-3.5 h-3.5 text-purple-600" />
              <span>{rankBadge}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Welcome back, <span className="gradient-text-light">{user?.name}</span>
          </h1>
          <p className="text-slate-600 text-sm max-w-xl leading-relaxed font-medium">
            Step-by-step progression: Watch Lessons ➔ Submit GitHub Assignment ➔ Pass Knowledge Test ($\ge 70\%$) for each week!
          </p>
        </div>

        {/* Circular Progress Meter */}
        <div className="light-card p-6 rounded-2xl border border-slate-200 flex items-center space-x-6 min-w-[300px] z-10 bg-slate-50">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="9"
                className="text-slate-200"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="9"
                className="text-indigo-600 transition-all duration-1000 ease-out"
                strokeDasharray={238}
                strokeDashoffset={238 - (238 * overallPercentage) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xl font-extrabold text-slate-900">{overallPercentage}%</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Overall Completion</p>
            <p className="text-xl font-black text-slate-900">
              {completedLessons} <span className="text-sm font-medium text-slate-500">/ {totalLessons}</span>
            </p>
            <p className="text-xs font-bold text-indigo-600">Lessons Completed</p>
          </div>
        </div>
      </div>

      {/* Next Up Lesson Spotlight */}
      {nextUpModule && (
        <div className="bg-indigo-50/80 p-6 sm:p-8 rounded-3xl border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl gradient-bg-indigo flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-indigo-500/20">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Active Unlocked Week</span>
                <span className="text-xs text-slate-500 font-medium">• Week {nextUpModule.weekNumber}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{nextUpModule.title}</h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">{nextUpModule.description}</p>
            </div>
          </div>

          <Link
            href={`/dashboard/modules/${nextUpModule.weekNumber}`}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 gradient-bg-indigo text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] flex-shrink-0"
          >
            <span>Open Week {nextUpModule.weekNumber} Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Modules Progress Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">12-Week Curriculum Roadmap</h2>
            <p className="text-slate-600 text-sm font-medium">All 12 weeks are unlocked. Explore lessons, submit GitHub assignments, and complete weekly tests at your own pace.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const modId = extractId(module._id);
            const prog = progressMap[modId];
            const completedCount = prog && prog.completedLessons ? prog.completedLessons.length : 0;
            const totalCount = module.lessons ? module.lessons.length : 0;
            const modulePercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            const lessonsFinished = areLessonsCompleted(module);
            const hasSub = isAssignmentSubmitted(module);
            const hasQuiz = isQuizPassed(module);
            const fullyCompleted = isModuleFullyCompleted(module);
            const unlocked = isModuleUnlocked(module);

            return (
              <div
                key={module.weekNumber}
                className={`light-card p-6 rounded-3xl flex flex-col justify-between transition-all ${
                  !unlocked
                    ? 'bg-slate-100/70 border-slate-200 opacity-80'
                    : fullyCompleted
                    ? 'border-emerald-300 bg-emerald-50/20 light-card-hover'
                    : modulePercent > 0
                    ? 'border-indigo-300 bg-indigo-50/20 light-card-hover'
                    : 'border-slate-200 light-card-hover'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-lg border ${
                      unlocked
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}>
                      WEEK {module.weekNumber}
                    </span>

                    {!unlocked ? (
                      <span className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 border border-slate-300">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Locked</span>
                      </span>
                    ) : fullyCompleted ? (
                      <span className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Unlocked
                      </span>
                    )}
                  </div>

                  <h3 className={`text-lg font-bold transition-colors ${
                    unlocked ? 'text-slate-900 group-hover:text-indigo-600' : 'text-slate-700'
                  }`}>
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">{module.description}</p>
                </div>

                {/* Module Checklist Badges */}
                <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-3">
                  {unlocked ? (
                    <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                      <div className={`p-1.5 rounded-lg border text-center ${
                        lessonsFinished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        Lessons ({completedCount}/{totalCount})
                      </div>

                      <div className={`p-1.5 rounded-lg border text-center ${
                        hasSub ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        Project {hasSub ? '✓' : 'Pending'}
                      </div>

                      <div className={`p-1.5 rounded-lg border text-center ${
                        hasQuiz ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        Test {hasQuiz ? '✓' : 'Pending'}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-medium">Complete Week {module.weekNumber - 1} test to unlock.</p>
                  )}

                  {unlocked ? (
                    <Link
                      href={`/dashboard/modules/${module.weekNumber}`}
                      className="w-full mt-2 inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition-all border border-slate-200 shadow-xs"
                    >
                      <span>{fullyCompleted ? 'Review Week' : 'Open Week Workspace'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full mt-2 inline-flex items-center justify-center space-x-2 bg-slate-200 text-slate-500 font-bold py-2.5 rounded-xl text-xs cursor-not-allowed border border-slate-300"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Complete Week {module.weekNumber - 1} First</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
