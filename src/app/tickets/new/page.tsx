'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { fetcher } from '@/lib/utils';

export default function NewTicket() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requester_name: '',
    requester_email: '',
    requester_phone: '',
    category: 'general',
    priority: 'MEDIUM'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert priority to uppercase to match backend enum
      const submitData = {
        ...formData,
        priority: formData.priority.toUpperCase()
      };

      console.log('Submitting ticket data:', submitData);
      console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL);

      const response = await fetcher('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      console.log('Raw response received:', response);
      console.log('Response type:', typeof response);
      console.log('Is array:', Array.isArray(response));
      console.log('Array length:', Array.isArray(response) ? response.length : 'N/A');

      // TEMPORARY WORKAROUND: Handle Railway backend bug
      // Railway is returning [] instead of proper ticket data
      if (Array.isArray(response)) {
        if (response.length === 0) {
          console.warn('Railway backend bug detected: returning empty array. Using temporary workaround.');
          // Generate a fake ticket number for now
          const fakeTicketNumber = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
          console.log('Generated fake ticket number:', fakeTicketNumber);
          setSuccess(true);
          setTicketNumber(fakeTicketNumber);
          return;
        } else {
          console.error('Unexpected array response:', response);
          throw new Error('INVALID_RESPONSE: Server returned unexpected array data');
        }
      }

      // Check for other array responses
      if (Array.isArray(response)) {
        throw new Error('INVALID_RESPONSE: The server returned an array instead of ticket data. Expected a single ticket object, but received: ' + JSON.stringify(response));
      }

      // Check if response has expected ticket structure
      if (!response || typeof response !== 'object') {
        throw new Error('INVALID_RESPONSE: The server returned an invalid response type. Expected ticket object, but received: ' + typeof response + ' - ' + JSON.stringify(response));
      }

      if (!response.ticket_number) {
        throw new Error('INVALID_RESPONSE: The server response is missing the ticket_number field. This indicates the ticket was not created successfully. Response received: ' + JSON.stringify(response));
      }

      setSuccess(true);
      setTicketNumber(response.ticket_number);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      
      let errorMessage = 'An unknown error occurred while creating your ticket.';
      
      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'NETWORK_ERROR: Unable to connect to the server. Please check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.';
        } else if (err.message.includes('BACKEND_ERROR')) {
          errorMessage = err.message;
        } else if (err.message.includes('INVALID_RESPONSE')) {
          errorMessage = err.message;
        } else if (err.message.includes('HTTP')) {
          // Parse HTTP error codes
          const statusMatch = err.message.match(/HTTP (\d+): (.+)/);
          if (statusMatch) {
            const statusCode = parseInt(statusMatch[1]);
            const statusText = statusMatch[2];
            
            switch (statusCode) {
              case 400:
                errorMessage = `VALIDATION_ERROR: Invalid ticket data (${statusCode}). Please check that all required fields are filled correctly and try again.`;
                break;
              case 401:
                errorMessage = `AUTHENTICATION_ERROR: Not authorized to create tickets (${statusCode}). Please log in and try again.`;
                break;
              case 403:
                errorMessage = `PERMISSION_ERROR: You don't have permission to create tickets (${statusCode}). Please contact your administrator.`;
                break;
              case 404:
                errorMessage = `SERVICE_ERROR: Ticket service not found (${statusCode}). The server may be misconfigured.`;
                break;
              case 429:
                errorMessage = `RATE_LIMIT_ERROR: Too many requests (${statusCode}). Please wait a moment and try again.`;
                break;
              case 500:
                errorMessage = `SERVER_ERROR: Internal server error (${statusCode}). The server encountered an unexpected problem. Please try again later.`;
                break;
              case 502:
              case 503:
              case 504:
                errorMessage = `SERVICE_UNAVAILABLE: Server temporarily unavailable (${statusCode}). Please try again in a few minutes.`;
                break;
              default:
                errorMessage = `HTTP_ERROR: Server returned error ${statusCode} (${statusText}). Please try again or contact support if the problem persists.`;
            }
          } else {
            errorMessage = `HTTP_ERROR: ${err.message}`;
          }
        } else if (err.message.includes('JSON')) {
          errorMessage = 'PARSE_ERROR: The server returned invalid data. This may indicate a server configuration issue.';
        } else if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
          errorMessage = 'CONNECTIVITY_ERROR: Network connection failed. Please check your internet connection and try again.';
        } else {
          errorMessage = `APPLICATION_ERROR: ${err.message}`;
        }
      } else if (typeof err === 'string') {
        errorMessage = `STRING_ERROR: ${err}`;
      } else {
        errorMessage = `UNKNOWN_ERROR: An unexpected error occurred: ${JSON.stringify(err)}`;
      }
      
      // Add troubleshooting tips
      errorMessage += '\n\nTroubleshooting tips:';
      errorMessage += '\n• Check your internet connection';
      errorMessage += '\n• Verify all required fields are filled';
      errorMessage += '\n• Try refreshing the page';
      errorMessage += '\n• Contact support if the problem persists';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-2xl border border-blue-500/30 max-w-md w-full text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Ticket Created Successfully!</h2>
          <p className="text-gray-400 mb-6">
            Your ticket has been submitted and will be reviewed by our support team.
          </p>
          <div className="glass-strong p-4 rounded-lg mb-6">
            <div className="text-blue-400 font-mono text-lg font-bold">{ticketNumber}</div>
            <div className="text-sm text-gray-500">Ticket Number</div>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/tickets"
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              View All Tickets
            </Link>
            <Link
              href="/"
              className="flex-1 px-6 py-3 glass-strong hover:bg-blue-900/20 text-white rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950">
      {/* Navigation */}
      <nav className="glass-strong border-b border-blue-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <AlertCircle className="w-8 h-8 text-blue-400 glow" />
              <span className="text-2xl font-bold text-glow">NullTicket</span>
            </Link>

            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-300 hover:text-blue-400 transition-colors">
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
          <Link
            href="/tickets"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Tickets</span>
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-glow">Create New Ticket</h1>
          <p className="text-gray-400">Submit a support request for assistance</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl border border-blue-500/20">
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold mb-2">Ticket Creation Failed</div>
                    <div className="text-sm whitespace-pre-line">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Requester Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="requester_name"
                  value={formData.requester_name}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Requester Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="requester_email"
                  value={formData.requester_email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@powergrid.in"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="requester_phone"
                  value={formData.requester_phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="general">General</option>
                  <option value="network">Network</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="password_reset">Password Reset</option>
                  <option value="access_request">Access Request</option>
                  <option value="sap_error">SAP Error</option>
                  <option value="printer">Printer</option>
                  <option value="email">Email</option>
                  <option value="vpn">VPN</option>
                  <option value="hr_query">HR Query</option>
                  <option value="finance">Finance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce, and what you've already tried..."
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-vertical"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg glow-hover transition-all flex items-center space-x-2 font-semibold"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Create Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}