'use client';

import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { StatCard, RevenueCard, ActivityTimeline, QuickActions, RecentUsers } from '@/components/templates/dashboards';
import { DollarSign, Users, ShoppingCart, TrendingUp, Eye, MousePointer } from 'lucide-react';

export default function AnalyticsDashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      {/* Sidebar */}
      <FloatingSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-neutral-600">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Revenue"
              value="$45,231"
              change={12.5}
              changeLabel="vs last month"
              icon={DollarSign}
              iconColor="from-indigo-500 to-purple-600"
            />
            <StatCard
              title="Total Users"
              value="2,543"
              change={8.2}
              changeLabel="vs last month"
              icon={Users}
              iconColor="from-cyan-500 to-blue-600"
            />
            <StatCard
              title="Total Orders"
              value="1,234"
              change={-2.4}
              trend="down"
              changeLabel="vs last month"
              icon={ShoppingCart}
              iconColor="from-green-500 to-emerald-600"
            />
            <StatCard
              title="Conversion Rate"
              value="3.24%"
              change={5.1}
              changeLabel="vs last month"
              icon={TrendingUp}
              iconColor="from-amber-500 to-orange-600"
            />
          </div>

          {/* Revenue & Quick Actions */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <RevenueCard
                totalRevenue="$124,592"
                change={15.3}
                periodLabel="vs last month"
              />
            </div>
            <QuickActions />
          </div>

          {/* Additional Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Page Views"
              value="45.2K"
              change={18.7}
              icon={Eye}
              iconColor="from-rose-500 to-pink-600"
            />
            <StatCard
              title="Click Rate"
              value="2.4%"
              change={3.2}
              icon={MousePointer}
              iconColor="from-purple-500 to-fuchsia-600"
            />
            <StatCard
              title="Bounce Rate"
              value="32.5%"
              change={-5.3}
              trend="up"
              icon={TrendingUp}
              iconColor="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Avg. Session"
              value="4m 32s"
              change={12.1}
              icon={TrendingUp}
              iconColor="from-green-500 to-teal-600"
            />
          </div>

          {/* Activity & Users */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ActivityTimeline />
            <RecentUsers />
          </div>
        </div>
      </main>
    </div>
  );
}
