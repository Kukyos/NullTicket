'use client';

import { motion } from 'framer-motion';
import { Search, Filter, Plus, Mail, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/utils';

interface Ticket {
  id: number | string;
  ticket_number?: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  source: string;
  assigned_to: string | null;
  created_at: string;
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await fetcher('/api/tickets');
        setTickets(data);
      } catch (error) {
        console.error('Failed to load tickets:', error);
        // Fallback to mock data if API fails
        setTickets([
          {
            id: 'TKT-001',
            ticket_number: 'TKT-001',
            title: 'VPN Connection Issue',
            description: 'Unable to connect to corporate VPN from remote location',
            category: 'Network',
            priority: 'high',
            status: 'open',
            source: 'email',
            assigned_to: 'Network Team',
            created_at: '2025-10-12T10:30:00Z',
          },
          {
            id: 'TKT-002',
            ticket_number: 'TKT-002',
            title: 'Password Reset Request',
            description: 'User needs password reset for domain account',
            category: 'Access',
            priority: 'low',
            status: 'resolved',
            source: 'chatbot',
            assigned_to: 'Security Team',
            created_at: '2025-10-12T09:15:00Z',
          },
          {
            id: 'TKT-003',
            ticket_number: 'TKT-003',
            title: 'Application Crash on Startup',
            description: 'SAP application crashes immediately after launch',
            category: 'Software',
            priority: 'critical',
            status: 'in-progress',
            source: 'glpi',
            assigned_to: 'App Team',
            created_at: '2025-10-12T08:45:00Z',
          },
          {
            id: 'TKT-004',
            ticket_number: 'TKT-004',
            title: 'Printer Not Responding',
            description: 'Network printer in 3rd floor not accepting print jobs',
            category: 'Hardware',
            priority: 'medium',
            status: 'open',
            source: 'solman',
            assigned_to: null,
            created_at: '2025-10-12T11:20:00Z',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'chatbot': return <MessageSquare className="w-4 h-4" />;
      case 'glpi': return <Clock className="w-4 h-4" />;
      case 'solman': return <AlertCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950">
      {/* Navigation */}
      <nav className="glass-strong border-b border-blue-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-blue-400 glow" />
              <span className="text-2xl font-bold text-glow">NullTicket</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-300 hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/tickets" className="text-blue-400 font-semibold">
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
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 text-glow">Tickets</h1>
            <p className="text-gray-400">Manage and track all support tickets</p>
          </div>
          <Link href="/tickets/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg glow-hover transition-all flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>New Ticket</span>
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-xl border border-blue-500/20 mb-6"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tickets List */}
        <div className="space-y-4">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass p-8 rounded-xl border border-blue-500/20 text-center"
            >
              <div className="text-gray-500">Loading tickets...</div>
            </motion.div>
          ) : filteredTickets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass p-8 rounded-xl border border-blue-500/20 text-center"
            >
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <div className="text-gray-400">No tickets found</div>
            </motion.div>
          ) : (
            filteredTickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/50 transition-all glow-hover cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-blue-400 font-mono font-semibold">{ticket.ticket_number ?? ticket.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${
                        ticket.source === 'email' ? 'bg-purple-500/20 text-purple-400' :
                        ticket.source === 'chatbot' ? 'bg-green-500/20 text-green-400' :
                        ticket.source === 'glpi' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {getSourceIcon(ticket.source)}
                        <span>{ticket.source.toUpperCase()}</span>
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{ticket.title}</h3>
                    <p className="text-gray-400 mb-4">{ticket.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-gray-500">{ticket.category}</span>
                      {ticket.assigned_to && (
                        <span className="text-gray-500">→ {ticket.assigned_to}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ticket.priority === 'critical' ? 'bg-red-500/20 text-red-400 glow' :
                      ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                      ticket.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {ticket.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
