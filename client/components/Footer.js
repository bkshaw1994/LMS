import Link from 'next/link';
import { ExternalLink, Heart, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 text-sm text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Left: Brand & Copyright */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg gradient-bg-indigo flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-4.5 h-4.5" />
          </div>
          <p className="font-semibold text-slate-700 text-xs">
            © 2026 FullStack Pro LMS. Built for Web Development Excellence.
          </p>
        </div>

        {/* Center: Developer Credit */}
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200 shadow-2xs">
          <span>Developed with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
          <span>by</span>
          <a
            href="https://bishal-portfolio-chi.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 underline flex items-center space-x-1 transition-colors"
          >
            <span>Bishal Kumar Shaw</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Right: Footer Quick Links */}
        <div className="flex items-center space-x-6 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Curriculum
          </Link>
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
            Student Hub
          </Link>
          <a
            href="https://github.com/bkshaw1994/LMS"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 transition-colors"
          >
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
}
