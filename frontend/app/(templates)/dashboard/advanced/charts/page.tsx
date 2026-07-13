'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { LineChart, BarChart, PieChart, AreaChart } from '@/components/advanced';

/**
 * Charts Demo
 * Showcasing Recharts with premium styling
 */

export default function ChartsDemoPage() {
  // Line Chart Data
  const lineChartData = [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 2000, expenses: 9800 },
    { name: 'Apr', revenue: 2780, expenses: 3908 },
    { name: 'May', revenue: 1890, expenses: 4800 },
    { name: 'Jun', revenue: 2390, expenses: 3800 },
    { name: 'Jul', revenue: 3490, expenses: 4300 },
  ];

  // Bar Chart Data
  const barChartData = [
    { name: 'Mon', sales: 12, orders: 8 },
    { name: 'Tue', sales: 19, orders: 14 },
    { name: 'Wed', sales: 15, orders: 11 },
    { name: 'Thu', sales: 25, orders: 18 },
    { name: 'Fri', sales: 22, orders: 16 },
    { name: 'Sat', sales: 30, orders: 22 },
    { name: 'Sun', sales: 28, orders: 20 },
  ];

  // Pie Chart Data
  const pieChartData = [
    { name: 'Desktop', value: 45, color: '#6366f1' },
    { name: 'Mobile', value: 30, color: '#8b5cf6' },
    { name: 'Tablet', value: 15, color: '#ec4899' },
    { name: 'Others', value: 10, color: '#f59e0b' },
  ];

  // Area Chart Data
  const areaChartData = [
    { name: 'Week 1', users: 400, sessions: 240 },
    { name: 'Week 2', users: 300, sessions: 139 },
    { name: 'Week 3', users: 200, sessions: 980 },
    { name: 'Week 4', users: 278, sessions: 390 },
    { name: 'Week 5', users: 189, sessions: 480 },
    { name: 'Week 6', users: 239, sessions: 380 },
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
            Charts & Graphs
          </h1>
          <p className="text-lg text-neutral-600">
            Beautiful, responsive charts powered by Recharts with premium styling
          </p>
        </motion.div>

        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Line Chart</h2>
              <p className="text-sm text-neutral-600">Revenue vs Expenses over time</p>
            </div>
          </div>

          <LineChart
            data={lineChartData}
            lines={[
              { dataKey: 'revenue', stroke: '#6366f1', name: 'Revenue' },
              { dataKey: 'expenses', stroke: '#8b5cf6', name: 'Expenses' },
            ]}
            height={350}
            showGrid
            showLegend
            showTooltip
          />
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Bar Chart</h2>
              <p className="text-sm text-neutral-600">Weekly sales and orders comparison</p>
            </div>
          </div>

          <BarChart
            data={barChartData}
            bars={[
              { dataKey: 'sales', fill: '#10b981', name: 'Sales' },
              { dataKey: 'orders', fill: '#14b8a6', name: 'Orders' },
            ]}
            height={350}
            showGrid
            showLegend
            showTooltip
          />

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-sm text-emerald-600 font-medium mb-1">Total Sales</div>
              <div className="text-2xl font-bold text-emerald-900">151</div>
            </div>
            <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
              <div className="text-sm text-teal-600 font-medium mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-teal-900">109</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <PieChartIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Pie Chart</h2>
                <p className="text-sm text-neutral-600">Device distribution</p>
              </div>
            </div>

            <PieChart
              data={pieChartData}
              height={300}
              innerRadius={60}
              outerRadius={100}
              showLegend
              showTooltip
            />
          </motion.div>

          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Area Chart</h2>
                <p className="text-sm text-neutral-600">Users and sessions growth</p>
              </div>
            </div>

            <AreaChart
              data={areaChartData}
              areas={[
                { dataKey: 'users', stroke: '#3b82f6', fill: '#3b82f6', name: 'Users' },
                { dataKey: 'sessions', stroke: '#06b6d4', fill: '#06b6d4', name: 'Sessions' },
              ]}
              height={300}
              showGrid
              showLegend
              showTooltip
            />
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-200"
        >
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Chart Features</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              'Responsive containers',
              'Interactive tooltips',
              'Customizable legends',
              'Grid lines',
              'Gradient fills',
              'Smooth animations',
              'Color customization',
              'Multiple data series',
              'Auto-scaling axes',
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
          transition={{ delay: 0.6 }}
          className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm"
        >
          <h2 className="text-xl font-bold text-white mb-4">Usage Example</h2>
          <pre className="text-sm text-neutral-300 overflow-x-auto">
            <code>{`import { LineChart, BarChart, PieChart, AreaChart } from '@/components/advanced';

// Line Chart
<LineChart
  data={data}
  lines={[
    { dataKey: 'revenue', stroke: '#6366f1', name: 'Revenue' },
    { dataKey: 'expenses', stroke: '#8b5cf6', name: 'Expenses' },
  ]}
  height={400}
/>

// Bar Chart
<BarChart
  data={data}
  bars={[
    { dataKey: 'sales', fill: '#10b981', name: 'Sales' },
  ]}
  height={300}
/>

// Pie Chart
<PieChart
  data={[
    { name: 'Category A', value: 400, color: '#6366f1' },
    { name: 'Category B', value: 300, color: '#8b5cf6' },
  ]}
  innerRadius={60}
  height={300}
/>

// Area Chart
<AreaChart
  data={data}
  areas={[
    { dataKey: 'users', stroke: '#3b82f6', fill: '#3b82f6' },
  ]}
  height={300}
/>`}</code>
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
