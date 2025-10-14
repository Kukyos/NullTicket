'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Brain, GitBranch, Mail, MessageSquare, BarChart3, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [apiHealth, setApiHealth] = useState<any>(null);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const health = await response.json();
        setBackendStatus('connected');
        setApiHealth(health);
      } else {
        setBackendStatus('disconnected');
      }
    } catch (error) {
      setBackendStatus('disconnected');
      console.error('Backend check failed:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900">
      {/* Navigation */}
      <nav className="nav-glow sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <Shield className="w-8 h-8 text-glow-white glow-white" />
              <span className="text-2xl font-bold text-glow-white">NullTicket</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-6"
            >
              <Link href="/dashboard" className="text-midnight-200 hover:text-white transition-colors glow-white-hover">
                Dashboard
              </Link>
              <Link href="/tickets" className="text-midnight-200 hover:text-white transition-colors glow-white-hover">
                Tickets
              </Link>
              <Link href="/admin" className="text-midnight-200 hover:text-white transition-colors glow-white-hover">
                Admin
              </Link>
              <Link
                href="/dashboard"
                className="btn-glow-primary"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Smart Helpdesk
              <span className="block text-glow-white text-glow-white">Ticketing Solution</span>
            </h1>
            <p className="text-xl text-midnight-300 mb-8">
              AI-powered unified ticketing system for POWERGRID. Consolidate all IT support channels into one intelligent platform with automated classification, routing, and resolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/tickets/new"
                className="btn-glow-primary text-lg px-8 py-4"
              >
                🚀 Create New Ticket
              </Link>
              <Link
                href="/dashboard"
                className="btn-glow text-lg px-8 py-4"
              >
                Launch Dashboard
              </Link>
              <Link
                href="/tickets"
                className="glass-hover text-white text-lg px-8 py-4 rounded-lg transition-all font-semibold text-center hover:glow-white-hover"
              >
                View Tickets
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="glass p-8 rounded-2xl border border-glow-white animate-float">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Brain, label: 'AI Classification', value: '98%' },
                  { icon: Zap, label: 'Auto Resolution', value: '75%' },
                  { icon: GitBranch, label: 'Smart Routing', value: '100%' },
                  { icon: BarChart3, label: 'Faster Response', value: '3x' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="glass-strong p-6 rounded-xl text-center hover:glass-hover transition-all glow-white-hover"
                  >
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-glow-white" />
                    <div className="text-3xl font-bold text-glow-white mb-1">{stat.value}</div>
                    <div className="text-sm text-midnight-300">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Backend Status Indicators */}
      <section className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass p-8 rounded-2xl border border-glow-white max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-glow-white" />
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Backend Connection */}
            <div className="flex items-center gap-4 p-6 glass-strong rounded-xl border border-glow-white">
              {backendStatus === 'checking' && <AlertCircle className="w-6 h-6 text-yellow-500 animate-pulse" />}
              {backendStatus === 'connected' && <CheckCircle className="w-6 h-6 text-green-500" />}
              {backendStatus === 'disconnected' && <XCircle className="w-6 h-6 text-red-500" />}
              <div>
                <p className="font-semibold text-white text-lg">Backend API</p>
                <p className="text-sm text-midnight-300">
                  {backendStatus === 'checking' && 'Checking connection...'}
                  {backendStatus === 'connected' && 'Connected & Ready'}
                  {backendStatus === 'disconnected' && 'Connection Failed'}
                </p>
              </div>
            </div>

            {/* Database Status */}
            <div className="flex items-center gap-4 p-6 glass-strong rounded-xl border border-glow-white">
              {apiHealth?.database === 'healthy' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : apiHealth?.database === 'unhealthy' ? (
                <XCircle className="w-6 h-6 text-red-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-500 animate-pulse" />
              )}
              <div>
                <p className="font-semibold text-white text-lg">Database</p>
                <p className="text-sm text-midnight-300">
                  {apiHealth?.database === 'healthy' && 'PostgreSQL Connected'}
                  {apiHealth?.database === 'unhealthy' && 'Connection Failed'}
                  {!apiHealth?.database && 'Checking...'}
                </p>
              </div>
            </div>

            {/* AI Services */}
            <div className="flex items-center gap-4 p-6 glass-strong rounded-xl border border-glow-white">
              {apiHealth?.ai_services === 'healthy' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : apiHealth?.ai_services === 'unhealthy' ? (
                <XCircle className="w-6 h-6 text-red-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-500 animate-pulse" />
              )}
              <div>
                <p className="font-semibold text-white text-lg">AI Services</p>
                <p className="text-sm text-midnight-300">
                  {apiHealth?.ai_services === 'healthy' && 'LLaMA 3.1 Available'}
                  {apiHealth?.ai_services === 'unhealthy' && 'Service Unavailable'}
                  {!apiHealth?.ai_services && 'Checking...'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">Unified Ticket Management</h2>
          <p className="text-xl text-midnight-300">All your IT support channels in one powerful platform</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: MessageSquare,
              title: 'Unified Ingestion',
              description: 'Consolidate tickets from chatbot, email, GLPI, and Solman into a single system'
            },
            {
              icon: Brain,
              title: 'AI Classification',
              description: 'NLP-powered automatic categorization and priority assignment using LLaMA 3.1'
            },
            {
              icon: GitBranch,
              title: 'Intelligent Routing',
              description: 'Context-aware ticket assignment based on urgency and historical patterns'
            },
            {
              icon: Zap,
              title: 'Self-Service Resolution',
              description: 'AI chatbots handle common issues like password resets and VPN access'
            },
            {
              icon: Mail,
              title: 'Smart Notifications',
              description: 'Configurable email and SMS alerts for specific events and SLA breaches'
            },
            {
              icon: BarChart3,
              title: 'Knowledge Base',
              description: 'AI-powered article suggestions and automatic KB creation from trends'
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-2xl border border-glow-white hover:border-glow-white/80 transition-all glow-hover group"
            >
              <feature.icon className="w-12 h-12 text-glow-white mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-midnight-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass p-16 rounded-3xl border border-glow-white text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-midnight-900/20 to-midnight-800/20 animate-glow" />
          <div className="relative z-10">
            <h2 className="text-5xl font-bold mb-6 text-white">Ready to Transform IT Support?</h2>
            <p className="text-xl text-midnight-300 mb-8 max-w-2xl mx-auto">
              Join POWERGRID in modernizing helpdesk operations with AI-powered automation
            </p>
            <Link 
              href="/dashboard"
              className="inline-block px-12 py-4 btn-glow-primary text-white rounded-lg glow-hover transition-all font-semibold text-lg"
            >
              Get Started Now
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Floating Create Ticket Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-8 right-32 z-50"
      >
        <Link
          href="/tickets/new"
          className="flex items-center space-x-2 px-6 py-3 btn-glow-primary text-white rounded-full shadow-lg glow-hover transition-all font-semibold group"
        >
          <span className="text-lg">🎫</span>
          <span className="hidden sm:inline">Create Ticket</span>
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 }}
          />
        </Link>
      </motion.div>

      {/* Footer */}
      <footer className="glass-strong border-t border-glow-white mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-glow-white" />
              <span className="font-bold text-white">NullTicket</span>
            </div>
            <div className="text-midnight-300 text-sm">
              © 2025 POWERGRID. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
