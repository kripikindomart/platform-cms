'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, FileText, UserCheck } from 'lucide-react';

/**
 * Privacy Policy Page
 * Terms of service and privacy policy
 */

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      icon: Database,
      color: 'from-blue-500 to-cyan-600',
      content: [
        'Account information (name, email, password)',
        'Profile information you provide',
        'Usage data and analytics',
        'Device and browser information',
        'Cookies and similar technologies',
      ],
    },
    {
      title: 'How We Use Your Information',
      icon: Eye,
      color: 'from-purple-500 to-pink-600',
      content: [
        'Provide and improve our services',
        'Communicate with you about updates',
        'Personalize your experience',
        'Ensure security and prevent fraud',
        'Comply with legal obligations',
      ],
    },
    {
      title: 'Data Security',
      icon: Lock,
      color: 'from-emerald-500 to-teal-600',
      content: [
        'Industry-standard encryption (AES-256)',
        'Secure data centers with 24/7 monitoring',
        'Regular security audits and updates',
        'Multi-factor authentication support',
        'Employee access controls',
      ],
    },
    {
      title: 'Your Rights',
      icon: UserCheck,
      color: 'from-amber-500 to-orange-600',
      content: [
        'Access your personal data',
        'Request data correction or deletion',
        'Export your data',
        'Opt-out of marketing communications',
        'Close your account at any time',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link
          href="/dashboard/pages"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pages
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Privacy Policy</h1>
          <p className="text-lg text-neutral-600 mb-2">
            How we collect, use, and protect your information
          </p>
          <p className="text-sm text-neutral-500">
            Last updated: January 2024
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-200 p-8"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Introduction</h2>
          <p className="text-neutral-700 leading-relaxed mb-4">
            At Premium SaaS Template, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
          </p>
          <p className="text-neutral-700 leading-relaxed">
            By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
          </p>
        </motion.div>

        {/* Privacy Sections */}
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg ${section.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900">{section.title}</h2>
                </div>

                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
                      <span className="text-neutral-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}

        {/* Data Sharing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Data Sharing and Disclosure</h2>
            <p className="text-neutral-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
                <span className="text-neutral-700">
                  <strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (hosting, analytics, customer support)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
                <span className="text-neutral-700">
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
                <span className="text-neutral-700">
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
                </span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Cookies and Tracking</h2>
            <p className="text-neutral-700 mb-4">
              We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-2">Essential Cookies</h3>
                <p className="text-sm text-neutral-600">Required for the service to function properly</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-2">Analytics Cookies</h3>
                <p className="text-sm text-neutral-600">Help us understand how you use our service</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-neutral-900">Contact Us</h2>
            </div>
            <p className="text-neutral-700 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-neutral-700">
              <p><strong>Email:</strong> privacy@example.com</p>
              <p><strong>Address:</strong> 123 Privacy Street, San Francisco, CA 94102</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </div>
        </motion.div>

        {/* Changes to Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-6 bg-amber-50 rounded-2xl border border-amber-200"
        >
          <h3 className="font-bold text-amber-900 mb-2">Changes to This Policy</h3>
          <p className="text-sm text-amber-800">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
