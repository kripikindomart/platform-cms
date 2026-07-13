'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Download, Check, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Billing & Subscription Page
 * Payment methods, invoices, and subscription management
 */

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        '5 projects',
        '1 GB storage',
        'Basic support',
        'Community access',
      ],
      current: true,
    },
    {
      name: 'Pro',
      price: { monthly: 29, yearly: 290 },
      description: 'For professional use',
      features: [
        'Unlimited projects',
        '100 GB storage',
        'Priority support',
        'Advanced analytics',
        'Custom domain',
        'API access',
      ],
      popular: true,
      current: false,
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, yearly: 990 },
      description: 'For large teams',
      features: [
        'Everything in Pro',
        'Unlimited storage',
        '24/7 phone support',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
      ],
      current: false,
    },
  ];

  const invoices = [
    { id: 'INV-2024-001', date: 'Jan 1, 2024', amount: 29, status: 'paid' },
    { id: 'INV-2023-012', date: 'Dec 1, 2023', amount: 29, status: 'paid' },
    { id: 'INV-2023-011', date: 'Nov 1, 2023', amount: 29, status: 'paid' },
    { id: 'INV-2023-010', date: 'Oct 1, 2023', amount: 29, status: 'paid' },
  ];

  const paymentMethods = [
    {
      type: 'Visa',
      last4: '4242',
      expiry: '12/25',
      default: true,
    },
    {
      type: 'Mastercard',
      last4: '5555',
      expiry: '08/26',
      default: false,
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
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Billing & Subscription</h1>
          <p className="text-lg text-neutral-600">
            Manage your subscription, payment methods, and invoices
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/30 overflow-hidden text-white p-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">Free Plan</h2>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Current
                </Badge>
              </div>
              <p className="text-white/80">5 projects • 1 GB storage</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xl">
              <Zap className="w-8 h-8" />
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/80 mb-1">Next billing date</p>
              <p className="text-xl font-bold">N/A - Free Plan</p>
            </div>
            <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-white/90">
              Upgrade Plan
            </Button>
          </div>
        </motion.div>

        {/* Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">Available Plans</h2>
              
              {/* Billing Toggle */}
              <div className="flex items-center gap-3 bg-neutral-100 p-1 rounded-xl">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Yearly
                  <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    plan.popular
                      ? 'border-indigo-500 shadow-xl shadow-indigo-500/20'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-neutral-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-neutral-900">
                        ${plan.price[billingCycle]}
                      </span>
                      <span className="text-neutral-600">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.current ? 'outline' : plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">Payment Methods</h2>
              <Button variant="primary">Add Payment Method</Button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center shadow-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-neutral-900">
                          {method.type} •••• {method.last4}
                        </h3>
                        {method.default && (
                          <Badge variant="default">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">Expires {method.expiry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.default && (
                      <Button variant="outline" size="sm">
                        Set Default
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Invoice History</h2>

            <div className="space-y-2">
              {invoices.map((invoice, index) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 hover:bg-neutral-50 rounded-xl border border-transparent hover:border-neutral-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                      <Download className="w-5 h-5 text-neutral-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{invoice.id}</h3>
                      <p className="text-sm text-neutral-600">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-neutral-900">${invoice.amount}.00</span>
                    <Badge variant="default">Paid</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
