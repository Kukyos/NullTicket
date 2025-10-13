'use client';

import { motion } from 'framer-motion';
import { BarChart3, Clock, CheckCircle, AlertTriangle, Users, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetcher } from '@/lib/utils';

interface DashboardStats {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  avg_resolution_time: string;
  sla_compliance: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetcher('/api/analytics/summary');
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    {
      icon: Activity,
      label: 'Total Tickets',
      value: stats?.total_tickets || 0,
      change: '+12%',
      color: 'blue',
    },
    {
      icon: Clock,
      label: 'Open Tickets',
      value: stats?.open_tickets || 0,
      change: '-5%',
      color: 'yellow',
    },
    {
      icon: CheckCircle,
      label: 'Resolved Today',
      value: stats?.resolved_tickets || 0,
      change: '+23%',
      color: 'green',
    },
    {
      icon: TrendingUp,
      label: 'SLA Compliance',
      value: `${stats?.sla_compliance || 0}%`,
      change: '+3%',
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950">
      {/* Navigation */}
      <nav className="glass-strong border-b border-blue-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-400 glow" />
              <span className="text-2xl font-bold text-glow">NullTicket</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-blue-400 font-semibold">
                Dashboard
              </Link>
              <Link href="/tickets" className="text-gray-300 hover:text-blue-400 transition-colors">
                Tickets
              </Link>
              <Link href="/admin" className="text-gray-300 hover:text-blue-400 transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-glow">Dashboard</h1>
          <p className="text-gray-400">Real-time overview of your ticketing system</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/50 transition-all glow-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-10 h-10 text-${stat.color}-400`} />
                <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {loading ? '...' : stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Ticket Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-xl border border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Ticket Trends</h2>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Chart visualization coming soon</p>
                <p className="text-sm text-gray-600">Recharts integration</p>
              </div>
            </div>
          </motion.div>

          {/* Team Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-6 rounded-xl border border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Team Performance</h2>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-4">
              {[
                { name: 'Network Team', resolved: 45, pending: 8, rate: 85 },
                { name: 'Security Team', resolved: 32, pending: 5, rate: 92 },
                { name: 'Application Team', resolved: 28, pending: 12, rate: 78 },
              ].map((team) => (
                <div key={team.name} className="glass-strong p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{team.name}</span>
                    <span className="text-blue-400">{team.rate}%</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                      {team.resolved} resolved
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-yellow-400" />
                      {team.pending} pending
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${team.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass p-6 rounded-xl border border-blue-500/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Tickets</h2>
            <Link 
              href="/tickets"
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left border-b border-gray-800">
                <tr>
                  <th className="pb-3 text-gray-400 font-semibold">ID</th>
                  <th className="pb-3 text-gray-400 font-semibold">Title</th>
                  <th className="pb-3 text-gray-400 font-semibold">Category</th>
                  <th className="pb-3 text-gray-400 font-semibold">Priority</th>
                  <th className="pb-3 text-gray-400 font-semibold">Status</th>
                  <th className="pb-3 text-gray-400 font-semibold">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Loading tickets...
                    </td>
                  </tr>
                ) : (
                  [
                    { id: 'TKT-001', title: 'VPN Connection Issue', category: 'Network', priority: 'high', status: 'open', assigned: 'Network Team' },
                    { id: 'TKT-002', title: 'Password Reset Request', category: 'Access', priority: 'low', status: 'resolved', assigned: 'Security Team' },
                    { id: 'TKT-003', title: 'Application Crash', category: 'Software', priority: 'critical', status: 'in-progress', assigned: 'App Team' },
                  ].map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-blue-900/10 transition-colors">
                      <td className="py-4 text-blue-400 font-mono">{ticket.id}</td>
                      <td className="py-4">{ticket.title}</td>
                      <td className="py-4 text-gray-400">{ticket.category}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ticket.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          ticket.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-400">{ticket.assigned}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
