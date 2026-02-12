import { MetadataRoute } from 'next';

/**
 * robots.txt configuration
 * Sprint 10.4: SEO optimization
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/settings',
          '/history',
          '/tool',
          '/failure',
          '/admin',
          '/auth',
          '/api',
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://gravix.com'}/sitemap.xml`,
  };
}
