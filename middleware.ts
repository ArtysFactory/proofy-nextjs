// ============================================
// PROOFY - Middleware for i18n routing
// ============================================

import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Don't redirect to default locale prefix (fr)
  // So /dashboard works as /fr/dashboard
  localePrefix: 'as-needed',

  // Detect locale from Accept-Language header
  localeDetection: true,
});

export const config = {
  // Match all pathnames except for
  // - API routes (/api/...)
  // - Static files (_next/static/...)
  // - Public files (favicon.ico, etc.)
  matcher: [
    // Match all pathnames except for
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
