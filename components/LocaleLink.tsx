'use client';

// ============================================
// PROOFY - Locale-aware Link component
// Automatically prepends the current locale to links
// ============================================

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ComponentProps } from 'react';

type LocaleLinkProps = ComponentProps<typeof Link>;

export default function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const locale = useLocale();

  // Handle string hrefs
  if (typeof href === 'string') {
    // Don't modify external links, hash links, or API routes
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('/api')) {
      return <Link href={href} {...props} />;
    }

    // Already has locale prefix
    if (href.startsWith(`/${locale}`)) {
      return <Link href={href} {...props} />;
    }

    // Add locale prefix
    const localizedHref = href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;
    return <Link href={localizedHref} {...props} />;
  }

  // Handle object hrefs
  if (typeof href === 'object' && href.pathname) {
    const pathname = href.pathname;
    
    if (pathname.startsWith('/api') || pathname.startsWith(`/${locale}`)) {
      return <Link href={href} {...props} />;
    }

    const localizedHref = {
      ...href,
      pathname: pathname.startsWith('/') ? `/${locale}${pathname}` : `/${locale}/${pathname}`,
    };
    return <Link href={localizedHref} {...props} />;
  }

  return <Link href={href} {...props} />;
}
