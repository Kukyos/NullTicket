/**
 * NullChat Widget Embed Script
 * Embed this script on any website to add the NullTicket chatbot
 *
 * Usage:
 * <script src="https://your-domain.com/embed.js" data-api-url="https://your-api.com"></script>
 */

(function() {
  // Configuration from script tag data attributes
  const script = document.currentScript;
  const apiUrl = script?.getAttribute('data-api-url') || 'http://localhost:8000';
  const theme = script?.getAttribute('data-theme') || 'dark';
  const position = script?.getAttribute('data-position') || 'bottom-right';

  // Create container
  const container = document.createElement('div');
  container.id = 'nullchat-widget-container';
  container.style.cssText = `
    position: fixed;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Set position
  switch(position) {
    case 'bottom-left':
      container.style.bottom = '20px';
      container.style.left = '20px';
      break;
    case 'top-right':
      container.style.top = '20px';
      container.style.right = '20px';
      break;
    case 'top-left':
      container.style.top = '20px';
      container.style.left = '20px';
      break;
    default: // bottom-right
      container.style.bottom = '20px';
      container.style.right = '20px';
  }

  document.body.appendChild(container);

  // Widget HTML
  const widgetHTML = `
    <style>
      .nullchat-widget {
        width: 380px;
        height: 500px;
        background: ${theme === 'light' ? '#ffffff' : '#1a1a1a'};
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid ${theme === 'light' ? '#e0e0e0' : '#333'};
      }

      .nullchat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
        transition: all 0.3s ease;
        color: white;
        font-size: 24px;
      }

      .nullchat-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(59, 130, 246, 0.6);
      }

      .nullchat-header {
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        padding: 16px;
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .nullchat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .nullchat-message {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.4;
      }

      .nullchat-message.user {
        align-self: flex-end;
        background: #3b82f6;
        color: white;
        border-bottom-right-radius: 4px;
      }

      .nullchat-message.assistant {
        align-self: flex-start;
        background: ${theme === 'light' ? '#f3f4f6' : '#374151'};
        color: ${theme === 'light' ? '#111827' : '#f9fafb'};
        border-bottom-left-radius: 4px;
      }

      .nullchat-input-area {
        padding: 16px;
        border-top: 1px solid ${theme === 'light' ? '#e0e0e0' : '#333'};
        display: flex;
        gap: 8px;
      }

      .nullchat-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'};
        border-radius: 8px;
        background: ${theme === 'light' ? '#ffffff' : '#1f2937'};
        color: ${theme === 'light' ? '#111827' : '#f9fafb'};
        font-size: 14px;
      }

      .nullchat-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .nullchat-send {
        padding: 12px 16px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .nullchat-send:hover {
        background: #2563eb;
      }

      .nullchat-send:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }

      .nullchat-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        align-self: flex-start;
        background: ${theme === 'light' ? '#f3f4f6' : '#374151'};
        border-radius: 12px;
        border-bottom-left-radius: 4px;
      }

      .nullchat-dot {
        width: 6px;
        height: 6px;
        background: #9ca3af;
        border-radius: 50%;
        animation: nullchat-bounce 1.4s infinite ease-in-out;
      }

      .nullchat-dot:nth-child(2) { animation-delay: 0.16s; }
      .nullchat-dot:nth-child(3) { animation-delay: 0.32s; }

      @keyframes nullchat-bounce {
        0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }

      .nullchat-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        padding: 4px;
      }
    </style>

    <button class="nullchat-button" id="nullchat-toggle">
      💬
    </button>

    <div class="nullchat-widget" id="nullchat-widget">
      <div class="nullchat-header">
        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          🤖
        </div>
        <div>
          <div style="font-weight: bold; font-size: 16px;">NullTicket Support</div>
          <div style="font-size: 12px; opacity: 0.9;">AI-Powered Assistant</div>
        </div>
        <button class="nullchat-close" id="nullchat-close">×</button>
      </div>

      <div class="nullchat-messages" id="nullchat-messages">
        <div class="nullchat-message assistant">
          Hello! How can I help you today?
        </div>
      </div>

      <div class="nullchat-input-area">
        <input type="text" class="nullchat-input" id="nullchat-input" placeholder="Type your message..." />
        <button class="nullchat-send" id="nullchat-send">Send</button>
      </div>
    </div>
  `;

  container.innerHTML = widgetHTML;

  // Widget functionality
  let isOpen = false;
  let messages = [{ role: 'assistant', content: 'Hello! How can I help you today?' }];
  let isTyping = false;

  const toggle = document.getElementById('nullchat-toggle');
  const widget = document.getElementById('nullchat-widget');
  const close = document.getElementById('nullchat-close');
  const input = document.getElementById('nullchat-input');
  const send = document.getElementById('nullchat-send');
  const messagesContainer = document.getElementById('nullchat-messages');

  function toggleWidget() {
    isOpen = !isOpen;
    widget.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      input.focus();
    }
  }

  function addMessage(role, content) {
    messages.push({ role, content });
    renderMessages();
  }

  function renderMessages() {
    messagesContainer.innerHTML = messages.map(msg => `
      <div class="nullchat-message ${msg.role}">
        ${msg.content}
      </div>
    `).join('');

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    isTyping = true;
    messagesContainer.innerHTML += `
      <div class="nullchat-typing" id="nullchat-typing">
        <div class="nullchat-dot"></div>
        <div class="nullchat-dot"></div>
        <div class="nullchat-dot"></div>
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTyping() {
    isTyping = false;
    const typing = document.getElementById('nullchat-typing');
    if (typing) typing.remove();
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isTyping) return;

    input.value = '';
    addMessage('user', text);
    showTyping();

    try {
      // Try self-service response first
      const selfServiceResponse = await getSelfServiceResponse(text.toLowerCase());
      if (selfServiceResponse) {
        hideTyping();
        addMessage('assistant', selfServiceResponse);
        return;
      }

      // Try AI chat
      try {
        const response = await fetch(`${apiUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            context: messages.slice(-6)
          })
        });

        if (response.ok) {
          const data = await response.json();
          hideTyping();
          addMessage('assistant', data.response || 'I apologize, but I encountered an error. Please try again.');
          return;
        }
      } catch (e) {
        console.error('AI chat failed:', e);
      }

      // Fallback to ticket creation
      try {
        const response = await fetch(`${apiUrl}/api/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: text,
            description: `Chatbot query: ${text}`,
            requester_email: 'chatbot@nullticket.com',
            requester_name: 'Chatbot User'
          })
        });

        if (response.ok) {
          const data = await response.json();
          hideTyping();
          addMessage('assistant',
            data.ticket_number
              ? `I've created ticket ${data.ticket_number} for your issue. Our team will review it shortly.`
              : 'Thank you for your message. How else can I assist you?'
          );
          return;
        }
      } catch (e) {
        console.error('Ticket creation failed:', e);
      }

      // Final fallback
      hideTyping();
      addMessage('assistant', 'I apologize, but I\'m having trouble processing your request right now. Please try again later or contact support directly.');

    } catch (error) {
      console.error('Message send error:', error);
      hideTyping();
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  }

  // Self-service response logic (simplified version)
  async function getSelfServiceResponse(message) {
    // Password reset
    if (message.includes('password') && (message.includes('reset') || message.includes('forgot'))) {
      return `🔐 **Password Reset Instructions:**

1. Visit the POWERGRID Self-Service Portal: https://selfservice.powergrid.in
2. Click "Forgot Password" or "Reset Password"
3. Enter your employee ID and registered email
4. Follow the verification process

Would you like me to create a ticket for additional assistance?`;
    }

    // VPN access
    if (message.includes('vpn') && (message.includes('connect') || message.includes('access'))) {
      return `🌐 **VPN Access Instructions:**

1. Download Cisco AnyConnect from the IT portal
2. Server Address: vpn.powergrid.in
3. Username: Your employee ID

Need help with VPN setup? I can create a support ticket for you.`;
    }

    // Email access
    if (message.includes('email') && (message.includes('access') || message.includes('login'))) {
      return `📧 **Email Access:**
- Web: https://mail.powergrid.in
- Username: employee.id@powergrid.in

Would you like me to escalate this to IT support?`;
    }

    // Network issues
    if (message.includes('internet') || message.includes('network') || message.includes('wifi')) {
      return `📡 **Network Troubleshooting:**
1. Restart your device
2. Check network cables
3. Switch between WiFi and Ethernet

Shall I create a support ticket for network assistance?`;
    }

    return null;
  }

  // Event listeners
  toggle.addEventListener('click', toggleWidget);
  close.addEventListener('click', toggleWidget);
  send.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Initialize
  renderMessages();
})();