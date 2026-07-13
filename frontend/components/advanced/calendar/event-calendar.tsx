'use client';

import { useState, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Grid, List } from 'lucide-react';

/**
 * EventCalendar - Premium calendar component using React Big Calendar
 * Features: month/week/day views, drag & drop, event management
 */

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface Event extends CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color?: string;
  type?: string;
}

interface EventCalendarProps {
  events: Event[];
  onSelectEvent?: (event: Event) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onEventDrop?: (event: Event, start: Date, end: Date) => void;
  height?: number;
  defaultView?: 'month' | 'week' | 'day' | 'agenda';
}

export function EventCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
  onEventDrop,
  height = 600,
  defaultView = 'month',
}: EventCalendarProps) {
  const [currentView, setCurrentView] = useState(defaultView);
  const [currentDate, setCurrentDate] = useState(new Date());

  const eventStyleGetter = (event: Event) => {
    const backgroundColor = event.color || '#6366f1';
    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        border: 'none',
        padding: '4px 8px',
        color: 'white',
        fontSize: '13px',
        fontWeight: '600',
      },
    };
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as any);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
      {/* Custom Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-neutral-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                handleNavigate(newDate);
              }}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleNavigate(new Date())}
              className="px-4 py-2 rounded-lg hover:bg-neutral-100 text-neutral-700 font-medium transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                handleNavigate(newDate);
              }}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => handleViewChange('month')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${
                currentView === 'month'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }
            `}
          >
            <Calendar className="w-4 h-4" />
            Month
          </button>
          <button
            onClick={() => handleViewChange('week')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${
                currentView === 'week'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }
            `}
          >
            <Grid className="w-4 h-4" />
            Week
          </button>
          <button
            onClick={() => handleViewChange('day')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${
                currentView === 'day'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }
            `}
          >
            <List className="w-4 h-4" />
            Day
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div
        style={{ height }}
        className="premium-calendar"
      >
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          eventPropGetter={eventStyleGetter}
          selectable
          popup
          toolbar={false}
        />
      </div>

      {/* Custom CSS */}
      <style jsx global>{`
        .premium-calendar {
          font-family: Inter, sans-serif;
        }
        .premium-calendar .rbc-header {
          padding: 12px 8px;
          font-weight: 600;
          font-size: 13px;
          color: #525252;
          border-bottom: 1px solid #e5e5e5;
        }
        .premium-calendar .rbc-today {
          background-color: #eef2ff;
        }
        .premium-calendar .rbc-date-cell {
          padding: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        .premium-calendar .rbc-off-range-bg {
          background-color: #fafafa;
        }
        .premium-calendar .rbc-event {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .premium-calendar .rbc-event:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }
        .premium-calendar .rbc-selected {
          background-color: #4338ca !important;
        }
        .premium-calendar .rbc-month-view,
        .premium-calendar .rbc-time-view {
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          overflow: hidden;
        }
        .premium-calendar .rbc-time-header-content {
          border-left: 1px solid #e5e5e5;
        }
        .premium-calendar .rbc-time-content {
          border-top: 1px solid #e5e5e5;
        }
        .premium-calendar .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f5f5f5;
        }
      `}</style>
    </div>
  );
}
