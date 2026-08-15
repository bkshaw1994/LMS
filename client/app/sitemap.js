export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fullstack-pro-lms.vercel.app';

  const routes = ['', '/login', '/register', '/dashboard', '/dashboard/profile'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'weekly' : route === '/dashboard' ? 'daily' : 'monthly',
    priority: route === '' ? 1.0 : route === '/dashboard' ? 0.8 : 0.5,
  }));

  return routes;
}
