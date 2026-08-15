import './globals.css';
import { AuthProvider } from '../lib/authContext';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Full-Stack Web Development LMS | 12-Week Intensive Bootcamp',
  description: 'Master full-stack web development in 12 weeks. Vanilla JS, React, Next.js, Node.js, MongoDB, and DevOps.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <div className="relative min-h-screen flex flex-col">
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <footer className="border-t border-gray-800/80 py-8 bg-slate-950/40 text-center text-sm text-gray-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p>© 2026 FullStack LMS Bootcamp. Built for Web Development Excellence.</p>
                <div className="flex space-x-6 text-gray-400">
                  <span className="hover:text-gray-200 cursor-pointer">Curriculum</span>
                  <span className="hover:text-gray-200 cursor-pointer">Student Hub</span>
                  <span className="hover:text-gray-200 cursor-pointer">Documentation</span>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
