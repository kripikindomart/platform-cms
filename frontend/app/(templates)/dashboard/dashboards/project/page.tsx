'use client';

import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { StatCard, RevenueCard, ActivityTimeline, QuickActions } from '@/components/templates/dashboards';
import { FolderKanban, CheckCircle2, Clock, Users, AlertTriangle, TrendingUp, Calendar, FileText } from 'lucide-react';

export default function ProjectDashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Project Dashboard
            </h1>
            <p className="text-neutral-600">
              Track project progress, manage tasks, and collaborate with your team.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Active Projects"
              value="24"
              change={12.5}
              icon={FolderKanban}
              iconColor="from-indigo-500 to-purple-600"
            />
            <StatCard
              title="Total Tasks"
              value="342"
              change={8.7}
              icon={CheckCircle2}
              iconColor="from-cyan-500 to-blue-600"
            />
            <StatCard
              title="Team Members"
              value="48"
              change={15.3}
              icon={Users}
              iconColor="from-green-500 to-emerald-600"
            />
            <StatCard
              title="Completion Rate"
              value="87%"
              change={5.2}
              icon={TrendingUp}
              iconColor="from-amber-500 to-orange-600"
            />
          </div>

          {/* Progress Chart */}
          <div className="mb-6">
            <RevenueCard
              totalRevenue="87%"
              change={5.2}
              periodLabel="completion rate this month"
              chartData={[65, 68, 72, 70, 75, 78, 80, 82, 84, 85, 86, 87]}
            />
          </div>

          {/* Task Breakdown */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="To Do"
              value="89"
              change={-8.3}
              trend="up"
              icon={FileText}
              iconColor="from-neutral-500 to-gray-600"
            />
            <StatCard
              title="In Progress"
              value="134"
              change={12.4}
              icon={Clock}
              iconColor="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Completed"
              value="298"
              change={22.8}
              icon={CheckCircle2}
              iconColor="from-green-500 to-emerald-600"
            />
            <StatCard
              title="Overdue"
              value="12"
              change={-15.4}
              trend="up"
              icon={AlertTriangle}
              iconColor="from-red-500 to-rose-600"
            />
          </div>

          {/* Bottom Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ActivityTimeline
              activities={[
                {
                  id: '1',
                  type: 'success',
                  title: 'Task completed',
                  description: 'Backend API integration finished by Dev Team',
                  time: '5 minutes ago',
                  user: 'DT',
                },
                {
                  id: '2',
                  type: 'info',
                  title: 'New task created',
                  description: 'Design mockups for mobile app dashboard',
                  time: '1 hour ago',
                  user: 'PM',
                },
                {
                  id: '3',
                  type: 'success',
                  title: 'Milestone reached',
                  description: 'Phase 2 - Authentication module 100% complete',
                  time: '3 hours ago',
                },
                {
                  id: '4',
                  type: 'warning',
                  title: 'Deadline approaching',
                  description: 'Payment integration due in 2 days',
                  time: '5 hours ago',
                },
              ]}
            />
            <QuickActions
              actions={[
                { id: '1', label: 'New Task', icon: FileText, color: 'from-indigo-500 to-purple-600' },
                { id: '2', label: 'New Project', icon: FolderKanban, color: 'from-cyan-500 to-blue-600' },
                { id: '3', label: 'Team', icon: Users, color: 'from-green-500 to-emerald-600' },
                { id: '4', label: 'Calendar', icon: Calendar, color: 'from-amber-500 to-orange-600' },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
