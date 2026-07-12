'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  Shield, 
  Key, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { 
      title: 'Total Users', 
      value: '2,543', 
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    { 
      title: 'Active Tenants', 
      value: '48', 
      change: '+8.2%',
      trend: 'up',
      icon: Building2,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    { 
      title: 'Total Roles', 
      value: '12', 
      change: '+3',
      trend: 'up',
      icon: Shield,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600'
    },
    { 
      title: 'Permissions', 
      value: '156', 
      change: '+24',
      trend: 'up',
      icon: Key,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
  ];

  const recentActivity = [
    { 
      action: 'New user registered',
      user: 'John Doe',
      time: '2 minutes ago',
      status: 'success'
    },
    { 
      action: 'Role permissions updated',
      user: 'Admin',
      time: '15 minutes ago',
      status: 'success'
    },
    { 
      action: 'Failed login attempt',
      user: 'Unknown',
      time: '1 hour ago',
      status: 'warning'
    },
    { 
      action: 'New tenant created',
      user: 'Sarah Smith',
      time: '3 hours ago',
      status: 'success'
    },
  ];

  const quickActions = [
    { title: 'Create User', icon: Users, color: 'from-indigo-500 to-purple-600' },
    { title: 'Add Tenant', icon: Building2, color: 'from-cyan-500 to-blue-600' },
    { title: 'Manage Roles', icon: Shield, color: 'from-violet-500 to-purple-600' },
    { title: 'View Audit Logs', icon: Activity, color: 'from-pink-500 to-rose-600' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-600 mt-0.5">Welcome back! Here's what's happening today.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="relative p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                      stat.trend === 'up' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      <TrendIcon className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">{stat.change}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-neutral-600">{stat.title}</h3>
                    <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.title}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full group"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-all duration-200">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-700 group-hover:text-neutral-900">
                        {action.title}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-neutral-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-neutral-900">Recent Activity</h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                View all
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activity.status === 'success' 
                      ? 'bg-green-50' 
                      : 'bg-yellow-50'
                  }`}>
                    {activity.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 mb-0.5">
                      {activity.action}
                    </p>
                    <p className="text-sm text-neutral-600">
                      by <span className="font-medium">{activity.user}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-neutral-500 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{activity.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section - System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-neutral-100">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-white/40">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-neutral-700">All systems operational</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Platform CMS Enterprise
              </h2>
              <p className="text-neutral-600 max-w-2xl">
                Your multi-tenant content management platform is running smoothly. 
                Monitor your tenants, manage users, and configure permissions all in one place.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-600">Uptime</p>
                <p className="text-2xl font-bold text-neutral-900">99.9%</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                <Activity className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
