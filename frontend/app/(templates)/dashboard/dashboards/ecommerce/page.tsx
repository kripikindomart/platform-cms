'use client';

import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { StatCard, RevenueCard, ActivityTimeline, QuickActions } from '@/components/templates/dashboards';
import { ShoppingCart, Package, Users, DollarSign, TrendingUp, Star, Tag, Truck } from 'lucide-react';

export default function EcommerceDashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              E-commerce Dashboard
            </h1>
            <p className="text-neutral-600">
              Monitor your online store performance, orders, and inventory in real-time.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Orders"
              value="3,842"
              change={23.5}
              icon={ShoppingCart}
              iconColor="from-indigo-500 to-purple-600"
            />
            <StatCard
              title="Total Products"
              value="1,247"
              change={8.2}
              icon={Package}
              iconColor="from-cyan-500 to-blue-600"
            />
            <StatCard
              title="Total Customers"
              value="8,392"
              change={15.7}
              icon={Users}
              iconColor="from-green-500 to-emerald-600"
            />
            <StatCard
              title="Total Revenue"
              value="$284,592"
              change={18.3}
              icon={DollarSign}
              iconColor="from-amber-500 to-orange-600"
            />
          </div>

          {/* Revenue Chart */}
          <div className="mb-6">
            <RevenueCard
              totalRevenue="$284,592"
              change={18.3}
              periodLabel="vs last quarter"
              chartData={[45, 52, 48, 65, 58, 72, 68, 85, 78, 95, 88, 102]}
            />
          </div>

          {/* Order Status Breakdown */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Pending Orders"
              value="156"
              change={12.4}
              icon={Tag}
              iconColor="from-amber-500 to-orange-600"
            />
            <StatCard
              title="Processing"
              value="89"
              change={5.8}
              icon={Package}
              iconColor="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Shipped"
              value="234"
              change={22.1}
              icon={Truck}
              iconColor="from-purple-500 to-fuchsia-600"
            />
            <StatCard
              title="Avg Rating"
              value="4.8"
              change={3.2}
              icon={Star}
              iconColor="from-yellow-500 to-amber-600"
            />
          </div>

          {/* Bottom Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ActivityTimeline
              activities={[
                {
                  id: '1',
                  type: 'success',
                  title: 'Order completed',
                  description: 'Order #8432 delivered to customer - $234.50',
                  time: '3 minutes ago',
                  user: 'CS',
                },
                {
                  id: '2',
                  type: 'info',
                  title: 'New order received',
                  description: 'Order #8433 from John Smith - 3 items',
                  time: '25 minutes ago',
                  user: 'JS',
                },
                {
                  id: '3',
                  type: 'success',
                  title: 'Product restocked',
                  description: 'iPhone 15 Pro - 50 units added to inventory',
                  time: '2 hours ago',
                },
                {
                  id: '4',
                  type: 'warning',
                  title: 'Low stock alert',
                  description: 'MacBook Air M2 - only 5 units remaining',
                  time: '4 hours ago',
                },
              ]}
            />
            <QuickActions
              actions={[
                { id: '1', label: 'New Order', icon: ShoppingCart, color: 'from-indigo-500 to-purple-600' },
                { id: '2', label: 'Add Product', icon: Package, color: 'from-cyan-500 to-blue-600' },
                { id: '3', label: 'Customers', icon: Users, color: 'from-green-500 to-emerald-600' },
                { id: '4', label: 'Analytics', icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
