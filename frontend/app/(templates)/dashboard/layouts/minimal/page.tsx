'use client';

import { Header } from '@/components/templates/layouts/header';
import { Footer } from '@/components/templates/layouts/footer';

export default function MinimalLayoutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal Header */}
      <Header showMenuButton={false} />

      {/* Main Content */}
      <main className="flex-1 bg-[#FAFBFC]">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-6xl font-bold text-neutral-900 mb-6">
              Minimal Layout
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              Clean and simple layout perfect for landing pages, documentation,
              or content-focused websites
            </p>
            <div className="flex items-center justify-center gap-4">
              <button className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all">
                Get Started
              </button>
              <button className="h-12 px-8 bg-white border border-neutral-200 text-neutral-900 rounded-xl font-semibold hover:bg-neutral-50 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                Why Choose Minimal?
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Focus on content without distractions. Perfect for blogs,
                documentation, and marketing sites.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Clean Design',
                  desc: 'Minimalist design that puts your content first',
                  emoji: '✨',
                },
                {
                  title: 'Fast Loading',
                  desc: 'Optimized for performance with minimal JavaScript',
                  emoji: '⚡',
                },
                {
                  title: 'Responsive',
                  desc: 'Looks great on all devices from mobile to desktop',
                  emoji: '📱',
                },
                {
                  title: 'Accessible',
                  desc: 'WCAG AA compliant with keyboard navigation',
                  emoji: '♿',
                },
                {
                  title: 'SEO Ready',
                  desc: 'Optimized for search engines out of the box',
                  emoji: '🔍',
                },
                {
                  title: 'Customizable',
                  desc: 'Easy to customize with Tailwind CSS',
                  emoji: '🎨',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-8 bg-white rounded-2xl border border-neutral-200 hover:shadow-lg transition-all"
                >
                  <div className="text-5xl mb-4">{feature.emoji}</div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Start with our minimal layout template and customize it to your needs
            </p>
            <button className="h-14 px-10 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all">
              Start Building Now
            </button>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <Footer variant="minimal" />
    </div>
  );
}
