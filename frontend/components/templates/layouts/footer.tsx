'use client';

import Link from 'next/link';
import { Hexagon, MessageCircle, Code, Briefcase, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FooterProps {
  variant?: 'default' | 'minimal' | 'full';
  className?: string;
}

export function Footer({ variant = 'default', className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer
        className={cn(
          'w-full py-6 px-6 border-t border-neutral-200 bg-white',
          className
        )}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
          <p>© {currentYear} Platform CMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-neutral-900 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  if (variant === 'full') {
    return (
      <footer
        className={cn(
          'w-full bg-gradient-to-br from-neutral-900 to-neutral-800 text-white',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Hexagon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">Platform CMS</p>
                  <p className="text-sm text-white/60">Enterprise Solution</p>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
                Build faster, ship better, and scale infinitely with the modern
                platform trusted by teams at the world's leading companies.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {[
                  { icon: MessageCircle, href: '#' },
                  { icon: Code, href: '#' },
                  { icon: Briefcase, href: '#' },
                  { icon: Mail, href: '#' },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Security', 'Roadmap'],
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact'],
              },
              {
                title: 'Resources',
                links: ['Documentation', 'Help Center', 'API Reference', 'Status'],
              },
            ].map((column, index) => (
              <div key={index}>
                <h3 className="text-sm font-bold mb-4">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href="#"
                        className="text-sm text-white/70 hover:text-white transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/60">
              © {currentYear} Platform CMS. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Default variant
  return (
    <footer
      className={cn(
        'w-full py-8 px-6 border-t border-neutral-200 bg-[#FAFBFC]',
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Hexagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">Platform CMS</p>
              <p className="text-xs text-neutral-500">Enterprise Solution</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-sm">
            {['Features', 'Pricing', 'Docs', 'Support', 'Blog'].map(
              (link, index) => (
                <Link
                  key={index}
                  href="#"
                  className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                >
                  {link}
                </Link>
              )
            )}
          </div>

          {/* Social */}
          <div className="flex items-center gap-2">
            {[
              { icon: MessageCircle, href: '#' },
              { icon: Code, href: '#' },
              { icon: Briefcase, href: '#' },
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors text-neutral-600 hover:text-neutral-900"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
          <p>© {currentYear} Platform CMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-neutral-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
