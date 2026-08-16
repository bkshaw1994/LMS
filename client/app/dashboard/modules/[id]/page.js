'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../lib/authContext';
import { fetchApi } from '../../../../lib/api';
import { 
  ArrowLeft, 
  CheckSquare, 
  Square, 
  PlayCircle, 
  Clock, 
  Award, 
  Loader2,
  CheckCircle2,
  FileCode,
  Download,
  ExternalLink,
  BookOpen,
  Sparkles,
  Play,
  Lock,
  ArrowRight,
  Github,
  FileCheck
} from 'lucide-react';

export default function ModuleDetailsPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [moduleItem, setModuleItem] = useState(null);
  const [allModules, setAllModules] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const extractId = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object') return obj._id ? obj._id.toString() : obj.toString();
    return String(obj);
  };

  useEffect(() => {
    const loadModuleData = async () => {
      if (!user || !id) return;
      try {
        // Fetch core module item first
        const modRes = await fetchApi(`/modules/${id}`);
        if (modRes.success) {
          setModuleItem(modRes.data);
        }

        // Secondary data fetches (gracefully handled)
        try {
          const allModsRes = await fetchApi('/modules');
          if (allModsRes.success) setAllModules(allModsRes.data);
        } catch (e) {}

        try {
          const progRes = await fetchApi('/progress');
          if (progRes.success && progRes.data) {
            setProgressList(progRes.data);
            const currentProg = progRes.data.find(
              (p) => extractId(p.module) === extractId(modRes.data._id)
            );
            if (currentProg && currentProg.completedLessons) {
              setCompletedLessonIds(currentProg.completedLessons.map((l) => l.toString()));
            }
          }
        } catch (e) {}

        try {
          const subRes = await fetchApi(`/assignments/${id}`);
          if (subRes.success) setSubmission(subRes.data);
        } catch (e) {}

        try {
          const quizRes = await fetchApi(`/quizzes/${id}`);
          if (quizRes.success) setQuizResult(quizRes.userResult);
        } catch (e) {}

      } catch (err) {
        console.error('Error fetching module details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadModuleData();
    }
  }, [user, id]);

  const toggleLesson = async (lessonId) => {
    if (!moduleItem) return;
    setUpdatingId(lessonId);

    const isCurrentlyCompleted = completedLessonIds.includes(lessonId.toString());
    const nextCompletedState = !isCurrentlyCompleted;

    try {
      const res = await fetchApi('/progress/update', {
        method: 'POST',
        body: JSON.stringify({
          moduleId: moduleItem._id,
          lessonId,
          isCompleted: nextCompletedState,
        }),
      });

      if (res.success && res.data) {
        setCompletedLessonIds(res.data.completedLessons.map((l) => l.toString()));
        try {
          const progRes = await fetchApi('/progress');
          if (progRes.success) setProgressList(progRes.data);
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to update lesson completion:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-600 text-sm font-semibold">Loading video lesson player...</p>
      </div>
    );
  }

  if (!moduleItem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Module Not Found</h2>
        <p className="text-slate-600">The requested curriculum week does not exist.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 text-indigo-600 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </Link>
      </div>
    );
  }

  // Sequential lock check (Week lock system disabled - all weeks accessible)
  const isModuleLocked = () => {
    return false;
  };

  if (isModuleLocked()) {
    const prevWeek = moduleItem.weekNumber - 1;
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 bg-dot-pattern">
        <div className="light-card p-10 rounded-3xl border border-slate-200 shadow-xl space-y-5 bg-white">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Week {moduleItem.weekNumber} is Locked</h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed font-medium">
            You must complete 100% of the lessons, assignment, and quiz in <strong>Week {prevWeek}</strong> before unlocking this module.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/dashboard/modules/${prevWeek}`}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 gradient-bg-indigo text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-md shadow-indigo-500/20"
            >
              <span>Go to Week {prevWeek} Lessons</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 font-bold px-6 py-3.5 rounded-xl text-sm border border-slate-200 hover:bg-slate-200 transition-colors"
            >
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalLessons = moduleItem.lessons ? moduleItem.lessons.length : 0;
  const completedCount = completedLessonIds.length;
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const activeLesson = moduleItem.lessons[selectedLessonIndex] || moduleItem.lessons[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-dot-pattern">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Portal</span>
      </Link>

      {/* Module Overview Header */}
      <div className="light-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              WEEK {moduleItem.weekNumber}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {moduleItem.category}
            </span>
          </div>

          {percent === 100 && submission && quizResult?.passed && (
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Week Fully Completed! (100%)</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900">{moduleItem.title}</h1>
        <p className="text-slate-600 text-sm leading-relaxed max-w-4xl font-medium">{moduleItem.description}</p>

        {/* Weekly Section Navigation Tabs */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <Link
            href={`/dashboard/modules/${moduleItem.weekNumber}`}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl gradient-bg-indigo text-white text-xs font-bold shadow-md shadow-indigo-500/20"
          >
            <PlayCircle className="w-4 h-4" />
            <span>1. Video Lessons ({completedCount}/{totalLessons})</span>
          </Link>

          <Link
            href={`/dashboard/modules/${moduleItem.weekNumber}/assignment`}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              submission
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>2. Project Assignment {submission ? '(Submitted)' : '(Pending)'}</span>
          </Link>

          <Link
            href={`/dashboard/modules/${moduleItem.weekNumber}/test`}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              quizResult?.passed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>3. Weekly Test {quizResult ? `(${quizResult.score}%)` : '(Pending)'}</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Video Player + Lessons Checklist Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Real YouTube Video Player & Lesson Resources */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cinema Video Frame */}
          <div className="light-card rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 shadow-2xl relative text-white">
            <div className="relative aspect-video w-full bg-black overflow-hidden">
              {activeLesson && activeLesson.videoUrl ? (
                <iframe
                  className="w-full h-full"
                  src={`${activeLesson.videoUrl}?autoplay=0&rel=0&modestbranding=1`}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <PlayCircle className="w-12 h-12 text-indigo-400 mb-2" />
                  <p className="text-sm font-bold text-white">Video Lesson Stream</p>
                </div>
              )}
            </div>

            {/* Active Video Header Info */}
            <div className="p-4 bg-slate-900 flex items-center justify-between text-xs text-slate-300 border-t border-slate-800 font-semibold">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-indigo-400 font-bold">Now Playing (Lesson {selectedLessonIndex + 1}):</span>
                <span className="text-white font-extrabold">{activeLesson?.title}</span>
              </div>
            </div>
          </div>

          {/* Lesson Resource Tabs */}
          <div className="light-card p-6 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-sm">
            <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Lesson Overview
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`pb-3 transition-colors ${
                  activeTab === 'resources'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Code Starter & Resources
              </button>
            </div>

            {activeTab === 'overview' ? (
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-medium">
                <h3 className="text-base font-extrabold text-slate-900">What You'll Learn in This Lesson</h3>
                <p>
                  In this topic, we break down core full-stack principles for <strong>{activeLesson?.title}</strong>. Follow along with the video lecture above, inspect code examples, and check off the topic on the right once finished.
                </p>
                <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700">Key Takeaways</span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 font-semibold">
                    <li>Understand architectural concepts behind {moduleItem.category}.</li>
                    <li>Implement modern ES6+ / Next.js design patterns.</li>
                    <li>Avoid common security and performance pitfalls.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 gap-3">
                  <div className="flex items-center space-x-3">
                    <FileCode className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">
                        {moduleItem.assignment?.title || `Week ${moduleItem.weekNumber} Starter Template`}
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        Starter File: <span className="font-mono text-indigo-700 font-bold">{moduleItem.assignment?.starterFileName || 'index.js'}</span> ({moduleItem.assignment?.points || 100} Points)
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/modules/${moduleItem.weekNumber}/assignment`}
                    className="px-4 py-2.5 rounded-xl gradient-bg-indigo text-white text-xs font-black inline-flex items-center justify-center space-x-1.5 shadow-md hover:scale-[1.02] transition-all self-start sm:self-auto"
                  >
                    <span>View Starter Code & Submit Project</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Download Printable Cheat Sheet (PDF)</p>
                      <p className="text-xs text-slate-500 font-medium">Quick reference guide & API cheat sheet</p>
                    </div>
                  </div>
                  <button className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold shadow-xs">
                    Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lessons Checklist */}
        <div className="space-y-4">
          <div className="light-card p-6 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Module Lessons</h3>
              <span className="text-xs text-slate-500 font-bold">{completedCount}/{totalLessons} Done</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {moduleItem.lessons && moduleItem.lessons.map((lesson, idx) => {
                const isDone = completedLessonIds.includes(lesson._id.toString());
                const isUpdating = updatingId === lesson._id;
                const isSelected = selectedLessonIndex === idx;

                return (
                  <div
                    key={lesson._id || idx}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                        : isDone
                        ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedLessonIndex(idx)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLesson(lesson._id);
                          }}
                          className="focus:outline-none mt-0.5"
                          title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                          ) : isDone ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                          )}
                        </button>

                        <div>
                          <h4 className={`text-sm font-bold transition-colors ${
                            isDone ? 'text-slate-500 line-through decoration-emerald-500/60' : 'text-slate-900'
                          }`}>
                            {lesson.title}
                          </h4>
                        </div>
                      </div>

                      {isDone && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Done
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
