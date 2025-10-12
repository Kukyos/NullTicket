'use client';

import { motion } from 'framer-motion';
import { Settings, Users, GitBranch, BookOpen, Bell, Database, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('teams');

  const tabs = [
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'routing', label: 'Routing Rules', icon: GitBranch },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950">
      {/* Navigation */}
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
          <h1 className="text-4xl font-bold mb-2 text-glow">Admin Panel</h1>
          <p className="text-gray-400">System configuration and management</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
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

          {/* Content Area */}
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

            {activeTab === 'routing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-xl border border-blue-500/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Routing Rules</h2>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg glow-hover transition-all">
                    New Rule
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { condition: 'Category: Network', action: 'Assign to Network Team', priority: 1 },
                    { condition: 'Priority: Critical', action: 'Escalate to Senior Team', priority: 1 },
                    { condition: 'Keyword: Password', action: 'Assign to Security Team', priority: 2 },
                  ].map((rule, i) => (
                    <div key={i} className="glass-strong p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-blue-400 mb-1">{rule.condition}</div>
                          <div className="text-gray-400">→ {rule.action}</div>
                        </div>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          Priority {rule.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'kb' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-xl border border-blue-500/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Knowledge Base</h2>
                  <Link href="/kb/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg glow-hover transition-all">
                    New Article
                  </Link>
                </div>
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">Knowledge base articles will be displayed here</p>
                  <p className="text-sm text-gray-500">AI-powered article suggestions coming soon</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-xl border border-blue-500/20"
              >
                <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
                <div className="space-y-6">
                  <div className="glass-strong p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">Email Notifications</h3>
                        <p className="text-sm text-gray-400">Send email alerts for ticket updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  <div className="glass-strong p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">SMS Alerts</h3>
                        <p className="text-sm text-gray-400">Send SMS for critical tickets</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  <div className="glass-strong p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">SLA Breach Alerts</h3>
                        <p className="text-sm text-gray-400">Notify when SLA is at risk</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-xl border border-blue-500/20"
              >
                <h2 className="text-2xl font-bold mb-6">Integrations</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'GLPI', status: 'connected', icon: '🔧' },
                    { name: 'SAP Solman', status: 'connected', icon: '📊' },
                    { name: 'Email (IMAP)', status: 'connected', icon: '📧' },
                    { name: 'Twilio SMS', status: 'pending', icon: '📱' },
                  ].map((integration) => (
                    <div key={integration.name} className="glass-strong p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{integration.icon}</span>
                          <span className="font-semibold">{integration.name}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          integration.status === 'connected'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {integration.status}
                        </span>
                      </div>
                      <button className="w-full mt-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm transition-all">
                        Configure
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-xl border border-blue-500/20"
              >
                <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">Security configuration options</p>
                  <p className="text-sm text-gray-500">Role-based access control, API keys, audit logs</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
