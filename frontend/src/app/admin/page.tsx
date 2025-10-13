'use client';

import { motion } from 'framer-motion';
import { Settings, Users, GitBranch, BookOpen, Bell, Database, Shield, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import AdminLogin from '@/components/AdminLogin';

export default function Admin() {
  const { isAuthenticated, login, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('teams');
  const [patterns, setPatterns] = useState([]);
  const [loadingPatterns, setLoadingPatterns] = useState(false);

  useEffect(() => {
    if (activeTab === 'kb' && isAuthenticated) {
      loadPatterns();
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  const tabs = [
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'routing', label: 'Routing Rules', icon: GitBranch },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950">
      <nav className="glass-strong border-b border-blue-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-blue-400 glow" />
              <span className="text-2xl font-bold text-glow">NullTicket</span>
            </Link>

            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-300 hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/tickets" className="text-gray-300 hover:text-blue-400 transition-colors">
                Tickets
              </Link>
              <Link href="/admin" className="text-blue-400 font-semibold">
                Admin
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
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
          <h1 className="text-4xl font-bold mb-2 text-glow">Admin Panel</h1>
          <p className="text-gray-400">System configuration and management</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-4 rounded-xl border border-blue-500/20 h-fit"
          >
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white glow'
                      : 'text-gray-400 hover:bg-blue-900/20 hover:text-blue-400'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <div className="lg:col-span-3">
            {activeTab === 'teams' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass p-6 rounded-xl border border-blue-500/20">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Team Management</h2>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg glow-hover transition-all">
                      Add Team
                    </button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'Network Team', members: 12, skills: ['VPN', 'Firewall', 'Routing'] },
                      { name: 'Security Team', members: 8, skills: ['Access Control', 'IAM', 'Compliance'] },
                      { name: 'Application Team', members: 15, skills: ['SAP', 'Oracle', 'Custom Apps'] },
                    ].map((team) => (
                      <div key={team.name} className="glass-strong p-4 rounded-lg hover:bg-blue-900/10 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{team.name}</h3>
                          <span className="text-gray-400">{team.members} members</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {team.skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
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
                <div className="glass p-6 rounded-xl border border-blue-500/20">
                  <h2 className="text-2xl font-bold mb-6">System Analytics</h2>

                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-strong p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-400">1,247</div>
                      <div className="text-sm text-gray-400">Total Tickets</div>
                      <div className="text-xs text-green-400 mt-1">+12% this month</div>
                    </div>
                    <div className="glass-strong p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-400">94.2%</div>
                      <div className="text-sm text-gray-400">Resolution Rate</div>
                      <div className="text-xs text-green-400 mt-1">+2.1% this month</div>
                    </div>
                    <div className="glass-strong p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-400">2.4h</div>
                      <div className="text-sm text-gray-400">Avg Resolution Time</div>
                      <div className="text-xs text-red-400 mt-1">-0.3h this month</div>
                    </div>
                    <div className="glass-strong p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-400">4.7</div>
                      <div className="text-sm text-gray-400">Avg Satisfaction</div>
                      <div className="text-xs text-green-400 mt-1">+0.2 this month</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="glass-strong p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Tickets by Category</h3>
                      <div className="space-y-3">
                        {[
                          { category: 'Network', count: 245, percentage: 32 },
                          { category: 'Hardware', count: 189, percentage: 25 },
                          { category: 'Software', count: 156, percentage: 20 },
                          { category: 'Access', count: 98, percentage: 13 },
                          { category: 'Other', count: 78, percentage: 10 },
                        ].map((item) => (
                          <div key={item.category} className="flex items-center justify-between">
                            <span className="text-sm">{item.category}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-400 w-12">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-strong p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
                      <div className="space-y-3">
                        {[
                          { team: 'Network Team', resolved: 89, avgTime: '2.1h', satisfaction: 4.8 },
                          { team: 'Security Team', resolved: 67, avgTime: '3.2h', satisfaction: 4.6 },
                          { team: 'Application Team', resolved: 78, avgTime: '2.8h', satisfaction: 4.7 },
                          { team: 'Help Desk', resolved: 156, avgTime: '1.9h', satisfaction: 4.5 },
                        ].map((team) => (
                          <div key={team.team} className="flex items-center justify-between p-3 glass rounded">
                            <div>
                              <div className="font-medium">{team.team}</div>
                              <div className="text-sm text-gray-400">{team.resolved} resolved</div>
                            </div>
                            <div className="text-right text-sm">
                              <div>{team.avgTime} avg</div>
                              <div className="text-yellow-400">★ {team.satisfaction}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="glass-strong p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">SLA Compliance</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">96.4%</div>
                        <div className="text-sm text-gray-400">Overall Compliance</div>
                        <div className="text-xs text-green-400 mt-1">Target: 95%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">89.2%</div>
                        <div className="text-sm text-gray-400">Critical Tickets</div>
                        <div className="text-xs text-yellow-400 mt-1">Target: 98%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">97.8%</div>
                        <div className="text-sm text-gray-400">Standard Tickets</div>
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