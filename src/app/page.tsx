'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Brain, GitBranch, Mail, MessageSquare, BarChart3, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
              {/* POWERGRID Logo */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-midnight-900"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-glow-white">POWERGRID</span>
                <div className="text-xs text-midnight-400 -mt-1">Corporation of India Ltd.</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-6"
            >
              <Link href="/dashboard" className="text-midnight-200 hover:text-white transition-colors glow-white-hover hidden md:block">
                Dashboard
              </Link>
              <Link href="/tickets" className="text-midnight-200 hover:text-white transition-colors glow-white-hover hidden md:block">
                Tickets
              </Link>
              <Link href="/admin" className="text-midnight-200 hover:text-white transition-colors glow-white-hover hidden md:block">
                Admin
              </Link>
              <Link
                href="/dashboard"
                className="btn-glow-primary"
              >
                <span className="hidden md:inline">Get Started</span>
                <span className="md:hidden">🚀</span>
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              POWERGRID
              <span className="block text-glow-white text-glow-white">Smart Helpdesk</span>
            </h1>
            <p className="text-lg md:text-xl text-midnight-300 mb-8">
              AI-powered unified ticketing system for India&apos;s largest power transmission company. Consolidate all IT support channels into one intelligent platform with automated classification, routing, and resolution for seamless power grid operations.
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
            {/* Power Grid Network Visualization */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Transmission Lines */}
                <line x1="50" y1="100" x2="350" y2="100" stroke="#60A5FA" strokeWidth="2" opacity="0.6"/>
                <line x1="50" y1="150" x2="350" y2="150" stroke="#60A5FA" strokeWidth="2" opacity="0.6"/>
                <line x1="50" y1="200" x2="350" y2="200" stroke="#60A5FA" strokeWidth="2" opacity="0.6"/>
                
                {/* Power Stations/Substations */}
                <circle cx="50" cy="100" r="8" fill="#10B981" className="animate-pulse"/>
                <circle cx="50" cy="150" r="8" fill="#10B981" className="animate-pulse"/>
                <circle cx="50" cy="200" r="8" fill="#10B981" className="animate-pulse"/>
                
                <circle cx="350" cy="100" r="8" fill="#F59E0B" className="animate-pulse"/>
                <circle cx="350" cy="150" r="8" fill="#F59E0B" className="animate-pulse"/>
                <circle cx="350" cy="200" r="8" fill="#F59E0B" className="animate-pulse"/>
                
                {/* Transformers */}
                <rect x="195" y="85" width="10" height="30" fill="#8B5CF6" rx="2"/>
                <rect x="195" y="135" width="10" height="30" fill="#8B5CF6" rx="2"/>
                <rect x="195" y="185" width="10" height="30" fill="#8B5CF6" rx="2"/>
                
                {/* Energy Flow Animation */}
                <circle r="3" fill="#60A5FA" className="animate-ping">
                  <animateMotion dur="3s" repeatCount="indefinite">
                    <path d="M50,100 Q200,80 350,100"/>
                  </animateMotion>
                </circle>
                <circle r="3" fill="#60A5FA" className="animate-ping">
                  <animateMotion dur="3s" repeatCount="indefinite" begin="1s">
                    <path d="M50,150 Q200,130 350,150"/>
                  </animateMotion>
                </circle>
                <circle r="3" fill="#60A5FA" className="animate-ping">
                  <animateMotion dur="3s" repeatCount="indefinite" begin="2s">
                    <path d="M50,200 Q200,180 350,200"/>
                  </animateMotion>
                </circle>
              </svg>
            </div>
            
            <div className="glass p-8 rounded-2xl border border-glow-white animate-float relative z-10">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Brain, label: 'AI Classification', value: '98%', color: 'blue' },
                  { icon: Zap, label: 'Auto Resolution', value: '75%', color: 'yellow' },
                  { icon: GitBranch, label: 'Smart Routing', value: '100%', color: 'green' },
                  { icon: BarChart3, label: 'Faster Response', value: '3x', color: 'purple' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="glass-strong p-6 rounded-xl text-center hover:glass-hover transition-all glow-white-hover group"
                  >
                    <stat.icon className={`w-8 h-8 mx-auto mb-3 text-${stat.color}-400 group-hover:scale-110 transition-transform`} />
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
              description: 'Consolidate tickets from SCADA systems, chatbot, email, GLPI, and SAP into a single platform for power grid operations',
              color: 'blue',
              visual: '🔗'
            },
            {
              icon: Brain,
              title: 'AI Classification',
              description: 'NLP-powered automatic categorization of transmission faults, network issues, and operational incidents using LLaMA 3.1',
              color: 'purple',
              visual: '🤖'
            },
            {
              icon: GitBranch,
              title: 'Intelligent Routing',
              description: 'Context-aware ticket assignment to regional control centers and specialized teams based on grid location and urgency',
              color: 'green',
              visual: '🎯'
            },
            {
              icon: Zap,
              title: 'Self-Service Resolution',
              description: 'AI chatbots handle common issues like VPN access, SAP password resets, and basic network troubleshooting',
              color: 'yellow',
              visual: '⚡'
            },
            {
              icon: Mail,
              title: 'Smart Notifications',
              description: 'Real-time alerts for grid incidents, SLA breaches, and critical system outages via email and SMS',
              color: 'red',
              visual: '📢'
            },
            {
              icon: BarChart3,
              title: 'Knowledge Base',
              description: 'AI-powered article suggestions for transmission equipment, grid protocols, and operational procedures',
              color: 'indigo',
              visual: '📚'
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-2xl border border-glow-white hover:border-glow-white/80 transition-all glow-hover group relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full transform rotate-12 translate-x-6 -translate-y-6"></div>
              </div>
              
              {/* Visual Icon */}
              <div className="text-4xl mb-4 opacity-80">{feature.visual}</div>
              
              <feature.icon className={`w-12 h-12 text-${feature.color}-400 mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-midnight-300">{feature.description}</p>
              
              {/* Progress Bar */}
              <div className="mt-4 h-1 bg-midnight-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-400 rounded-full transition-all duration-1000`}
                  style={{ width: '85%' }}
                ></div>
              </div>
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
          className="glass p-8 md:p-16 rounded-3xl border border-glow-white text-center relative overflow-hidden"
        >
          {/* Background Energy Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 800 400" className="w-full h-full">
              {/* Energy Waves */}
              <path d="M0,200 Q200,150 400,200 T800,200" stroke="#60A5FA" strokeWidth="2" fill="none" opacity="0.3">
                <animate attributeName="d" dur="4s" repeatCount="indefinite" 
                  values="M0,200 Q200,150 400,200 T800,200;
                         M0,200 Q200,250 400,200 T800,200;
                         M0,200 Q200,150 400,200 T800,200"/>
              </path>
              <path d="M0,220 Q200,170 400,220 T800,220" stroke="#8B5CF6" strokeWidth="2" fill="none" opacity="0.2">
                <animate attributeName="d" dur="3s" repeatCount="indefinite" begin="1s"
                  values="M0,220 Q200,170 400,220 T800,220;
                         M0,220 Q200,270 400,220 T800,220;
                         M0,220 Q200,170 400,220 T800,220"/>
              </path>
            </svg>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-midnight-900/20 to-midnight-800/20 animate-glow" />
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-4 bg-midnight-800/50 px-6 py-3 rounded-full border border-glow-white/30">
                <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
                <span className="text-glow-white font-semibold">⚡ POWERGRID Innovation ⚡</span>
                <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">Ready to Power Up IT Support?</h2>
            <p className="text-xl text-midnight-300 mb-8 max-w-2xl mx-auto">
              Join POWERGRID in modernizing helpdesk operations with AI-powered automation for reliable power transmission
            </p>
            
            <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-glow-white mb-1">50K+</div>
                <div className="text-xs md:text-sm text-midnight-400">Tickets Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">98%</div>
                <div className="text-xs md:text-sm text-midnight-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">24/7</div>
                <div className="text-xs md:text-sm text-midnight-400">Support</div>
              </div>
            </div>
            
            <Link 
              href="/dashboard"
              className="inline-block px-12 py-4 btn-glow-primary text-white rounded-lg glow-hover transition-all font-semibold text-lg group"
            >
              <span className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Get Started Now</span>
                <Zap className="w-5 h-5" />
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Floating Create Ticket Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-20 md:right-24 z-50"
      >
        <Link
          href="/tickets/new"
          className="flex items-center space-x-3 px-6 py-4 btn-glow-primary text-white rounded-full shadow-lg glow-hover transition-all font-semibold group relative overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse opacity-20"></div>
          
          {/* Energy Sparkles */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10 flex items-center space-x-2">
            <span className="text-xl animate-bounce">🎫</span>
            <span className="hidden sm:inline">Create Ticket</span>
            <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
          </div>
          
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 }}
          />
        </Link>
      </motion.div>

      {/* Footer */}
      <footer className="glass-strong border-t border-glow-white mt-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 1200 100" className="w-full h-full">
            <defs>
              <pattern id="powerLines" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                <line x1="0" y1="10" x2="80" y2="10" stroke="#60A5FA" strokeWidth="1" opacity="0.3"/>
                <circle cx="20" cy="10" r="2" fill="#10B981"/>
                <circle cx="60" cy="10" r="2" fill="#F59E0B"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#powerLines)"/>
          </svg>
        </div>
        
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white">POWERGRID</div>
                  <div className="text-xs text-midnight-400">Smart Helpdesk</div>
                </div>
              </div>
              <p className="text-midnight-300 text-sm">
                India&apos;s largest power transmission company, powering the nation&apos;s energy needs with cutting-edge technology and AI-driven support systems.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-midnight-300 hover:text-glow-white transition-colors text-sm">Dashboard</Link>
                <Link href="/tickets" className="block text-midnight-300 hover:text-glow-white transition-colors text-sm">Support Tickets</Link>
                <Link href="/admin" className="block text-midnight-300 hover:text-glow-white transition-colors text-sm">Admin Panel</Link>
                <Link href="/kb" className="block text-midnight-300 hover:text-glow-white transition-colors text-sm">Knowledge Base</Link>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <div className="space-y-2 text-sm text-midnight-300">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>helpdesk@powergrid.in</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>24/7 AI Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Emergency: +91-1800-XXX-XXXX</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-glow-white/30 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-midnight-300 text-sm mb-4 md:mb-0">
                © 2025 POWERGRID Corporation of India Ltd. All rights reserved.
              </div>
              <div className="flex items-center space-x-4 text-sm text-midnight-400">
                <span>Built for Smart India Hackathon 2025</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
