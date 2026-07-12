'use client';

import { useState } from 'react';
import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { FormSection, FormField, FileUpload, FormSuccess } from '@/components/templates/forms';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { User, MapPin, Briefcase, Loader2 } from 'lucide-react';

export default function UserProfileFormPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    company: '',
    jobTitle: '',
    website: '',
    address: '',
    city: '',
    country: '',
  });
  const [avatar, setAvatar] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen bg-[#FAFBFC]">
        <FloatingSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <FormSuccess
              title="Profile Updated!"
              message="Your profile has been successfully updated. Changes are now visible to other users."
              actionLabel="View Profile"
              onAction={() => setIsSuccess(false)}
              secondaryLabel="Edit Again"
              onSecondary={() => setIsSuccess(false)}
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              User Profile Form
            </h1>
            <p className="text-neutral-600">
              Complete profile form with avatar upload and multiple sections.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <FormSection
              title="Personal Information"
              description="Basic information about yourself"
              icon={User}
            >
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Profile Photo
                </label>
                <FileUpload
                  accept="image/*"
                  maxSize={5}
                  onFilesChange={setAvatar}
                />
              </div>

              {/* Name */}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="First Name" required error={errors.firstName}>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
                <FormField label="Last Name" required error={errors.lastName}>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
              </div>

              {/* Contact */}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Email" required error={errors.email}>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
                <FormField label="Phone" error={errors.phone}>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
              </div>

              {/* Bio */}
              <FormField label="Bio" hint="Tell us about yourself">
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="I'm a..."
                  rows={4}
                  className="rounded-xl border-neutral-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>
            </FormSection>

            {/* Professional Information */}
            <FormSection
              title="Professional Information"
              description="Your work and career details"
              icon={Briefcase}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Company">
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Inc."
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
                <FormField label="Job Title">
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="Software Engineer"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
              </div>
              <FormField label="Website">
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>
            </FormSection>

            {/* Location */}
            <FormSection
              title="Location"
              description="Where are you based?"
              icon={MapPin}
            >
              <FormField label="Address">
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street"
                  className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="City">
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Francisco"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
                <FormField label="Country">
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
