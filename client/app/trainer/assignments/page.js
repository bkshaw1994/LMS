'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/authContext';
import { fetchApi } from '../../../lib/api';
import {
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  FileCode2,
  Save,
  CheckCircle2,
  RefreshCw,
  Github,
  AlertCircle,
  Sparkles,
  Code2,
  Layers,
  Check,
  Eye,
  ListChecks,
  Award
} from 'lucide-react';

export default function TrainerAssignmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const isTrainerRole = user && (user.role === 'trainer' || user.role === 'admin' || user.role === 'instructor');

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Form state for current selected assignment
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [starterRepoUrl, setStarterRepoUrl] = useState('');
  const [starterFileName, setStarterFileName] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [points, setPoints] = useState(100);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (isTrainerRole) {
      loadModules();
    }
  }, [isTrainerRole]);

  const loadModules = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi('/trainer/assignments');
      if (res.success) {
        setModules(res.modules || []);
        if (res.modules && res.modules.length > 0) {
          populateFormForWeek(res.modules, 1);
        }
      } else {
        setError(res.message || 'Failed to load curriculum modules');
      }
    } catch (err) {
      console.error('Error loading assignment modules:', err);
      setError(err.message || 'Failed to load curriculum modules');
    } finally {
      setLoading(false);
    }
  };

  const populateFormForWeek = (allModules, weekNum) => {
    const mod = allModules.find((m) => m.weekNumber === weekNum);
    if (mod && mod.assignment) {
      setTitle(mod.assignment.title || '');
      setDescription(mod.assignment.description || '');
      setRequirementsText(
        Array.isArray(mod.assignment.requirements)
          ? mod.assignment.requirements.join('\n')
          : mod.assignment.requirements || ''
      );
      setStarterRepoUrl(mod.assignment.starterRepoUrl || '');
      setStarterFileName(mod.assignment.starterFileName || '');
      setStarterCode(mod.assignment.starterCode || '');
      setPoints(mod.assignment.points || 100);
    } else {
      setTitle(`Week ${weekNum} Project Assignment`);
      setDescription(`Complete the project requirements for Week ${weekNum}.`);
      setRequirementsText('Implement application requirements\nSubmit public GitHub repository link');
      setStarterRepoUrl('');
      setStarterFileName('');
      setStarterCode('');
      setPoints(100);
    }
    setSelectedWeek(weekNum);
    setSaveSuccess('');
  };

  const handleSelectWeek = (weekNum) => {
    populateFormForWeek(modules, weekNum);
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess('');
    setError('');

    const requirements = requirementsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    try {
      const res = await fetchApi(`/trainer/assignment/${selectedWeek}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          description,
          requirements,
          starterRepoUrl,
          starterFileName,
          starterCode,
          points: parseInt(points) || 100,
        }),
      });

      if (res.success) {
        setSaveSuccess(`Week ${selectedWeek} assignment saved and updated successfully!`);
        // Update local modules array state
        setModules((prev) =>
          prev.map((m) =>
            m.weekNumber === selectedWeek
              ? { ...m, assignment: res.assignment || res.module.assignment }
              : m
          )
        );
      } else {
        setError(res.message || 'Failed to update assignment');
      }
    } catch (err) {
      console.error('Error saving assignment:', err);
      setError(err.message || 'Failed to update assignment');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (loading && modules.length === 0)) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 bg-slate-50/50">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-xs">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-700">Loading Assignment Management Suite...</p>
      </div>
    );
  }

  if (!user || !isTrainerRole) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900">Trainer Access Required</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          You must be logged in with a Trainer account to manage weekly project assignments.
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

  const currentModule = modules.find((m) => m.weekNumber === selectedWeek);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            href="/trainer"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs border border-slate-200 shadow-2xs transition-all hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Trainer Dashboard</span>
          </Link>
          <span className="text-slate-300 font-medium">/</span>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
            Weekly Project Assignment Configurator
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>12-Week Bootcamp Editor</span>
          </span>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-extrabold border border-purple-400/30">
              <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Curriculum Assignment Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Manage & Update Weekly Assignments
            </h1>
            <p className="text-slate-300 text-xs font-medium max-w-2xl leading-relaxed">
              Select any week from 1 to 12 below to modify project titles, starter template URLs, starter file code, requirements, and total marks. Updates reflect instantly for all enrolled trainees.
            </p>
          </div>
        </div>
      </div>

      {/* 12-Week Selector Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Select Bootcamp Week to Edit</span>
          </span>
          <span className="text-slate-600 font-bold">Week {selectedWeek} of 12 Selected</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((wNum) => {
            const mod = modules.find((m) => m.weekNumber === wNum);
            const isSelected = selectedWeek === wNum;

            return (
              <button
                key={wNum}
                onClick={() => handleSelectWeek(wNum)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'gradient-bg-indigo text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-600'}`}>
                    Week {wNum}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <p className={`text-xs font-bold truncate mt-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {mod?.category || `Week ${wNum}`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Messages */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Assignment Editor Form (7 cols) */}
        <form onSubmit={handleSaveAssignment} className="lg:col-span-7 space-y-6 light-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                Editing Week {selectedWeek} ({currentModule?.category || 'Curriculum'})
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Assignment Settings</h2>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Module: {currentModule?.title || `Week ${selectedWeek}`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Assignment Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Portfolio Website & Responsive CSS Layouts"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Marks / Points
              </label>
              <input
                type="number"
                required
                min="10"
                max="500"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Starter GitHub Template Repo</span>
                <span className="text-[10px] text-slate-400 font-semibold lowercase">(optional)</span>
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={starterRepoUrl}
                  onChange={(e) => setStarterRepoUrl(e.target.value)}
                  placeholder="https://github.com/org/repo-template (Optional)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Starter File Name</span>
                <span className="text-[10px] text-slate-400 font-semibold lowercase">(optional)</span>
              </label>
              <div className="relative">
                <FileCode2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={starterFileName}
                  onChange={(e) => setStarterFileName(e.target.value)}
                  placeholder="index.js or App.jsx (Optional)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Description & Instructions
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the goals and instructions for this project..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Requirements Checklist (One requirement per line)
            </label>
            <textarea
              rows={4}
              required
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder="Build modern UI components&#10;Implement responsive layouts&#10;Push clean code to GitHub"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-medium text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Starter Code Template Snippet</span>
              <span className="text-[10px] text-slate-400 font-semibold lowercase">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              placeholder="// Optional starter code snippet for students..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-indigo-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center space-x-2 gradient-bg-indigo text-white font-black py-3.5 rounded-xl text-xs shadow-md shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Assignment Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Publish Week {selectedWeek} Assignment</span>
              </>
            )}
          </button>
        </form>

        {/* Live Student Preview Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="light-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Student View Live Preview</span>
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Preview Mode
              </span>
            </div>

            {/* Simulated Student Assignment Card */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  WEEK {selectedWeek} PROJECT
                </span>
                <h3 className="text-base font-bold text-slate-900 pt-1">{title || `Week ${selectedWeek} Project`}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{description}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-extrabold text-slate-700">Total Marks:</span>
                <span className="font-black text-indigo-600">{points} Points</span>
              </div>

              {/* Requirements Preview */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <ListChecks className="w-3.5 h-3.5 text-slate-500" />
                  <span>Project Requirements Checklist</span>
                </span>
                <div className="space-y-1.5">
                  {requirementsText.split('\n').filter(r => r.trim()).map((req, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Starter File Code Box (Only if provided) */}
              {starterCode && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 uppercase">
                    <span>Starter Template Code</span>
                    <span className="text-indigo-600 font-mono">{starterFileName || 'Code'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto max-h-40">
                    <pre>{starterCode}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
