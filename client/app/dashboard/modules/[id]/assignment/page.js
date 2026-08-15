'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../../lib/authContext';
import { fetchApi } from '../../../../../lib/api';
import { 
  ArrowLeft, 
  Github, 
  CheckCircle2, 
  ExternalLink, 
  Code, 
  FileCode, 
  Loader2,
  AlertCircle,
  Award,
  Sparkles,
  Send,
  Lock,
  ArrowRight,
  PlayCircle,
  Copy,
  Check,
  Download
} from 'lucide-react';

export default function AssignmentPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [moduleItem, setModuleItem] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadAssignmentData = async () => {
      if (!user || !id) return;
      try {
        const modRes = await fetchApi(`/modules/${id}`);
        if (modRes.success) setModuleItem(modRes.data);

        try {
          const subRes = await fetchApi(`/assignments/${id}`);
          if (subRes.success && subRes.data) {
            setSubmission(subRes.data);
            setGithubUrl(subRes.data.githubUrl || '');
            setNotes(subRes.data.notes || '');
          }
        } catch (e) {}

      } catch (err) {
        console.error('Error fetching assignment data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadAssignmentData();
    }
  }, [user, id]);

  const handleCopyCode = () => {
    if (!moduleItem?.assignment?.starterCode) return;
    navigator.clipboard.writeText(moduleItem.assignment.starterCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCode = () => {
    if (!moduleItem?.assignment?.starterCode) return;
    const filename = moduleItem.assignment.starterFileName || 'starter-template.js';
    const blob = new Blob([moduleItem.assignment.starterCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const githubRegex = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/;
    if (!githubRegex.test(githubUrl.trim())) {
      setError('Please enter a valid GitHub URL (e.g., https://github.com/username/repository)');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetchApi('/assignments/submit', {
        method: 'POST',
        body: JSON.stringify({
          moduleId: moduleItem._id,
          githubUrl: githubUrl.trim(),
          notes,
        }),
      });

      if (res.success && res.data) {
        setSubmission(res.data);
        setSuccessMsg('GitHub repository assignment submitted successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-600 text-sm font-semibold">Loading assignment brief & starter template...</p>
      </div>
    );
  }

  if (!moduleItem || !moduleItem.assignment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Assignment Not Found</h2>
        <p className="text-slate-600">The requested weekly assignment does not exist.</p>
        <Link
          href={`/dashboard/modules/${id}`}
          className="inline-flex items-center space-x-2 text-indigo-600 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Module</span>
        </Link>
      </div>
    );
  }

  const { assignment } = moduleItem;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-dot-pattern">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/modules/${moduleItem.weekNumber}`}
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Week {moduleItem.weekNumber} Workspace</span>
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
          WEEK {moduleItem.weekNumber} PROJECT
        </span>
      </div>

      {/* Assignment Header Card */}
      <div className="light-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
            <Code className="w-3.5 h-3.5" />
            <span>GitHub Repository Assignment</span>
          </div>

          {submission ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Submitted</span>
            </span>
          ) : (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Pending Submission
            </span>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900">{assignment.title}</h1>
        <p className="text-slate-600 text-sm leading-relaxed font-medium">{assignment.description}</p>
      </div>

      {/* Starter Template Boilerplate Codeblock Card */}
      {assignment.starterCode && (
        <div className="light-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-extrabold text-slate-900">
                Starter Code Template: <span className="font-mono text-indigo-600">{assignment.starterFileName || 'starter.js'}</span>
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleDownloadCode}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-100 font-mono-code text-xs overflow-x-auto shadow-inner">
            <pre><code>{assignment.starterCode}</code></pre>
          </div>
        </div>
      )}

      {/* Grid: Project Requirements + Submission Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Deliverables Checklist */}
        <div className="lg:col-span-2 light-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <span>Project Deliverables & Requirements</span>
          </h2>

          <div className="space-y-3">
            {assignment.requirements && assignment.requirements.map((req, idx) => (
              <div key={idx} className="flex items-start space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg gradient-bg-indigo flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm font-semibold text-slate-800">{req}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">Submission Guidance</span>
            <p className="text-xs text-slate-700 font-medium">
              Create a public GitHub repository, paste the starter code into your project, push your code to GitHub, and paste your public repository URL on the right.
            </p>
          </div>
        </div>

        {/* GitHub Submission Form */}
        <div className="space-y-6">
          <div className="light-card p-6 rounded-3xl border border-slate-200 space-y-5 bg-white shadow-md">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Submit Project</h3>
                <p className="text-xs text-slate-500 font-medium">Paste public GitHub repo URL</p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2 font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">GitHub Repository URL</label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full pl-3.5 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-semibold"
                    placeholder="https://github.com/username/project-repo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Submission Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-medium"
                  placeholder="Notes for reviewer..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full gradient-bg-indigo hover:opacity-95 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 text-xs disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{submission ? 'Update Submission' : 'Submit Assignment'}</span>
                  </>
                )}
              </button>
            </form>

            {submission && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <span className="text-slate-500 font-medium">Submitted Repo:</span>
                <a
                  href={submission.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-bold text-indigo-600 hover:text-indigo-800 truncate underline"
                >
                  {submission.githubUrl}
                </a>
                <p className="text-[10px] text-slate-400">
                  Last updated: {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
