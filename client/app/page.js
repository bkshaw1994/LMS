'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { fetchApi } from '../lib/api';
import { 
  ArrowRight, 
  CheckCircle2, 
  Code, 
  Database, 
  Layout, 
  Server, 
  Terminal, 
  Layers, 
  Zap, 
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen
} from 'lucide-react';

const categoryBadges = {
  'Vanilla JS': { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Code },
  'React': { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: Layout },
  'Next.js': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Layers },
  'Node.js': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Server },
  'MongoDB': { bg: 'bg-green-50 text-green-700 border-green-200', icon: Database },
  'DevOps': { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Terminal },
};

const faqs = [
  {
    q: 'Do I need prior programming experience to enroll?',
    a: 'No prior coding experience is required. Week 1 starts from fundamental JavaScript concepts, HTML/CSS structure, and progressively builds up to full-stack Next.js and MongoDB applications.',
  },
  {
    q: 'How are weekly assignments and tests structured?',
    a: 'Each week features video lectures, a GitHub repository project assignment, and an interactive knowledge test (MCQs & Code Snippet Debugging).',
  },
  {
    q: 'Can I study at my own pace?',
    a: 'Yes, the curriculum is 100% self-paced. Modules are unlocked sequentially as you complete each week\'s lessons, assignment, and quiz.',
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const res = await fetchApi('/modules');
        if (res.success) {
          setModules(res.data);
        }
      } catch (err) {
        console.error('Failed to load modules:', err);
      }
    };
    loadModules();
  }, []);

  const categories = ['All', 'Vanilla JS', 'React', 'Next.js', 'Node.js', 'MongoDB', 'DevOps'];

  const filteredModules = selectedFilter === 'All'
    ? modules
    : modules.filter((m) => m.category === selectedFilter);

  return (
    <div className="space-y-24 pb-20 bg-dot-pattern">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 px-4 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 shadow-sm animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-700 tracking-wide uppercase">
            12-Week Intensive Software Engineering Program
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
          Master Full-Stack Web Development <br />
          <span className="gradient-text-light">From Zero to Production</span>
        </h1>

        <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
          A structured 12-week curriculum covering Vanilla JavaScript, React, Next.js App Router, Node.js, Express, MongoDB, and DevOps. Build real-world projects with interactive tests and progress tracking.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={user ? '/dashboard' : '/register'}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 gradient-bg-indigo text-white font-extrabold px-8 py-4 rounded-2xl text-base shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
          >
            <span>{user ? 'Go to Student Portal' : 'Register Now'}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <a
            href="#roadmap"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 font-extrabold px-8 py-4 rounded-2xl text-base border border-slate-200 shadow-sm transition-all"
          >
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Explore Syllabus</span>
          </a>
        </div>

        {/* Tech Stack Pills */}
        <div className="pt-10 flex flex-wrap items-center justify-center gap-3">
          {[
            { name: 'Vanilla JS', color: 'bg-amber-50 border-amber-200 text-amber-800' },
            { name: 'React 18', color: 'bg-cyan-50 border-cyan-200 text-cyan-800' },
            { name: 'Next.js 14', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
            { name: 'Node.js', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
            { name: 'MongoDB Atlas', color: 'bg-green-50 border-green-200 text-green-800' },
            { name: 'DevOps & Docker', color: 'bg-purple-50 border-purple-200 text-purple-800' },
          ].map((tech, i) => (
            <span
              key={i}
              className={`px-4 py-2 rounded-xl border text-xs font-bold shadow-2xs ${tech.color}`}
            >
              {tech.name}
            </span>
          ))}
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 light-card p-8 rounded-3xl border border-slate-200 bg-white shadow-md">
          {[
            { label: 'Curriculum Duration', val: '12 Weeks' },
            { label: 'Video Lectures', val: '48 Topics' },
            { label: 'GitHub Projects', val: '12 Projects' },
            { label: 'Knowledge Tests', val: '12 Assessments' },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold gradient-text-light">{stat.val}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bootcamp Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Why Train With FullStack Pro?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto font-medium">
            Everything you need to master full-stack software development with enterprise-grade quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Structured 12-Week Path',
              desc: 'From DOM manipulation in Week 1 to Docker and Vercel deployments in Week 12. No gaps, no fluff.',
              icon: Layers,
              badge: 'Curriculum',
            },
            {
              title: 'Real-Time Progress Tracker',
              desc: 'Check off weekly lessons and watch your overall course progress percentage update in real time.',
              icon: Zap,
              badge: 'Interactive',
            },
            {
              title: 'Full-Stack Architecture',
              desc: 'Build real RESTful APIs with Express, model MongoDB documents with Mongoose, and construct SSR Next.js apps.',
              icon: Server,
              badge: 'Hands-On',
            },
          ].map((feat, idx) => {
            const IconC = feat.icon;
            return (
              <div
                key={idx}
                className="light-card p-8 rounded-3xl light-card-hover flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl gradient-bg-indigo flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
                      <IconC className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Curriculum Roadmap Section (NO COLLAPSE / EXPAND) */}
      <section id="roadmap" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">12-Week Curriculum Roadmap</h2>
          <p className="text-slate-600 max-w-2xl mx-auto font-medium">
            Complete syllabus overview across all 12 modules.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === cat
                    ? 'gradient-bg-indigo text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Roadmap Cards - Fully Open Syllabus */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => {
            const badge = categoryBadges[module.category] || categoryBadges['Vanilla JS'];
            const IconComp = badge.icon;

            return (
              <div
                key={module.weekNumber}
                className="light-card p-6 rounded-3xl light-card-hover flex flex-col justify-between group bg-white border border-slate-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                      WEEK {module.weekNumber}
                    </span>
                    <span className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badge.bg}`}>
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{module.category}</span>
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">{module.description}</p>

                  {/* Always Visible Syllabus Lessons List (No Collapse/Expand) */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 block">
                      Syllabus Topics ({module.lessons ? module.lessons.length : 0} Lessons)
                    </span>

                    <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4 font-medium">
                      {module.lessons && module.lessons.map((lesson, idx) => (
                        <li key={idx}>
                          {lesson.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">{module.lessons ? module.lessons.length : 0} Lessons</span>
                  <Link
                    href={user ? `/dashboard/modules/${module.weekNumber}` : '/login'}
                    className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1"
                  >
                    <span>{user ? 'Study Week' : 'View Module'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center space-y-4 mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-sm font-medium">Everything you need to know before joining.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="light-card rounded-2xl overflow-hidden transition-all shadow-xs bg-white border border-slate-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between text-slate-900 font-bold text-base hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-12 rounded-3xl text-center relative overflow-hidden shadow-2xl text-white">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Start Your Web Development Career Today</h2>
          <p className="text-indigo-100 mt-4 max-w-xl mx-auto text-base font-medium">
            Enroll in the 12-week bootcamp and get instant access to all curriculum modules, lesson videos, and student progress tracking.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="bg-white text-indigo-900 font-extrabold px-9 py-4 rounded-2xl shadow-xl hover:bg-indigo-50 transition-all hover:scale-105 inline-flex items-center space-x-2.5 text-base"
            >
              <span>{user ? 'Go to Student Dashboard' : 'Register Now'}</span>
              <ArrowRight className="w-5 h-5 text-indigo-900" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
