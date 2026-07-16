'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Mail, Eye, Code, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Email Templates Page
 * Transactional email templates for various actions
 */

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  const templates = [
    {
      name: 'Welcome Email',
      description: 'First email sent to new users',
      category: 'Onboarding',
      subject: 'Welcome to Premium SaaS!',
      preview: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 0;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">✨</span>
            </div>
            <h1 style="color: #171717; margin: 20px 0 10px;">Welcome to Premium SaaS!</h1>
            <p style="color: #737373; font-size: 16px;">Thanks for joining us. We're excited to have you on board.</p>
          </div>
          
          <div style="background: #FAFBFC; border-radius: 12px; padding: 30px; margin: 20px 0;">
            <h2 style="color: #171717; font-size: 20px; margin: 0 0 15px;">Getting Started</h2>
            <ul style="color: #737373; line-height: 1.8; padding-left: 20px;">
              <li>Complete your profile</li>
              <li>Invite team members</li>
              <li>Create your first project</li>
              <li>Explore our features</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600;">
              Get Started
            </a>
          </div>
          
          <div style="border-top: 1px solid #E5E5E5; padding-top: 20px; margin-top: 40px; text-align: center; color: #A3A3A3; font-size: 14px;">
            <p>If you have any questions, feel free to reply to this email.</p>
            <p style="margin: 10px 0;">© 2024 Premium SaaS. All rights reserved.</p>
          </div>
        </div>
      `,
    },
    {
      name: 'Email Verification',
      description: 'Verify email address',
      category: 'Authentication',
      subject: 'Verify your email address',
      preview: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 0;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">✉️</span>
            </div>
            <h1 style="color: #171717; margin: 20px 0 10px;">Verify Your Email</h1>
            <p style="color: #737373; font-size: 16px;">Please confirm your email address to activate your account.</p>
          </div>
          
          <div style="background: #FAFBFC; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center;">
            <p style="color: #525252; margin-bottom: 20px;">Click the button below to verify your email address:</p>
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600;">
              Verify Email
            </a>
            <p style="color: #A3A3A3; font-size: 14px; margin-top: 20px;">This link expires in 24 hours.</p>
          </div>
          
          <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400E; margin: 0; font-size: 14px;">
              <strong>Security tip:</strong> If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
          
          <div style="border-top: 1px solid #E5E5E5; padding-top: 20px; margin-top: 40px; text-align: center; color: #A3A3A3; font-size: 14px;">
            <p>© 2024 Premium SaaS. All rights reserved.</p>
          </div>
        </div>
      `,
    },
    {
      name: 'Password Reset',
      description: 'Reset forgotten password',
      category: 'Authentication',
      subject: 'Reset your password',
      preview: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 0;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">🔐</span>
            </div>
            <h1 style="color: #171717; margin: 20px 0 10px;">Reset Your Password</h1>
            <p style="color: #737373; font-size: 16px;">We received a request to reset your password.</p>
          </div>
          
          <div style="background: #FAFBFC; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center;">
            <p style="color: #525252; margin-bottom: 20px;">Click the button below to choose a new password:</p>
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600;">
              Reset Password
            </a>
            <p style="color: #A3A3A3; font-size: 14px; margin-top: 20px;">This link expires in 1 hour.</p>
          </div>
          
          <div style="background: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #991B1B; margin: 0; font-size: 14px;">
              <strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email or contact support.
            </p>
          </div>
          
          <div style="border-top: 1px solid #E5E5E5; padding-top: 20px; margin-top: 40px; text-align: center; color: #A3A3A3; font-size: 14px;">
            <p>© 2024 Premium SaaS. All rights reserved.</p>
          </div>
        </div>
      `,
    },
    {
      name: 'Payment Successful',
      description: 'Payment confirmation',
      category: 'Billing',
      subject: 'Payment Received - Invoice #2024-001',
      preview: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 0;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">✓</span>
            </div>
            <h1 style="color: #171717; margin: 20px 0 10px;">Payment Successful!</h1>
            <p style="color: #737373; font-size: 16px;">Thank you for your payment. Here's your receipt.</p>
          </div>
          
          <div style="background: #FAFBFC; border-radius: 12px; padding: 30px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <span style="color: #737373;">Invoice Number</span>
              <strong style="color: #171717;">#2024-001</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <span style="color: #737373;">Date</span>
              <strong style="color: #171717;">January 15, 2024</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <span style="color: #737373;">Plan</span>
              <strong style="color: #171717;">Pro Plan</strong>
            </div>
            <div style="border-top: 2px solid #E5E5E5; margin: 20px 0; padding-top: 20px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #171717; font-size: 18px; font-weight: 600;">Total Paid</span>
                <strong style="color: #10b981; font-size: 24px;">$29.00</strong>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="display: inline-block; background: white; color: #6366f1; padding: 12px 28px; border: 2px solid #6366f1; border-radius: 10px; text-decoration: none; font-weight: 600;">
              Download Invoice
            </a>
          </div>
          
          <div style="border-top: 1px solid #E5E5E5; padding-top: 20px; margin-top: 40px; text-align: center; color: #A3A3A3; font-size: 14px;">
            <p>Questions about your payment? Contact support@example.com</p>
            <p style="margin: 10px 0;">© 2024 Premium SaaS. All rights reserved.</p>
          </div>
        </div>
      `,
    },
    {
      name: 'Team Invitation',
      description: 'Invite new team member',
      category: 'Team',
      subject: 'You\'ve been invited to join a team',
      preview: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 0;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">👥</span>
            </div>
            <h1 style="color: #171717; margin: 20px 0 10px;">You have been Invited!</h1>
            <p style="color: #737373; font-size: 16px;">John Doe has invited you to join their team on Premium SaaS.</p>
          </div>
          
          <div style="background: #FAFBFC; border-radius: 12px; padding: 30px; margin: 20px 0;">
            <h3 style="color: #171717; margin-top: 0;">Team Details</h3>
            <div style="margin: 15px 0;">
              <span style="color: #737373; display: block; margin-bottom: 5px;">Team Name</span>
              <strong style="color: #171717; font-size: 16px;">Acme Inc.</strong>
            </div>
            <div style="margin: 15px 0;">
              <span style="color: #737373; display: block; margin-bottom: 5px;">Your Role</span>
              <span style="display: inline-block; background: #E0E7FF; color: #4338CA; padding: 4px 12px; border-radius: 6px; font-size: 14px; font-weight: 600;">Member</span>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600;">
              Accept Invitation
            </a>
          </div>
          
          <div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1E40AF; margin: 0; font-size: 14px;">
              This invitation expires in 7 days. If you do not want to join, you can ignore this email.
            </p>
          </div>
          
          <div style="border-top: 1px solid #E5E5E5; padding-top: 20px; margin-top: 40px; text-align: center; color: #A3A3A3; font-size: 14px;">
            <p>© 2024 Premium SaaS. All rights reserved.</p>
          </div>
        </div>
      `,
    },
  ];

  const copyCode = () => {
    navigator.clipboard.writeText(templates[selectedTemplate].preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
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
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Email Templates</h1>
          <p className="text-lg text-neutral-600">
            Beautifully designed transactional email templates
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Template List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden sticky top-8">
              <div className="p-6 border-b border-neutral-100">
                <h2 className="text-lg font-bold text-neutral-900">Templates</h2>
                <p className="text-sm text-neutral-600">Select a template to preview</p>
              </div>

              <div className="divide-y divide-neutral-100">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTemplate(index)}
                    className={`w-full p-4 text-left hover:bg-neutral-50 transition-colors ${
                      selectedTemplate === index ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-neutral-900">{template.name}</h3>
                      <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-neutral-600">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Preview Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 mb-1">
                    {templates[selectedTemplate].name}
                  </h2>
                  <p className="text-sm text-neutral-600">
                    Subject: {templates[selectedTemplate].subject}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-neutral-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`px-3 py-1.5 rounded text-sm font-semibold transition-all ${
                        viewMode === 'preview'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      Preview
                    </button>
                    <button
                      onClick={() => setViewMode('code')}
                      className={`px-3 py-1.5 rounded text-sm font-semibold transition-all ${
                        viewMode === 'code'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Code className="w-4 h-4 inline mr-1" />
                      Code
                    </button>
                  </div>

                  <Button variant="outline" size="sm" onClick={copyCode}>
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {viewMode === 'preview' ? (
                  <div 
                    className="bg-white border border-neutral-200 rounded-lg overflow-auto"
                    style={{ maxHeight: '600px' }}
                    dangerouslySetInnerHTML={{ __html: templates[selectedTemplate].preview }}
                  />
                ) : (
                  <pre className="bg-neutral-900 text-neutral-100 p-6 rounded-lg overflow-auto text-sm" style={{ maxHeight: '600px' }}>
                    <code>{templates[selectedTemplate].preview}</code>
                  </pre>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-200">
              <div className="flex gap-3">
                <Mail className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2">Email Best Practices</h3>
                  <ul className="space-y-1 text-sm text-neutral-700">
                    <li>• Use inline CSS for maximum compatibility</li>
                    <li>• Test across multiple email clients</li>
                    <li>• Keep total width under 600px</li>
                    <li>• Use web-safe fonts (Arial, Helvetica, etc.)</li>
                    <li>• Include plain text version for accessibility</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
