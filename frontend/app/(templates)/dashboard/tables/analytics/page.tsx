'use client';

import { useState } from 'react';
import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { SimpleTable } from '@/components/templates/tables';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Analytics {
  metric: string;
  value: string;
  change: number;
  category: string;
}

const analyticsData: Analytics[] = [
  { metric: 'Page Views', value: '45,234', change: 12.5, category: 'Traffic' },
  { metric: 'Unique Visitors', value: '12,543', change: 8.3, category: 'Traffic' },
  { metric: 'Bounce Rate', value: '32.4%', change: -5.2, category: 'Engagement' },
  { metric: 'Avg. Session', value: '4m 32s', change: 15.8, category: 'Engagement' },
  { metric: 'Conversion Rate', value: '3.24%', change: 6.1, category: 'Sales' },
  { metric: 'Revenue', value: '$45,231', change: 18.7, category: 'Sales' },
  { metric: 'Orders', value: '1,234', change: -2.4, category: 'Sales' },
  { metric: 'AOV', value: '$89.50', change: 9.3, category: 'Sales' },
];

export default function AnalyticsTablePage() {
  const columns = [
    {
      key: 'metric',
      label: 'Metric',
      width: 'w-1/3',
      render: (value: string, row: Analytics) => (
        <div>
          <div className="font-semibold text-neutral-900">{value}</div>
          <div className="text-xs text-neutral-500">{row.category}</div>
        </div>
      ),
    },
    {
      key: 'value',
      label: 'Current Value',
      align: 'center' as const,
      render: (value: string) => (
        <span className="text-2xl font-bold text-neutral-900">{value}</span>
      ),
    },
    {
      key: 'change',
      label: 'Change',
      align: 'right' as const,
      render: (value: number) => {
        const isPositive = value >= 0;
        return (
          <div className="flex items-center justify-end gap-2">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <span
              className={`text-lg font-bold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}
              {value}%
            </span>
          </div>
        );
      },
    },
  ];

  // Group by category
  const categories = ['Traffic', 'Engagement', 'Sales'];

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Analytics Table
            </h1>
            <p className="text-neutral-600">
              Data analytics with trend indicators and performance metrics.
            </p>
          </div>

          {/* Tables by Category */}
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryData = analyticsData.filter((d) => d.category === category);
              return (
                <div key={category}>
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">
                    {category} Metrics
                  </h2>
                  <SimpleTable
                    columns={columns}
                    data={categoryData}
                    hoverable
                    bordered
                  />
                </div>
              );
            })}
          </div>

          {/* Summary Card */}
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              Performance Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-neutral-600 mb-1">Best Performing</div>
                <div className="font-bold text-green-600">Revenue (+18.7%)</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Needs Attention</div>
                <div className="font-bold text-red-600">Orders (-2.4%)</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Overall Trend</div>
                <div className="font-bold text-indigo-600">Positive Growth</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
