export default function manifest() {
  return {
    name: 'FullStack Pro LMS - 12-Week Development Bootcamp',
    short_name: 'FullStack LMS',
    description: 'Enterprise-grade Learning Management System for 12-week full-stack web development training.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
