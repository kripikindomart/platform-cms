'use client';

import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { NotificationCenter } from '@/components/templates/layouts/notification-center';
import { Bell } from 'lucide-react';

export default function NotificationLayoutPage() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1">
        {/* Top Bar with Notification */}
        <div className="h-16 bg-white border-b border-neutral-200 px-8 flex items-center justify-between">
          <h1 className="text-lg font-bold text-neutral-900">
            Layout with Notification Center
          </h1>
          
          {/* Notification Component - has its own state */}
          <NotificationCenter />
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <p className="text-neutral-600 mb-4">
                Click the bell icon in top-right to open notification center
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Notification Types
                </h3>
                <div className="space-y-3">
                  {[
                    { type: 'Success', color: 'bg-green-100 text-green-700' },
                    { type: 'Info', color: 'bg-blue-100 text-blue-700' },
                    { type: 'Warning', color: 'bg-amber-100 text-amber-700' },
                    { type: 'Error', color: 'bg-red-100 text-red-700' },
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-semibold ${notif.color}`}
                      >
                        {notif.type}
                      </span>
                      <span className="text-sm text-neutral-600">
                        {notif.type} notification example
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  Features
                </h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li>✓ Real-time notifications</li>
                  <li>✓ Unread badge counter</li>
                  <li>✓ Mark as read/unread</li>
                  <li>✓ Mark all as read</li>
                  <li>✓ Dismiss notifications</li>
                  <li>✓ Slide-out panel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
