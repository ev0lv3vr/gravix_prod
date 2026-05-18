import { MetadataRoute } from 'next';
import { APP_URL } from '@/lib/env';

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
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
