'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { EventCalendar, Event } from '@/components/advanced';
import toast from 'react-hot-toast';

/**
 * Event Calendar Demo
 * Showcasing React Big Calendar with premium styling
 */

export default function CalendarDemoPage() {
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Team Meeting',
      start: new Date(2026, 6, 15, 10, 0),
      end: new Date(2026, 6, 15, 11, 0),
      color: '#6366f1',
      description: 'Weekly team sync',
      type: 'meeting',
    },
    {
      id: '2',
      title: 'Product Launch',
      start: new Date(2026, 6, 20, 9, 0),
      end: new Date(2026, 6, 20, 17, 0),
      color: '#8b5cf6',
      description: 'Launch new product version',
      type: 'event',
    },
    {
      id: '3',
      title: 'Client Presentation',
      start: new Date(2026, 6, 18, 14, 0),
      end: new Date(2026, 6, 18, 15, 30),
      color: '#ec4899',
      description: 'Present Q3 results',
      type: 'meeting',
    },
    {
      id: '4',
      title: 'Workshop: Design Systems',
      start: new Date(2026, 6, 22, 13, 0),
      end: new Date(2026, 6, 22, 16, 0),
      color: '#f59e0b',
      description: 'Internal training workshop',
      type: 'workshop',
    },
    {
      id: '5',
      title: 'Code Review',
      start: new Date(2026, 6, 16, 15, 0),
      end: new Date(2026, 6, 16, 16, 0),
      color: '#10b981',
      description: 'Review PRs from sprint',
      type: 'meeting',
    },
    {
      id: '6',
      title: 'Sprint Planning',
      start: new Date(2026, 6, 21, 10, 0),
      end: new Date(2026, 6, 21, 12, 0),
      color: '#3b82f6',
      description: 'Plan next sprint tasks',
      type: 'meeting',
    },
    {
      id: '7',
      title: 'All Hands Meeting',
      start: new Date(2026, 6, 25, 16, 0),
      end: new Date(2026, 6, 25, 17, 0),
      color: '#ef4444',
      description: 'Company-wide update',
      type: 'meeting',
    },
    {
      id: '8',
      title: 'Birthday Party 🎉',
      start: new Date(2026, 6, 19, 18, 0),
      end: new Date(2026, 6, 19, 21, 0),
      color: '#ec4899',
      description: 'Team celebration',
      type: 'event',
    },
  ]);

  const handleSelectEvent = (event: Event) => {
    console.log('Event selected:', event);
    toast(`📅 ${event.title}`, {
      icon: '👀',
    });
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    console.log('Slot selected:', slotInfo);
    const dateStr = slotInfo.start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    toast(`Create event on ${dateStr}?`, {
      icon: '➕',
    });
  };

  const eventTypeColors = [
    { type: 'meeting', color: '#6366f1', label: 'Meetings' },
    { type: 'event', color: '#8b5cf6', label: 'Events' },
    { type: 'workshop', color: '#f59e0b', label: 'Workshops' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link
          href="/dashboard/advanced"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Advanced
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">
            Event Calendar
          </h1>
          <p className="text-lg text-neutral-600">
            Full-featured calendar with multiple views powered by React Big Calendar
          </p>
        </motion.div>

        {/* Stats & Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 grid md:grid-cols-2 gap-6"
        >
          {/* Stats */}
          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 mb-4">This Month</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{events.length}</div>
                <div className="text-xs text-neutral-600">Total Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {events.filter((e) => e.type === 'meeting').length}
                </div>
                <div className="text-xs text-neutral-600">Meetings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-600">
                  {events.filter((e) => e.type === 'workshop').length}
                </div>
                <div className="text-xs text-neutral-600">Workshops</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 mb-4">Event Types</h3>
            <div className="space-y-2">
              {eventTypeColors.map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-neutral-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CalendarIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-900 mb-1">How to use:</h3>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Click on an event to view details</li>
                <li>• Click on empty date/time to create new event</li>
                <li>• Use view switcher to change between Month/Week/Day</li>
                <li>• Navigate with arrow buttons or "Today" button</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EventCalendar
            events={events}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            height={600}
            defaultView="month"
          />
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-neutral-200"
        >
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Calendar Features</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              'Month/Week/Day views',
              'Agenda view',
              'Event management',
              'Custom event colors',
              'Click to view details',
              'Select time slots',
              'Navigation controls',
              'Today quick jump',
              'Responsive design',
              'Premium styling',
              'Touch support',
              'Keyboard navigation',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span className="text-sm text-neutral-700">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm"
        >
          <h2 className="text-xl font-bold text-white mb-4">Usage Example</h2>
          <pre className="text-sm text-neutral-300 overflow-x-auto">
            <code>{`import { EventCalendar } from '@/components/advanced';

const events = [
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date(2026, 6, 15, 10, 0),
    end: new Date(2026, 6, 15, 11, 0),
    color: '#6366f1',
    description: 'Weekly team sync',
  },
];

<EventCalendar
  events={events}
  onSelectEvent={(event) => console.log('Clicked', event)}
  onSelectSlot={(slotInfo) => console.log('Create event', slotInfo)}
  height={600}
  defaultView="month"
/>`}</code>
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
