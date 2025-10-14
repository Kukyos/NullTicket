'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { fetcher } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTicketConfirm, setShowTicketConfirm] = useState(false);
  const [pendingTicketData, setPendingTicketData] = useState<any>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Check for self-service responses first
      const selfServiceResponse = await getSelfServiceResponse(userMessage.toLowerCase());

      if (selfServiceResponse) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: selfServiceResponse }
        ]);
        setLoading(false);
        return;
      }

      // If no self-service response, try AI chat
      try {
        const aiResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            context: messages.slice(-6).map(m => ({ role: m.role, content: m.content })) // Send last 6 messages for context
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          if (aiData.response) {
            // Check if AI suggests creating a ticket
            if (aiData.needsTicket) {
              setMessages(prev => [
                ...prev,
                { role: 'assistant', content: aiData.response }
              ]);
              setPendingTicketData(aiData.ticketDetails || {
                title: userMessage,
                description: `Chatbot conversation: ${userMessage}`,
                priority: 'medium',
                category: 'general'
              });
              setShowTicketConfirm(true);
              setLoading(false);
              return;
            } else {
              // Normal AI response
              setMessages(prev => [
                ...prev,
                { role: 'assistant', content: aiData.response }
              ]);
              setLoading(false);
              return;
            }
          }
        } else {
          // Handle API error response
          const errorData = await aiResponse.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `API error: ${aiResponse.status}`);
        }
      } catch (aiError) {
        console.error('AI chat failed:', aiError);
        // Show actual error message
        const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Error: ${errorMessage}` }
        ]);
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  // Self-service response logic with knowledge base integration
  const getSelfServiceResponse = async (message: string): Promise<string | null> => {
    try {
      // Search knowledge base for relevant articles
      const kbResponse = await fetch(`/api/kb/search?q=${encodeURIComponent(message)}&limit=3`);
      let kbResults = null;
      if (kbResponse.ok) {
        kbResults = await kbResponse.json();
      }

      // Password reset
      if (message.includes('password') && (message.includes('reset') || message.includes('forgot') || message.includes('change'))) {
        let response = `🔐 **Password Reset Instructions:**

1. Visit the POWERGRID Self-Service Portal: https://selfservice.powergrid.in
2. Click "Forgot Password" or "Reset Password"
3. Enter your employee ID and registered email
4. Follow the verification process
5. Create a new strong password (minimum 8 characters, include numbers and symbols)

If you don't have access to your registered email, please contact your manager or HR department.

Would you like me to create a ticket for additional assistance?`;

        // Add relevant KB articles
        if (kbResults && kbResults.length > 0) {
          const passwordArticles = kbResults.filter((article: any) =>
            article.category === 'password_reset' || article.tags?.includes('password')
          );
          if (passwordArticles.length > 0) {
            response += '\n\n📚 **Related Knowledge Base Articles:**\n';
            passwordArticles.slice(0, 2).forEach((article: any) => {
              response += `• [${article.title}](/kb/article/${article.id})\n`;
            });
          }
        }

        return response;
      }

      // VPN access
      if (message.includes('vpn') && (message.includes('connect') || message.includes('access') || message.includes('login'))) {
        let response = `🌐 **VPN Access Instructions:**

1. **Download Cisco AnyConnect** from the IT portal or contact IT support
2. **Server Address**: vpn.powergrid.in
3. **Username**: Your employee ID
4. **Authentication**: Use your domain password

**Troubleshooting:**
- Ensure you're connected to internet
- Try different DNS (8.8.8.8, 8.8.4.4)
- Clear browser cache and cookies
- Try incognito/private browsing mode

**Common Issues:**
- Password expired? Reset via self-service portal
- Account locked? Contact IT security team
- New user? Request VPN access through your manager

Need help with VPN setup? I can create a support ticket for you.`;

        // Add relevant KB articles
        if (kbResults && kbResults.length > 0) {
          const vpnArticles = kbResults.filter((article: any) =>
            article.category === 'vpn' || article.tags?.includes('vpn')
          );
          if (vpnArticles.length > 0) {
            response += '\n\n📚 **Related Knowledge Base Articles:**\n';
            vpnArticles.slice(0, 2).forEach((article: any) => {
              response += `• [${article.title}](/kb/article/${article.id})\n`;
            });
          }
        }

        return response;
      }

      // Email access
      if (message.includes('email') && (message.includes('access') || message.includes('login') || message.includes('outlook'))) {
        let response = `📧 **Email Access Issues:**

**Web Access:**
- URL: https://mail.powergrid.in (OWA)
- Username: employee.id@powergrid.in
- Password: Your domain password

**Outlook Desktop:**
- Server: mail.powergrid.in
- Protocol: Exchange/Office 365

**Mobile Access:**
- Add account in native mail app
- Server: outlook.office365.com
- Use Office 365 authentication

**If you can't access:**
1. Reset password via self-service portal
2. Check if account is active with HR
3. Verify internet connection
4. Try different browser/device

Would you like me to escalate this to IT support?`;

        // Add relevant KB articles
        if (kbResults && kbResults.length > 0) {
          const emailArticles = kbResults.filter((article: any) =>
            article.category === 'email' || article.tags?.includes('email')
          );
          if (emailArticles.length > 0) {
            response += '\n\n📚 **Related Knowledge Base Articles:**\n';
            emailArticles.slice(0, 2).forEach((article: any) => {
              response += `• [${article.title}](/kb/article/${article.id})\n`;
            });
          }
        }

        return response;
      }

      // Network connectivity
      if (message.includes('internet') || message.includes('network') || message.includes('wifi') || message.includes('connection')) {
        let response = `📡 **Network Connectivity Issues:**

**Immediate Checks:**
1. **Restart your device** (computer/mobile)
2. **Check network cables** (if applicable)
3. **Switch between WiFi and Ethernet**
4. **Forget and reconnect to WiFi**
5. **Try different browser**

**WiFi Troubleshooting:**
- Network Name: POWERGRID-GUEST or POWERGRID-CORP
- Check signal strength
- Move closer to access point
- Avoid interference sources

**Advanced Steps:**
- Flush DNS: Run \`ipconfig /flushdns\` (Windows)
- Reset network: Settings > Network > Reset
- Check firewall/antivirus settings

**If persistent:**
- Contact IT support with your location
- Provide error messages or symptoms
- Note when the issue started

Shall I create a support ticket for network assistance?`;

        // Add relevant KB articles
        if (kbResults && kbResults.length > 0) {
          const networkArticles = kbResults.filter((article: any) =>
            article.category === 'network' || article.tags?.includes('network')
          );
          if (networkArticles.length > 0) {
            response += '\n\n📚 **Related Knowledge Base Articles:**\n';
            networkArticles.slice(0, 2).forEach((article: any) => {
              response += `• [${article.title}](/kb/article/${article.id})\n`;
            });
          }
        }

        return response;
      }

      // Software installation
      if (message.includes('install') || message.includes('software') || message.includes('application') || message.includes('program')) {
        let response = `💿 **Software Installation Request:**

**Standard Software Available:**
- Microsoft Office Suite
- Antivirus Software
- PDF Readers
- Web Browsers
- Communication Tools

**Request Process:**
1. **Check Software Catalog**: Visit IT portal for available software
2. **Submit Request**: Use the software request form
3. **Approval**: Manager approval may be required
4. **Installation**: IT team will install and configure

**Urgent Requirements:**
- Business-critical software: Contact your manager
- Temporary access: Request through IT helpdesk
- Cloud alternatives: Check if web-based versions exist

**Self-Installation:**
Some software can be installed from: \\\\software.powergrid.in

Would you like me to help you submit a software installation request?`;

        // Add relevant KB articles
        if (kbResults && kbResults.length > 0) {
          const softwareArticles = kbResults.filter((article: any) =>
            article.category === 'software' || article.tags?.includes('software')
          );
          if (softwareArticles.length > 0) {
            response += '\n\n📚 **Related Knowledge Base Articles:**\n';
            softwareArticles.slice(0, 2).forEach((article: any) => {
              response += `• [${article.title}](/kb/article/${article.id})\n`;
            });
          }
        }

        return response;
      }

      // Hardware issues
      if (message.includes('computer') || message.includes('laptop') || message.includes('monitor') || message.includes('keyboard') || message.includes('mouse')) {
        let response = `🖥️ **Hardware Support:**

**Common Issues & Solutions:**

**Laptop/Computer Problems:**
- **Slow Performance**: Close unnecessary programs, run disk cleanup
- **Blue Screen**: Note error code, restart in safe mode
- **Won't Start**: Check power supply, try different outlet

**Peripherals:**
- **Mouse/Keyboard**: Try different USB port, test on another computer
- **Monitor**: Check cable connections, adjust resolution
- **Printer**: Check toner/ink, clear paper jams

**Hardware Request:**
- **New Equipment**: Submit through IT procurement process
- **Repairs**: Report fault with detailed description
- **Upgrades**: Request through manager approval

**Emergency Hardware:**
- Critical failure affecting work: Call IT emergency line
- Data loss: Stop using device immediately

Need immediate hardware assistance? I can create an urgent support ticket.`;

        // Add relevant KB articles
        if (kbResults && kbResults.length > 0) {
          const hardwareArticles = kbResults.filter((article: any) =>
            article.category === 'hardware' || article.tags?.includes('hardware')
          );
          if (hardwareArticles.length > 0) {
            response += '\n\n📚 **Related Knowledge Base Articles:**\n';
            hardwareArticles.slice(0, 2).forEach((article: any) => {
              response += `• [${article.title}](/kb/article/${article.id})\n`;
            });
          }
        }

        return response;
      }

      // If no specific self-service response but we have relevant KB articles, suggest them
      if (kbResults && kbResults.length > 0) {
        let response = `I found some relevant articles in our knowledge base that might help with your question:\n\n`;

        kbResults.slice(0, 3).forEach((article: any) => {
          response += `📄 **${article.title}**\n`;
          if (article.summary) {
            response += `${article.summary}\n`;
          }
          response += `[Read full article](/kb/article/${article.id})\n\n`;
        });

        response += `If these don't solve your issue, I can create a support ticket for you. Would you like me to do that?`;

        return response;
      }

      // Return null if no self-service response matches
      return null;
    } catch (error) {
      console.error('Error in self-service response:', error);
      // Fall back to basic self-service without KB integration
      return getBasicSelfServiceResponse(message);
    }
  };

  // Fallback basic self-service response without KB integration
  const getBasicSelfServiceResponse = (message: string): string | null => {
    // Password reset
    if (message.includes('password') && (message.includes('reset') || message.includes('forgot') || message.includes('change'))) {
      return `🔐 **Password Reset Instructions:**

1. Visit the POWERGRID Self-Service Portal: https://selfservice.powergrid.in
2. Click "Forgot Password" or "Reset Password"
3. Enter your employee ID and registered email
4. Follow the verification process
5. Create a new strong password (minimum 8 characters, include numbers and symbols)

If you don't have access to your registered email, please contact your manager or HR department.

Would you like me to create a ticket for additional assistance?`;
    }

    // VPN access
    if (message.includes('vpn') && (message.includes('connect') || message.includes('access') || message.includes('login'))) {
      return `🌐 **VPN Access Instructions:**

1. **Download Cisco AnyConnect** from the IT portal or contact IT support
2. **Server Address**: vpn.powergrid.in
3. **Username**: Your employee ID
4. **Authentication**: Use your domain password

**Troubleshooting:**
- Ensure you're connected to internet
- Try different DNS (8.8.8.8, 8.8.4.4)
- Clear browser cache and cookies
- Try incognito/private browsing mode

**Common Issues:**
- Password expired? Reset via self-service portal
- Account locked? Contact IT security team
- New user? Request VPN access through your manager

Need help with VPN setup? I can create a support ticket for you.`;
    }

    // Email access
    if (message.includes('email') && (message.includes('access') || message.includes('login') || message.includes('outlook'))) {
      return `📧 **Email Access Issues:**

**Web Access:**
- URL: https://mail.powergrid.in (OWA)
- Username: employee.id@powergrid.in
- Password: Your domain password

**Outlook Desktop:**
- Server: mail.powergrid.in
- Protocol: Exchange/Office 365

**Mobile Access:**
- Add account in native mail app
- Server: outlook.office365.com
- Use Office 365 authentication

**If you can't access:**
1. Reset password via self-service portal
2. Check if account is active with HR
3. Verify internet connection
4. Try different browser/device

Would you like me to escalate this to IT support?`;
    }

    // Network connectivity
    if (message.includes('internet') || message.includes('network') || message.includes('wifi') || message.includes('connection')) {
      return `📡 **Network Connectivity Issues:**

**Immediate Checks:**
1. **Restart your device** (computer/mobile)
2. **Check network cables** (if applicable)
3. **Switch between WiFi and Ethernet**
4. **Forget and reconnect to WiFi**
5. **Try different browser**

**WiFi Troubleshooting:**
- Network Name: POWERGRID-GUEST or POWERGRID-CORP
- Check signal strength
- Move closer to access point
- Avoid interference sources

**Advanced Steps:**
- Flush DNS: Run \`ipconfig /flushdns\` (Windows)
- Reset network: Settings > Network > Reset
- Check firewall/antivirus settings

**If persistent:**
- Contact IT support with your location
- Provide error messages or symptoms
- Note when the issue started

Shall I create a support ticket for network assistance?`;
    }

    // Software installation
    if (message.includes('install') || message.includes('software') || message.includes('application') || message.includes('program')) {
      return `💿 **Software Installation Request:**

**Standard Software Available:**
- Microsoft Office Suite
- Antivirus Software
- PDF Readers
- Web Browsers
- Communication Tools

**Request Process:**
1. **Check Software Catalog**: Visit IT portal for available software
2. **Submit Request**: Use the software request form
3. **Approval**: Manager approval may be required
4. **Installation**: IT team will install and configure

**Urgent Requirements:**
- Business-critical software: Contact your manager
- Temporary access: Request through IT helpdesk
- Cloud alternatives: Check if web-based versions exist

**Self-Installation:**
Some software can be installed from: \\\\software.powergrid.in

Would you like me to help you submit a software installation request?`;
    }

    // Hardware issues
    if (message.includes('computer') || message.includes('laptop') || message.includes('monitor') || message.includes('keyboard') || message.includes('mouse')) {
      return `🖥️ **Hardware Support:**

**Common Issues & Solutions:**

**Laptop/Computer Problems:**
- **Slow Performance**: Close unnecessary programs, run disk cleanup
- **Blue Screen**: Note error code, restart in safe mode
- **Won't Start**: Check power supply, try different outlet

**Peripherals:**
- **Mouse/Keyboard**: Try different USB port, test on another computer
- **Monitor**: Check cable connections, adjust resolution
- **Printer**: Check toner/ink, clear paper jams

**Hardware Request:**
- **New Equipment**: Submit through IT procurement process
- **Repairs**: Report fault with detailed description
- **Upgrades**: Request through manager approval

**Emergency Hardware:**
- Critical failure affecting work: Call IT emergency line
- Data loss: Stop using device immediately

Need immediate hardware assistance? I can create an urgent support ticket.`;
    }

    // Return null if no self-service response matches
    return null;
  };

  // Handle ticket confirmation
  const handleTicketConfirm = async (confirmed: boolean) => {
    if (!confirmed) {
      setShowTicketConfirm(false);
      setPendingTicketData(null);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'No problem! If you need help with anything else, feel free to ask.' }
      ]);
      return;
    }

    if (!pendingTicketData) return;

    try {
      setLoading(true);
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pendingTicketData.title,
          description: pendingTicketData.description,
          priority: pendingTicketData.priority || 'medium',
          category: pendingTicketData.category || 'general'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const ticketData = await response.json();
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `✅ **Ticket Created Successfully!**\n\n**Ticket ID:** ${ticketData.id}\n**Title:** ${ticketData.title}\n**Priority:** ${ticketData.priority}\n**Status:** ${ticketData.status}\n\nOur support team will review your ticket and get back to you soon. You can track the progress at: \`/tickets/${ticketData.id}\``
        }
      ]);
    } catch (error) {
      console.error('Ticket creation error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Ticket creation failed: ${errorMessage}` }
      ]);
    } finally {
      setLoading(false);
      setShowTicketConfirm(false);
      setPendingTicketData(null);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 btn-glow-primary flex items-center justify-center z-50 transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] glass-strong border border-glow-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-midnight-800 border-b border-glow-white p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-midnight-700 rounded-full flex items-center justify-center border border-glow-white/50">
                  <MessageSquare className="w-5 h-5 text-glow-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">NullTicket Support</h3>
                  <p className="text-xs text-midnight-300">AI-Powered Assistant</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-lg border ${
                    message.role === 'user'
                      ? 'bg-white text-midnight-900 rounded-br-none border-glow-white'
                      : 'bg-midnight-800 text-midnight-100 rounded-bl-none border-glow-white/50'
                  }`}>
                    {message.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-midnight-800 text-midnight-100 p-3 rounded-lg rounded-bl-none border border-glow-white/50">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-glow-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-glow-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-glow-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-glow-white/30">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="input-glow flex-1"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 btn-glow-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Confirmation Modal */}
      <AnimatePresence>
        {showTicketConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowTicketConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass border border-glow-white rounded-2xl p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Create Support Ticket</h3>
              <p className="text-midnight-200 mb-6">
                Based on your conversation, I can create a support ticket to help resolve this issue.
                Our team will review it and get back to you.
              </p>

              {pendingTicketData && (
                <div className="glass-strong rounded-lg p-4 mb-6 border border-glow-white/50">
                  <h4 className="font-semibold text-white mb-2">Ticket Details:</h4>
                  <p className="text-sm text-midnight-200">
                    <strong className="text-white">Title:</strong> {pendingTicketData.title}
                  </p>
                  <p className="text-sm text-midnight-200 mt-1">
                    <strong className="text-white">Description:</strong> {pendingTicketData.description}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => handleTicketConfirm(false)}
                  className="flex-1 px-4 py-2 bg-midnight-700 hover:bg-midnight-600 text-midnight-200 rounded-lg transition-colors border border-glow-white/30"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTicketConfirm(true)}
                  className="flex-1 px-4 py-2 btn-glow-primary"
                >
                  Create Ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
