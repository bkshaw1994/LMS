export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fullstack-pro-lms.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/modules/*/test', '/dashboard/modules/*/assignment'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
