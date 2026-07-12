'use client';

import { useState } from 'react';
import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { FormSection, FormField, FormSuccess } from '@/components/templates/forms';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';

export default function ContactFormPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.message) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen bg-[#FAFBFC]">
        <FloatingSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <FormSuccess
              title="Message Sent!"
              message="Thank you for contacting us. We'll get back to you within 24 hours."
              actionLabel="Send Another Message"
              onAction={() => {
                setIsSuccess(false);
                setFormData({ name: '', email: '', subject: '', message: '' });
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Contact Form
            </h1>
            <p className="text-neutral-600">
              Simple contact form with validation and error handling.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <FormSection
              title="Get in Touch"
              description="Fill out the form below and we'll get back to you as soon as possible."
              icon={Mail}
            >
              {/* Name */}
              <FormField
                label="Full Name"
                required
                error={errors.name}
              >
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

              {/* Email */}
              <FormField
                label="Email Address"
                required
                error={errors.email}
              >
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

              {/* Subject */}
              <FormField
                label="Subject"
                required
                error={errors.subject}
              >
                <Select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  options={[
                    { value: '', label: 'Select a subject' },
                    { value: 'general', label: 'General Inquiry' },
                    { value: 'support', label: 'Technical Support' },
                    { value: 'sales', label: 'Sales Question' },
                    { value: 'feedback', label: 'Feedback' },
                  ]}
                  className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

              {/* Message */}
              <FormField
                label="Message"
                required
                error={errors.message}
                hint="Minimum 10 characters"
              >
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  className="rounded-xl border-neutral-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setFormData({ name: '', email: '', subject: '', message: '' })}
                  className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </div>
            </FormSection>
          </form>
        </div>
      </main>
    </div>
  );
}
