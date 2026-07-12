'use client';

import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { StatCard, RevenueCard, ActivityTimeline, QuickActions } from '@/components/templates/dashboards';
import { DollarSign, TrendingUp, Target, Award, ShoppingBag, Users, Zap, PieChart } from 'lucide-react';

export default function SalesDashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Sales Dashboard
            </h1>
            <p className="text-neutral-600">
              Track your sales performance and revenue metrics in real-time.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Sales"
              value="$124,592"
              change={15.3}
              icon={DollarSign}
              iconColor="from-green-500 to-emerald-600"
            />
            <StatCard
              title="Sales Growth"
              value="+23.5%"
              change={8.7}
              icon={TrendingUp}
              iconColor="from-cyan-500 to-blue-600"
            />
            <StatCard
              title="Conversion Rate"
              value="4.2%"
              change={12.1}
              icon={Target}
              iconColor="from-indigo-500 to-purple-600"
            />
            <StatCard
              title="Avg Deal Size"
              value="$2,847"
              change={-3.2}
              trend="down"
              icon={Award}
              iconColor="from-amber-500 to-orange-600"
            />
          </div>

          {/* Revenue Chart */}
          <div className="mb-6">
            <RevenueCard
              totalRevenue="$124,592"
              change={15.3}
              periodLabel="vs last quarter"
              chartData={[30, 45, 38, 52, 48, 65, 58, 72, 68, 85, 78, 95]}
            />
          </div>

          {/* Sales Breakdown */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="New Customers"
              value="342"
              change={18.2}
              icon={Users}
              iconColor="from-rose-500 to-pink-600"
            />
            <StatCard
              title="Active Deals"
              value="156"
              change={5.4}
              icon={Zap}
              iconColor="from-purple-500 to-fuchsia-600"
            />
            <StatCard
              title="Closed Deals"
              value="89"
              change={22.8}
              icon={ShoppingBag}
              iconColor="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Win Rate"
              value="57%"
              change={4.2}
              icon={PieChart}
              iconColor="from-green-500 to-teal-600"
            />
          </div>

          {/* Bottom Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ActivityTimeline
              activities={[
                {
                  id: '1',
                  type: 'success',
                  title: 'Deal closed',
                  description: 'Enterprise plan sold to Acme Corp - $15,000',
                  time: '5 minutes ago',
                  user: 'JS',
                },
                {
                  id: '2',
                  type: 'info',
                  title: 'New lead added',
                  description: 'Contact from TechStart Inc via website form',
                  time: '1 hour ago',
                  user: 'BD',
                },
                {
                  id: '3',
                  type: 'success',
                  title: 'Meeting scheduled',
                  description: 'Demo call with GlobalCo on Friday 2pm',
                  time: '3 hours ago',
                  user: 'AM',
                },
                {
                  id: '4',
                  type: 'warning',
                  title: 'Follow-up needed',
                  description: 'No response from Beta Solutions in 7 days',
                  time: '5 hours ago',
                },
              ]}
            />
            <QuickActions
              actions={[
                { id: '1', label: 'New Deal', icon: ShoppingBag, color: 'from-indigo-500 to-purple-600' },
                { id: '2', label: 'Add Lead', icon: Users, color: 'from-cyan-500 to-blue-600' },
                { id: '3', label: 'Schedule', icon: Target, color: 'from-green-500 to-emerald-600' },
                { id: '4', label: 'Report', icon: PieChart, color: 'from-amber-500 to-orange-600' },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
