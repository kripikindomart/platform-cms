'use client';

import Link, { LinkProps } from 'next/link';
import { usePortalRouter } from '@/hooks/use-portal-router';
import React from 'react';

interface PortalLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Link component that automatically adds tenant prefix
 * Use this instead of Next.js Link for portal routes
 * 
 * @example
 * <PortalLink href="users/123">View User</PortalLink>
 * // Renders: <Link href="/org/acme/portal/users/123">
 */
export function PortalLink({ href, children, className, ...props }: PortalLinkProps) {
  const { url } = usePortalRouter();
  
  // Convert relative portal path to full tenant-aware URL
  const fullHref = href.startsWith('/') && !href.startsWith('/org/') 
    ? url(href.replace('/portal/', ''))
    : href;

  return (
    <Link href={fullHref} className={className} {...props}>
      {children}
    </Link>
  );
}
