export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fullstack-pro-lms.vercel.app';

  const staticRoutes = ['', '/login', '/register', '/dashboard', '/dashboard/profile'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : route === '/dashboard' ? 'daily' : 'monthly',
    priority: route === '' ? 1.0 : route === '/dashboard' ? 0.8 : 0.5,
  }));

  const moduleRoutes = Array.from({ length: 12 }, (_, i) => i + 1).map((week) => ({
    url: `${baseUrl}/dashboard/modules/${week}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...moduleRoutes];
}
