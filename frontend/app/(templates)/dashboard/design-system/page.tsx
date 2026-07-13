'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { useState } from 'react';

/**
 * Design System Page
 * Showcases all design tokens, colors, typography, spacing, shadows, and styles
 */

export default function DesignSystemPage() {
  const [copiedColor, setCopiedColor] = useState('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(''), 2000);
  };

  // Design Tokens
  const colors = {
    primary: [
      { name: 'Indigo 50', class: 'bg-indigo-50', hex: '#EEF2FF', text: 'text-indigo-900' },
      { name: 'Indigo 100', class: 'bg-indigo-100', hex: '#E0E7FF', text: 'text-indigo-900' },
      { name: 'Indigo 200', class: 'bg-indigo-200', hex: '#C7D2FE', text: 'text-indigo-900' },
      { name: 'Indigo 300', class: 'bg-indigo-300', hex: '#A5B4FC', text: 'text-indigo-900' },
      { name: 'Indigo 400', class: 'bg-indigo-400', hex: '#818CF8', text: 'text-white' },
      { name: 'Indigo 500', class: 'bg-indigo-500', hex: '#6366F1', text: 'text-white' },
      { name: 'Indigo 600', class: 'bg-indigo-600', hex: '#4F46E5', text: 'text-white' },
      { name: 'Indigo 700', class: 'bg-indigo-700', hex: '#4338CA', text: 'text-white' },
      { name: 'Indigo 800', class: 'bg-indigo-800', hex: '#3730A3', text: 'text-white' },
      { name: 'Indigo 900', class: 'bg-indigo-900', hex: '#312E81', text: 'text-white' },
    ],
    secondary: [
      { name: 'Purple 50', class: 'bg-purple-50', hex: '#FAF5FF', text: 'text-purple-900' },
      { name: 'Purple 100', class: 'bg-purple-100', hex: '#F3E8FF', text: 'text-purple-900' },
      { name: 'Purple 200', class: 'bg-purple-200', hex: '#E9D5FF', text: 'text-purple-900' },
      { name: 'Purple 300', class: 'bg-purple-300', hex: '#D8B4FE', text: 'text-purple-900' },
      { name: 'Purple 400', class: 'bg-purple-400', hex: '#C084FC', text: 'text-white' },
      { name: 'Purple 500', class: 'bg-purple-500', hex: '#A855F7', text: 'text-white' },
      { name: 'Purple 600', class: 'bg-purple-600', hex: '#9333EA', text: 'text-white' },
      { name: 'Purple 700', class: 'bg-purple-700', hex: '#7E22CE', text: 'text-white' },
      { name: 'Purple 800', class: 'bg-purple-800', hex: '#6B21A8', text: 'text-white' },
      { name: 'Purple 900', class: 'bg-purple-900', hex: '#581C87', text: 'text-white' },
    ],
    neutrals: [
      { name: 'Neutral 50', class: 'bg-neutral-50', hex: '#FAFAFA', text: 'text-neutral-900' },
      { name: 'Neutral 100', class: 'bg-neutral-100', hex: '#F5F5F5', text: 'text-neutral-900' },
      { name: 'Neutral 200', class: 'bg-neutral-200', hex: '#E5E5E5', text: 'text-neutral-900' },
      { name: 'Neutral 300', class: 'bg-neutral-300', hex: '#D4D4D4', text: 'text-neutral-900' },
      { name: 'Neutral 400', class: 'bg-neutral-400', hex: '#A3A3A3', text: 'text-white' },
      { name: 'Neutral 500', class: 'bg-neutral-500', hex: '#737373', text: 'text-white' },
      { name: 'Neutral 600', class: 'bg-neutral-600', hex: '#525252', text: 'text-white' },
      { name: 'Neutral 700', class: 'bg-neutral-700', hex: '#404040', text: 'text-white' },
      { name: 'Neutral 800', class: 'bg-neutral-800', hex: '#262626', text: 'text-white' },
      { name: 'Neutral 900', class: 'bg-neutral-900', hex: '#171717', text: 'text-white' },
    ],
    semantic: [
      { name: 'Success', class: 'bg-green-500', hex: '#22C55E', text: 'text-white' },
      { name: 'Warning', class: 'bg-amber-500', hex: '#F59E0B', text: 'text-white' },
      { name: 'Error', class: 'bg-rose-500', hex: '#EF4444', text: 'text-white' },
      { name: 'Info', class: 'bg-cyan-500', hex: '#06B6D4', text: 'text-white' },
    ],
  };

  const typography = [
    { name: 'Heading 1', class: 'text-5xl font-bold', sample: 'The quick brown fox' },
    { name: 'Heading 2', class: 'text-4xl font-bold', sample: 'The quick brown fox' },
    { name: 'Heading 3', class: 'text-3xl font-bold', sample: 'The quick brown fox' },
    { name: 'Heading 4', class: 'text-2xl font-bold', sample: 'The quick brown fox' },
    { name: 'Heading 5', class: 'text-xl font-bold', sample: 'The quick brown fox' },
    { name: 'Heading 6', class: 'text-lg font-bold', sample: 'The quick brown fox' },
    { name: 'Body Large', class: 'text-lg font-medium', sample: 'The quick brown fox jumps over the lazy dog' },
    { name: 'Body', class: 'text-base font-medium', sample: 'The quick brown fox jumps over the lazy dog' },
    { name: 'Body Small', class: 'text-sm font-medium', sample: 'The quick brown fox jumps over the lazy dog' },
    { name: 'Caption', class: 'text-xs font-medium', sample: 'The quick brown fox jumps over the lazy dog' },
  ];

  const spacing = [
    { name: 'gap-2', value: '0.5rem', pixels: '8px' },
    { name: 'gap-3', value: '0.75rem', pixels: '12px' },
    { name: 'gap-4', value: '1rem', pixels: '16px' },
    { name: 'gap-6', value: '1.5rem', pixels: '24px' },
    { name: 'gap-8', value: '2rem', pixels: '32px' },
    { name: 'gap-12', value: '3rem', pixels: '48px' },
    { name: 'gap-16', value: '4rem', pixels: '64px' },
  ];

  const shadows = [
    { name: 'shadow-sm', class: 'shadow-sm', description: 'Small shadow' },
    { name: 'shadow', class: 'shadow', description: 'Default shadow' },
    { name: 'shadow-md', class: 'shadow-md', description: 'Medium shadow' },
    { name: 'shadow-lg', class: 'shadow-lg', description: 'Large shadow' },
    { name: 'shadow-xl', class: 'shadow-xl', description: 'Extra large shadow' },
    { name: 'shadow-2xl', class: 'shadow-2xl', description: '2X large shadow' },
    { name: 'shadow-indigo', class: 'shadow-lg shadow-indigo-500/30', description: 'Colored shadow' },
  ];

  const borderRadius = [
    { name: 'rounded', value: '0.25rem', class: 'rounded', pixels: '4px' },
    { name: 'rounded-lg', value: '0.5rem', class: 'rounded-lg', pixels: '8px' },
    { name: 'rounded-xl', value: '0.75rem', class: 'rounded-xl', pixels: '12px' },
    { name: 'rounded-2xl', value: '1rem', class: 'rounded-2xl', pixels: '16px' },
    { name: 'rounded-3xl', value: '1.5rem', class: 'rounded-3xl', pixels: '24px' },
    { name: 'rounded-full', value: '9999px', class: 'rounded-full', pixels: '9999px' },
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
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Design System</h1>
          <p className="text-lg text-neutral-600">
            Complete design tokens, colors, typography, spacing, and styles
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Colors Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Color Palette</h2>

          {/* Primary Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-700 mb-4">Primary (Indigo)</h3>
            <div className="grid grid-cols-10 gap-2">
              {colors.primary.map((color) => (
                <button
                  key={color.name}
                  onClick={() => copyToClipboard(color.hex, color.name)}
                  className="group relative"
                >
                  <div className={`${color.class} h-20 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedColor === color.name ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Copy className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-neutral-600 text-center">{color.hex}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-700 mb-4">Secondary (Purple)</h3>
            <div className="grid grid-cols-10 gap-2">
              {colors.secondary.map((color) => (
                <button
                  key={color.name}
                  onClick={() => copyToClipboard(color.hex, color.name)}
                  className="group relative"
                >
                  <div className={`${color.class} h-20 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedColor === color.name ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Copy className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-neutral-600 text-center">{color.hex}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Neutral Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-700 mb-4">Neutrals</h3>
            <div className="grid grid-cols-10 gap-2">
              {colors.neutrals.map((color) => (
                <button
                  key={color.name}
                  onClick={() => copyToClipboard(color.hex, color.name)}
                  className="group relative"
                >
                  <div className={`${color.class} h-20 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden border border-neutral-200`}>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedColor === color.name ? (
                        <Check className={`w-4 h-4 ${color.text}`} />
                      ) : (
                        <Copy className={`w-4 h-4 ${color.text}`} />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-neutral-600 text-center">{color.hex}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-4">Semantic Colors</h3>
            <div className="grid grid-cols-4 gap-4">
              {colors.semantic.map((color) => (
                <button
                  key={color.name}
                  onClick={() => copyToClipboard(color.hex, color.name)}
                  className="group relative"
                >
                  <div className={`${color.class} h-24 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                        {copiedColor === color.name ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <Copy className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className="text-white font-semibold">{color.name}</span>
                      <span className="text-white/80 text-sm">{color.hex}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Typography */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Typography</h2>
          <div className="space-y-6">
            {typography.map((type) => (
              <div key={type.name} className="border-b border-neutral-100 pb-6 last:border-0">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-semibold text-neutral-500">{type.name}</span>
                  <code className="text-xs text-neutral-400 font-mono">{type.class}</code>
                </div>
                <p className={`${type.class} text-neutral-900`}>{type.sample}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Spacing */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Spacing Scale (8px Grid)</h2>
          <div className="space-y-4">
            {spacing.map((space) => (
              <div key={space.name} className="flex items-center gap-4">
                <code className="text-sm font-mono text-neutral-600 w-24">{space.name}</code>
                <div className="flex-1 flex items-center gap-2">
                  <div className="h-8 bg-indigo-500 rounded" style={{ width: space.value }} />
                  <span className="text-sm text-neutral-500">{space.pixels}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Shadows */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Shadows</h2>
          <div className="grid grid-cols-3 gap-6">
            {shadows.map((shadow) => (
              <div key={shadow.name} className="text-center">
                <div className={`h-24 bg-white rounded-2xl ${shadow.class} border border-neutral-100 mb-3`} />
                <code className="text-sm font-mono text-neutral-600">{shadow.name}</code>
                <p className="text-xs text-neutral-500 mt-1">{shadow.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Border Radius */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Border Radius</h2>
          <div className="grid grid-cols-3 gap-6">
            {borderRadius.map((radius) => (
              <div key={radius.name} className="text-center">
                <div className={`h-24 bg-gradient-to-br from-indigo-500 to-purple-600 ${radius.class} mb-3 mx-auto max-w-[6rem]`} />
                <code className="text-sm font-mono text-neutral-600">{radius.name}</code>
                <p className="text-xs text-neutral-500 mt-1">{radius.pixels}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Gradients */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Gradients</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-3" />
              <code className="text-sm font-mono text-neutral-600">from-indigo-600 to-purple-600</code>
              <p className="text-xs text-neutral-500 mt-1">Primary Gradient</p>
            </div>
            <div>
              <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30 mb-3" />
              <code className="text-sm font-mono text-neutral-600">from-cyan-600 to-blue-600</code>
              <p className="text-xs text-neutral-500 mt-1">Accent Gradient</p>
            </div>
            <div>
              <div className="h-32 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/30 mb-3" />
              <code className="text-sm font-mono text-neutral-600">from-green-600 to-emerald-600</code>
              <p className="text-xs text-neutral-500 mt-1">Success Gradient</p>
            </div>
            <div>
              <div className="h-32 bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl shadow-lg shadow-rose-500/30 mb-3" />
              <code className="text-sm font-mono text-neutral-600">from-rose-600 to-pink-600</code>
              <p className="text-xs text-neutral-500 mt-1">Danger Gradient</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
