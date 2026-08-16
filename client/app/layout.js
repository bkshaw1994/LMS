import './globals.css';
import { AuthProvider } from '../lib/authContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fullstack-pro-lms.vercel.app';

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Full-Stack Web Development LMS | 12-Week Intensive Bootcamp',
    template: '%s | FullStack Pro LMS',
  },
  description: 'Master full-stack web development in 12 weeks. Learn Vanilla JS, React, Next.js, Node.js, Express, MongoDB Atlas, and DevOps with hands-on projects and automated grading.',
  keywords: [
    'Full-Stack Web Development',
    'Learning Management System',
    'LMS',
    '12-Week Bootcamp',
    'Next.js 14',
    'React 18',
    'Node.js',
    'Express.js',
    'MongoDB Atlas',
    'DevOps',
    'JavaScript Course',
    'Bishal Kumar Shaw',
  ],
  authors: [{ name: 'Bishal Kumar Shaw', url: 'https://bishal-portfolio-chi.vercel.app/' }],
  creator: 'Bishal Kumar Shaw',
  publisher: 'FullStack Pro LMS',
  category: 'education',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Full-Stack Web Development LMS | 12-Week Intensive Bootcamp',
    description: 'Master full-stack web development in 12 weeks. Hands-on weekly GitHub projects, interactive knowledge tests, and automated progress tracking.',
    url: baseUrl,
    siteName: 'FullStack Pro LMS',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'FullStack Pro LMS Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Full-Stack Web Development LMS | 12-Week Intensive Bootcamp',
    description: 'Master full-stack web development in 12 weeks with hands-on projects and instant automated grading.',
    images: ['/icon.svg'],
    creator: '@bishalkumarshaw',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOccupationalProgram',
  name: '12-Week Full-Stack Web Development Training Program',
  description: 'Enterprise-grade Learning Management System designed for a 12-week intensive full-stack web development training program.',
  provider: {
    '@type': 'Organization',
    name: 'FullStack Pro LMS',
    url: baseUrl,
  },
  educationalCredentialAwarded: 'Full-Stack Specialist Certification',
  hasCourse: [
    {
      '@type': 'Course',
      name: 'Vanilla JS Fundamentals',
      description: 'Master core JavaScript variables, scope, functions, DOM manipulation, and ES6+ features.',
    },
    {
      '@type': 'Course',
      name: 'Advanced React & Next.js App Router',
      description: 'Build high-performance web apps using React 18, Next.js Server Components, and API integration.',
    },
    {
      '@type': 'Course',
      name: 'Node.js, Express & MongoDB Atlas Backend',
      description: 'Develop REST APIs with Express.js, JWT authentication, and MongoDB Atlas database modeling.',
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
