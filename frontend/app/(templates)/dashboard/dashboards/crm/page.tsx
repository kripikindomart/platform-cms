'use client';

import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { StatCard, RevenueCard, ActivityTimeline, QuickActions, RecentUsers } from '@/components/templates/dashboards';
import { Users, UserPlus, Briefcase, DollarSign, Phone, Mail, Calendar, Target } from 'lucide-react';

export default function CRMDashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              CRM Dashboard
            </h1>
            <p className="text-neutral-600">
              Manage customer relationships, track leads, and monitor your sales pipeline.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Leads"
              value="1,284"
              change={18.5}
              icon={UserPlus}
              iconColor="from-indigo-500 to-purple-600"
            />
            <StatCard
              title="Active Contacts"
              value="5,847"
              change={12.3}
              icon={Users}
              iconColor="from-cyan-500 to-blue-600"
            />
            <StatCard
              title="Opportunities"
              value="342"
              change={25.7}
              icon={Briefcase}
              iconColor="from-green-500 to-emerald-600"
            />
            <StatCard
              title="Pipeline Value"
              value="$2.4M"
              change={15.2}
              icon={DollarSign}
              iconColor="from-amber-500 to-orange-600"
            />
          </div>

          {/* Revenue/Pipeline Chart */}
          <div className="mb-6">
            <RevenueCard
              totalRevenue="$2.4M"
              change={15.2}
              periodLabel="pipeline value this quarter"
              chartData={[35, 42, 38, 55, 48, 65, 58, 72, 68, 82, 78, 92]}
            />
          </div>

          {/* Lead Funnel Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="New Leads"
              value="234"
              change={22.8}
              icon={Target}
              iconColor="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Scheduled Calls"
              value="89"
              change={8.4}
              icon={Phone}
              iconColor="from-purple-500 to-fuchsia-600"
            />
            <StatCard
              title="Email Sent"
              value="1,847"
              change={15.3}
              icon={Mail}
              iconColor="from-rose-500 to-pink-600"
            />
            <StatCard
              title="Meetings"
              value="45"
              change={-3.2}
              trend="down"
              icon={Calendar}
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
                  description: 'Enterprise contract signed with TechCorp - $125K',
                  time: '10 minutes ago',
                  user: 'AM',
                },
                {
                  id: '2',
                  type: 'info',
                  title: 'New lead added',
                  description: 'Contact from StartupXYZ via LinkedIn',
                  time: '45 minutes ago',
                  user: 'BD',
                },
                {
                  id: '3',
                  type: 'success',
                  title: 'Meeting completed',
                  description: 'Product demo with GlobalCorp went well',
                  time: '2 hours ago',
                  user: 'JS',
                },
                {
                  id: '4',
                  type: 'warning',
                  title: 'Follow-up needed',
                  description: 'No response from Beta Solutions in 14 days',
                  time: '3 hours ago',
                },
              ]}
            />
            <RecentUsers
              users={[
                {
                  id: '1',
                  name: 'Sarah Johnson',
                  email: 'sarah@techcorp.com',
                  initials: 'SJ',
                  role: 'Lead',
                  status: 'online',
                  joinedAt: '2 mins ago',
                },
                {
                  id: '2',
                  name: 'Michael Chen',
                  email: 'michael@startupxyz.com',
                  initials: 'MC',
                  role: 'Prospect',
                  status: 'away',
                  joinedAt: '45 mins ago',
                },
                {
                  id: '3',
                  name: 'Emily Davis',
                  email: 'emily@globalcorp.com',
                  initials: 'ED',
                  role: 'Customer',
                  status: 'online',
                  joinedAt: '2 hours ago',
                },
                {
                  id: '4',
                  name: 'David Brown',
                  email: 'david@betasolutions.com',
                  initials: 'DB',
                  role: 'Lead',
                  status: 'offline',
                  joinedAt: '3 hours ago',
                },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
