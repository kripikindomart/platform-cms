'use client';

import { Header } from '@/components/templates/layouts/header';
import { Footer } from '@/components/templates/layouts/footer';

export default function HeaderFooterLayoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFC]">
      {/* Header */}
      <Header showMenuButton={false} />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-neutral-900 mb-4">
              Header + Footer Layout
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Perfect for marketing pages, landing pages, or content websites
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { title: 'Sticky Header', emoji: '📌', desc: 'Header sticks on scroll' },
              { title: 'Backdrop Blur', emoji: '✨', desc: 'Premium glassmorphism' },
              { title: 'Footer Variants', emoji: '🎨', desc: 'Minimal, default, full' },
            ].map((feature, i) => (
              <div
                key={i}
                className="text-center p-8 bg-white rounded-2xl border border-neutral-200"
              >
                <div className="text-5xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="p-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-neutral-600 mb-6">
              This layout is perfect for marketing and content pages
            </p>
            <button className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all">
              Learn More
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer variant="default" />
    </div>
  );
}
