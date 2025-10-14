'use client';

import { motion } from 'framer-motion';
import { Users, GitBranch, BookOpen, Bell, Database, Shield, LogOut, Ticket, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import AdminLogin from '@/components/AdminLogin';

export default function Admin() {
  const { isAuthenticated, login, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');
  const [patterns, setPatterns] = useState([]);
  const [loadingPatterns, setLoadingPatterns] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    if (activeTab === 'kb' && isAuthenticated) {
      loadPatterns();
    }
    if (activeTab === 'tickets' && isAuthenticated) {
      loadTickets();
    }
  }, [activeTab, isAuthenticated]);

  const loadPatterns = async () => {
    try {
      setLoadingPatterns(true);
      const data = await fetcher('/api/kb/analytics/patterns');
      setPatterns(data.patterns || []);
    } catch (err) {
      console.error('Failed to load patterns:', err);
    } finally {
      setLoadingPatterns(false);
    }
  };

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      const data = await fetcher('/api/tickets');
      setTickets(data || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      await fetcher(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadTickets(); // Refresh the tickets list
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  const resolveTicket = async (ticketId: number) => {
    try {
      await fetcher(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });
      loadTickets(); // Refresh the tickets list
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    }
  };

  const createArticleFromPattern = async (category: string, title: string) => {
    try {
      const pattern = patterns.find((p: any) => p.category === category);
      if (!pattern) return;

      const sampleTicketIds = [1, 2, 3];

      await fetcher('/api/kb/articles/create-from-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title,
          ticket_ids: sampleTicketIds
        })
      });

      loadPatterns();
    } catch (err) {
      console.error('Failed to create article from pattern:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-glow-white/30 border-t-glow-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  const tabs = [
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'routing', label: 'Routing Rules', icon: GitBranch },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-midnight-900">
      <nav className="nav-glow sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-glow-white" />
              <span className="text-2xl font-bold text-white">POWERGRID Helpdesk</span>
            </Link>

            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-midnight-300 hover:text-glow-white transition-colors">
                Dashboard
              </Link>
              <Link href="/tickets" className="text-midnight-300 hover:text-glow-white transition-colors">
                Tickets
              </Link>
              <Link href="/admin" className="text-glow-white font-semibold">
                Admin
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-midnight-300 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-white">Admin Panel</h1>
          <p className="text-midnight-300">System configuration and management</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-4 rounded-xl border border-glow-white h-fit"
          >
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-midnight-900 glow-white'
                      : 'text-midnight-300 hover:bg-midnight-800 hover:text-glow-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <div className="lg:col-span-3">
            {activeTab === 'tickets' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass p-6 rounded-xl border border-glow-white">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Ticket Management</h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-midnight-300">High Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-midnight-300">Medium Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-midnight-300">Low Priority</span>
                      </div>
                    </div>
                  </div>

                  {loadingTickets ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-glow-white/30 border-t-glow-white rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tickets.length === 0 ? (
                        <div className="text-center py-12">
                          <Ticket className="w-16 h-16 text-midnight-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-midnight-300 mb-2">No tickets found</h3>
                          <p className="text-midnight-400">All tickets have been resolved!</p>
                        </div>
                      ) : (
                        tickets.map((ticket: any) => (
                          <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-strong p-6 rounded-lg hover:bg-midnight-800/50 transition-all border border-glow-white"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-4">
                                <div className={`w-4 h-4 rounded-full mt-1 ${
                                  ticket.priority === 'high' ? 'bg-red-500' :
                                  ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></div>
                                <div>
                                  <h3 className="text-lg font-semibold mb-1 text-white">{ticket.title}</h3>
                                  <p className="text-midnight-400 text-sm mb-2">Ticket #{ticket.ticket_number}</p>
                                  <p className="text-midnight-200 mb-3">{ticket.description}</p>
                                  <div className="flex items-center space-x-4 text-sm text-midnight-300">
                                    <span>By: {ticket.requester_name}</span>
                                    <span>Category: {ticket.category}</span>
                                    <span>Status: <span className={`px-2 py-1 rounded text-xs ${
                                      ticket.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                                      ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                      ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>{ticket.status.replace('_', ' ')}</span></span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <select
                                  value={ticket.status}
                                  onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                                  className="input-glow text-sm"
                                >
                                  <option value="new">New</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="resolved">Resolved</option>
                                  <option value="closed">Closed</option>
                                </select>
                                <button
                                  onClick={() => resolveTicket(ticket.id)}
                                  className="btn-glow-primary flex items-center space-x-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Resolve</span>
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-glow-white/30">
                              <div className="flex items-center space-x-4 text-sm text-midnight-300">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                </span>
                                {ticket.assigned_team_id && (
                                  <span>Assigned to: Network Team</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm transition-colors border border-blue-500/30">
                                  Assign Team
                                </button>
                                <button className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded text-sm transition-colors border border-purple-500/30">
                                  Add Note
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'teams' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass p-6 rounded-xl border border-glow-white">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Team Management</h2>
                    <button className="btn-glow-primary">
                      Add Team
                    </button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'Control Center Team', members: 12, skills: ['SCADA', 'Grid Monitoring', 'Emergency Response'] },
                      { name: 'Network Operations', members: 8, skills: ['Transmission Lines', 'Substation Equipment', 'Load Balancing'] },
                      { name: 'IT Support Team', members: 15, skills: ['SAP ERP', 'VPN Access', 'Email Systems'] },
                    ].map((team) => (
                      <div key={team.name} className="glass-strong p-4 rounded-lg hover:bg-midnight-800/50 transition-all border border-glow-white/50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                          <span className="text-midnight-300">{team.members} members</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {team.skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-glow-white/10 text-glow-white rounded text-sm border border-glow-white/30">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass p-6 rounded-xl border border-glow-white">
                  <h2 className="text-2xl font-bold mb-6 text-white">System Analytics</h2>

                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-strong p-4 rounded-lg text-center border border-glow-white/50">
                      <div className="text-2xl font-bold text-glow-white">1,247</div>
                      <div className="text-sm text-midnight-300">Total Tickets</div>
                      <div className="text-xs text-green-400 mt-1">+12% this month</div>
                    </div>
                    <div className="glass-strong p-4 rounded-lg text-center border border-glow-white/50">
                      <div className="text-2xl font-bold text-green-400">94.2%</div>
                      <div className="text-sm text-midnight-300">Resolution Rate</div>
                      <div className="text-xs text-green-400 mt-1">+2.1% this month</div>
                    </div>
                    <div className="glass-strong p-4 rounded-lg text-center border border-glow-white/50">
                      <div className="text-2xl font-bold text-purple-400">2.4h</div>
                      <div className="text-sm text-midnight-300">Avg Resolution Time</div>
                      <div className="text-xs text-red-400 mt-1">-0.3h this month</div>
                    </div>
                    <div className="glass-strong p-4 rounded-lg text-center border border-glow-white/50">
                      <div className="text-2xl font-bold text-yellow-400">4.7</div>
                      <div className="text-sm text-midnight-300">Avg Satisfaction</div>
                      <div className="text-xs text-green-400 mt-1">+0.2 this month</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="glass-strong p-6 rounded-lg border border-glow-white/50">
                      <h3 className="text-lg font-semibold mb-4 text-white">Tickets by Category</h3>
                      <div className="space-y-3">
                        {[
                          { category: 'SCADA System', count: 245, percentage: 32 },
                          { category: 'Transmission Network', count: 189, percentage: 25 },
                          { category: 'SAP ERP', count: 156, percentage: 20 },
                          { category: 'Network Connectivity', count: 98, percentage: 13 },
                          { category: 'Other', count: 78, percentage: 10 },
                        ].map((item) => (
                          <div key={item.category} className="flex items-center justify-between">
                            <span className="text-sm text-midnight-200">{item.category}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-midnight-700 rounded-full h-2">
                                <div
                                  className="bg-glow-white h-2 rounded-full"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-midnight-300 w-12">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-strong p-6 rounded-lg border border-glow-white/50">
                      <h3 className="text-lg font-semibold mb-4 text-white">Team Performance</h3>
                      <div className="space-y-3">
                        {[
                          { team: 'Control Center Team', resolved: 89, avgTime: '2.1h', satisfaction: 4.8 },
                          { team: 'Network Operations', resolved: 67, avgTime: '3.2h', satisfaction: 4.6 },
                          { team: 'IT Support Team', resolved: 78, avgTime: '2.8h', satisfaction: 4.7 },
                          { team: 'Field Support', resolved: 156, avgTime: '1.9h', satisfaction: 4.5 },
                        ].map((team) => (
                          <div key={team.team} className="flex items-center justify-between p-3 glass rounded border border-glow-white/30">
                            <div>
                              <div className="font-medium text-white">{team.team}</div>
                              <div className="text-sm text-midnight-300">{team.resolved} resolved</div>
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-midnight-200">{team.avgTime} avg</div>
                              <div className="text-yellow-400">★ {team.satisfaction}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="glass-strong p-6 rounded-lg border border-glow-white/50">
                    <h3 className="text-lg font-semibold mb-4 text-white">SLA Compliance</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">96.4%</div>
                        <div className="text-sm text-midnight-300">Overall Compliance</div>
                        <div className="text-xs text-green-400 mt-1">Target: 95%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">89.2%</div>
                        <div className="text-sm text-midnight-300">Critical Tickets</div>
                        <div className="text-xs text-yellow-400 mt-1">Target: 98%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-glow-white mb-2">97.8%</div>
                        <div className="text-sm text-midnight-300">Standard Tickets</div>
                        <div className="text-xs text-green-400 mt-1">Target: 90%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}