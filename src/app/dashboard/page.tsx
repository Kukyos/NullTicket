'use client';

import { motion } from 'framer-motion';
import { BarChart3, Clock, CheckCircle, AlertTriangle, Users, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetcher } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardStats {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  avg_resolution_time: string;
  sla_compliance: number;
}

interface TicketTrend {
  period: string;
  data: Array<{ date: string; count: number }>;
}

interface RecentTicket {
  id: string;
  ticket_number: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  assigned_to?: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<TicketTrend | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch stats
        const statsData = await fetcher('/api/analytics/summary');
        setStats(statsData);

        // Fetch trend data
        const trendResponse = await fetcher('/api/analytics/tickets/trend?days=30');
        setTrendData(trendResponse);

        // Fetch recent tickets
        const ticketsResponse = await fetcher('/api/tickets?limit=5');
        setRecentTickets(ticketsResponse || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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
    <div className="min-h-screen bg-midnight-900">
      {/* Navigation */}
      <nav className="nav-glow sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-glow-white" />
              <span className="text-2xl font-bold text-white">POWERGRID Helpdesk</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-glow-white font-semibold">
                Dashboard
              </Link>
              <Link href="/tickets" className="text-midnight-300 hover:text-glow-white transition-colors">
                Tickets
              </Link>
              <Link href="/admin" className="text-midnight-300 hover:text-glow-white transition-colors">
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
          <h1 className="text-4xl font-bold mb-2 text-white">Dashboard</h1>
          <p className="text-midnight-300">Real-time overview of your ticketing system</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-xl border border-glow-white hover:border-glow-white/80 transition-all glow-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-10 h-10 text-glow-white`} />
                <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-glow-white mb-1">
                {loading ? '...' : stat.value}
              </div>
              <div className="text-sm text-midnight-300">{stat.label}</div>
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
            className="glass p-6 rounded-xl border border-glow-white"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Ticket Trends</h2>
              <BarChart3 className="w-5 h-5 text-glow-white" />
            </div>
            <div className="h-64">
              {trendData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#60A5FA"
                      strokeWidth={2}
                      dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#60A5FA', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-midnight-300">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50 text-glow-white" />
                    <p>Loading chart data...</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Team Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-6 rounded-xl border border-glow-white"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Team Performance</h2>
              <Users className="w-5 h-5 text-glow-white" />
            </div>
            <div className="space-y-4">
              {[
                { name: 'Control Center Team', resolved: 45, pending: 8, rate: 85 },
                { name: 'Network Operations', resolved: 32, pending: 5, rate: 92 },
                { name: 'IT Support Team', resolved: 28, pending: 12, rate: 78 },
              ].map((team) => (
                <div key={team.name} className="glass-strong p-4 rounded-lg border border-glow-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{team.name}</span>
                    <span className="text-glow-white">{team.rate}%</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-midnight-300">
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                      {team.resolved} resolved
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-yellow-400" />
                      {team.pending} pending
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-midnight-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-glow-white to-midnight-300 rounded-full"
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
          className="glass p-6 rounded-xl border border-glow-white"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Tickets</h2>
            <Link 
              href="/tickets"
              className="text-glow-white hover:text-midnight-200 text-sm transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left border-b border-glow-white/30">
                <tr>
                  <th className="pb-3 text-midnight-200 font-semibold">ID</th>
                  <th className="pb-3 text-midnight-200 font-semibold">Title</th>
                  <th className="pb-3 text-midnight-200 font-semibold">Category</th>
                  <th className="pb-3 text-midnight-200 font-semibold">Priority</th>
                  <th className="pb-3 text-midnight-200 font-semibold">Status</th>
                  <th className="pb-3 text-midnight-200 font-semibold">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glow-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-midnight-300">
                      Loading tickets...
                    </td>
                  </tr>
                ) : recentTickets.length > 0 ? (
                  recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-glow-white/5 transition-colors">
                      <td className="py-4 text-glow-white font-mono">{ticket.ticket_number}</td>
                      <td className="py-4 text-white">{ticket.title}</td>
                      <td className="py-4 text-midnight-300">{ticket.category}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ticket.priority === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-midnight-300">{ticket.assigned_to || 'Unassigned'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-midnight-300">
                      No recent tickets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
