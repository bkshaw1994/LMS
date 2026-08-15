import './globals.css';
import { AuthProvider } from '../lib/authContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
