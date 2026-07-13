'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Search, MessageCircle, Book, Mail, FileText, ExternalLink, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

/**
 * Help & Support Page
 * FAQ, contact support, and documentation
 */

export default function HelpSupportPage() {
  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        { q: 'How do I create my first project?', a: 'Navigate to the Projects page and click "New Project". Fill in the required information and click "Create".' },
        { q: 'How do I invite team members?', a: 'Go to Team Management, click "Invite Member", enter their email address and select their role.' },
        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.' },
      ],
    },
    {
      category: 'Account & Billing',
      questions: [
        { q: 'How do I upgrade my plan?', a: 'Visit the Billing page and select the plan you want to upgrade to. Your new plan will be active immediately.' },
        { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.' },
        { q: 'Do you offer refunds?', a: 'We offer a 30-day money-back guarantee for all paid plans. Contact support for refund requests.' },
      ],
    },
    {
      category: 'Security & Privacy',
      questions: [
        { q: 'How is my data protected?', a: 'We use industry-standard encryption (AES-256) to protect your data both in transit and at rest.' },
        { q: 'Do you share my data with third parties?', a: 'No, we never sell or share your data with third parties. Read our Privacy Policy for details.' },
        { q: 'How do I enable two-factor authentication?', a: 'Go to Security Settings and toggle on 2FA. Follow the instructions to set up with your authenticator app.' },
      ],
    },
  ];

  const resources = [
    {
      title: 'Documentation',
      description: 'Comprehensive guides and API reference',
      icon: Book,
      color: 'from-blue-500 to-cyan-600',
      href: '#',
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      icon: FileText,
      color: 'from-purple-500 to-pink-600',
      href: '#',
    },
    {
      title: 'Community Forum',
      description: 'Get help from the community',
      icon: MessageCircle,
      color: 'from-emerald-500 to-teal-600',
      href: '#',
    },
    {
      title: 'API Reference',
      description: 'Developer documentation',
      icon: ExternalLink,
      color: 'from-amber-500 to-orange-600',
      href: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
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
          className="text-center max-w-3xl mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">How can we help you?</h1>
          <p className="text-lg text-neutral-600 mb-8">
            Search our knowledge base or contact support
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Search for help articles..."
              className="pl-12 h-14 text-lg"
            />
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Quick Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Quick Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Link key={index} href={resource.href}>
                  <div className="group p-6 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform ${resource.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-neutral-600">{resource.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 bg-neutral-50 border-b border-neutral-100">
                  <h3 className="text-lg font-bold text-neutral-900">{category.category}</h3>
                </div>
                <div className="p-6 space-y-6">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex}>
                      <h4 className="font-semibold text-neutral-900 mb-2 flex items-start gap-2">
                        <span className="text-indigo-600 flex-shrink-0">Q:</span>
                        {faq.q}
                      </h4>
                      <p className="text-neutral-600 pl-6">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Contact Support</h2>
                <p className="text-sm text-neutral-600">Can't find what you're looking for? Send us a message</p>
              </div>
            </div>

            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Your Name
                  </label>
                  <Input placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Subject
                </label>
                <Input placeholder="How can we help?" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Message
                </label>
                <Textarea
                  placeholder="Describe your issue or question..."
                  rows={6}
                />
              </div>

              <div className="flex justify-end">
                <Button variant="primary">Send Message</Button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Support Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm text-center">
            <MessageCircle className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-bold text-neutral-900 mb-2">Live Chat</h3>
            <p className="text-sm text-neutral-600 mb-4">Available 24/7 for instant support</p>
            <Button variant="outline" size="sm">Start Chat</Button>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm text-center">
            <Mail className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-bold text-neutral-900 mb-2">Email Support</h3>
            <p className="text-sm text-neutral-600 mb-4">We'll respond within 24 hours</p>
            <p className="text-sm font-mono text-indigo-600">support@example.com</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm text-center">
            <Book className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-bold text-neutral-900 mb-2">Documentation</h3>
            <p className="text-sm text-neutral-600 mb-4">Detailed guides and tutorials</p>
            <Button variant="outline" size="sm">View Docs</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
