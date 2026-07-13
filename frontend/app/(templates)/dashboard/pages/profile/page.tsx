'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Upload, Camera, User, Mail, Phone, MapPin, Globe, Briefcase, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

/**
 * Profile Settings Page
 * User profile with avatar upload, bio, and personal information
 */

export default function ProfileSettingsPage() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Product designer and frontend developer. Passionate about creating beautiful and functional user experiences.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.com',
    company: 'Acme Inc.',
    role: 'Senior Product Designer',
    timezone: 'America/Los_Angeles',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
    // Show success toast
  };

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
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Profile Settings</h1>
          <p className="text-lg text-neutral-600">
            Manage your personal information and public profile
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          {/* Avatar Section */}
          <div className="p-8 border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Profile Picture</h2>
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/30">
                  JD
                </div>
                <button className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <Button variant="outline" className="mb-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Picture
                </Button>
                <p className="text-sm text-neutral-500">
                  JPG, GIF or PNG. Max size of 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="p-8 border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="pl-12"
                    placeholder="John"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="pl-12"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="pl-12"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="pl-12"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Bio - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Bio
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
                <p className="text-sm text-neutral-500 mt-2">
                  Brief description for your profile. Max 200 characters.
                </p>
              </div>
            </div>
          </div>

          {/* Location & Links */}
          <div className="p-8 border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Location & Links</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="pl-12"
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="pl-12"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="p-8 border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Professional Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Company
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="pl-12"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="pl-12"
                    placeholder="Product Designer"
                  />
                </div>
              </div>

              {/* Timezone */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Timezone
                </label>
                <Select
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-8 bg-neutral-50 flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Changes are saved automatically
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-xl font-bold text-rose-600 mb-2">Danger Zone</h2>
            <p className="text-neutral-600 mb-6">
              Irreversible and destructive actions
            </p>
            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-200">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Delete Account</h3>
                <p className="text-sm text-neutral-600">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="danger">Delete Account</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
