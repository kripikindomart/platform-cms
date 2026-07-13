'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, User, Settings, CreditCard, Bell, Shield, HelpCircle, FileText, Lock, Mail } from 'lucide-react';

/**
 * Pages Gallery
 * Index page showing all available page templates
 */

export default function PagesGalleryPage() {
  const pages = [
    {
      title: 'Profile Settings',
      description: 'User profile with avatar upload, bio, and personal information',
      icon: User,
      color: 'from-indigo-500 to-blue-600',
      href: '/dashboard/pages/profile',
      status: 'available',
    },
    {
      title: 'Account Settings',
      description: 'Account preferences, password change, and security settings',
      icon: Settings,
      color: 'from-purple-500 to-pink-600',
      href: '/dashboard/pages/account',
      status: 'available',
    },
    {
      title: 'Billing & Subscription',
      description: 'Payment methods, invoices, and subscription management',
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-600',
      href: '/dashboard/pages/billing',
      status: 'available',
    },
    {
      title: 'Notifications',
      description: 'Notification preferences and activity center',
      icon: Bell,
      color: 'from-amber-500 to-orange-600',
      href: '/dashboard/pages/notifications',
      status: 'available',
    },
    {
      title: 'Security',
      description: 'Two-factor authentication, sessions, and security log',
      icon: Shield,
      color: 'from-rose-500 to-red-600',
      href: '#',
      status: 'coming-soon',
    },
    {
      title: 'Help & Support',
      description: 'FAQ, contact support, and documentation',
      icon: HelpCircle,
      color: 'from-cyan-500 to-blue-600',
      href: '#',
      status: 'coming-soon',
    },
    {
      title: 'Privacy Policy',
      description: 'Terms of service and privacy policy pages',
      icon: FileText,
      color: 'from-violet-500 to-purple-600',
      href: '#',
      status: 'coming-soon',
    },
    {
      title: 'Team Management',
      description: 'Invite members, manage roles, and team settings',
      icon: Lock,
      color: 'from-fuchsia-500 to-pink-600',
      href: '/dashboard/pages/team',
      status: 'available',
    },
    {
      title: 'Email Templates',
      description: 'Transactional email templates for various actions',
      icon: Mail,
      color: 'from-sky-500 to-blue-600',
      href: '#',
      status: 'coming-soon',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Page Templates</h1>
          <p className="text-lg text-neutral-600">
            Complete page templates for common application features
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold border border-amber-200">
            <Settings className="w-4 h-4" />
            Coming Soon - In Development
          </div>
        </motion.div>
      </div>

      {/* Pages Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page, index) => {
            const Icon = page.icon;
            return (
              <motion.div
                key={page.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {page.status === 'available' ? (
                  <Link href={page.href}>
                    <div className="group relative p-6 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 h-full cursor-pointer">
                      {/* Available Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">
                        Available
                      </div>

                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 ${page.color}`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {page.title}
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {page.description}
                      </p>

                      {/* Features */}
                      <div className="mt-4 pt-4 border-t border-neutral-100">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg">
                            Responsive
                          </span>
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg">
                            Forms
                          </span>
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg">
                            Validation
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="group relative p-6 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 h-full">
                    {/* Coming Soon Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg">
                      Coming Soon
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 ${page.color}`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">
                      {page.title}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {page.description}
                    </p>

                    {/* Placeholder Features */}
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg">
                          Responsive
                        </span>
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg">
                          Forms
                        </span>
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg">
                          Validation
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-200"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">What's Coming</h2>
          <p className="text-neutral-600 mb-6">
            We're actively developing these page templates to provide you with production-ready components
            for common application features. Each page will include:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Complete layouts with navigation',
              'Form validation and error handling',
              'Responsive design for all devices',
              'Accessible components (WCAG)',
              'Dark mode support',
              'Loading and empty states',
              'Premium animations',
              'TypeScript support',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-neutral-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-white rounded-xl border border-neutral-200">
            <p className="text-sm text-neutral-600">
              <strong className="text-neutral-900">✅ Now Available:</strong> Profile, Account, Billing, Notifications, and Team Management pages are ready to use!
              The remaining templates (Security, Help, Privacy, Email) are in development.
            </p>
          </div>
        </motion.div>

        {/* Available Now Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 p-8 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">Available Now</h2>
          <p className="text-neutral-600 mb-6">
            While these page templates are in development, you can already use:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/auth"
              className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-colors"
            >
              <h3 className="font-semibold text-neutral-900 mb-1">8 Auth Pages</h3>
              <p className="text-sm text-neutral-600">Login, Register, Reset, OTP, etc.</p>
            </Link>
            <Link
              href="/dashboard/forms"
              className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-colors"
            >
              <h3 className="font-semibold text-neutral-900 mb-1">6 Form Templates</h3>
              <p className="text-sm text-neutral-600">Contact, Profile, Checkout, etc.</p>
            </Link>
            <Link
              href="/dashboard/states"
              className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors"
            >
              <h3 className="font-semibold text-neutral-900 mb-1">6 State Pages</h3>
              <p className="text-sm text-neutral-600">404, 500, Empty, Success, etc.</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
