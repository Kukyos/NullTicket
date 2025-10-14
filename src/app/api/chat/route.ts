import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if GROQ_API_KEY is set
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'GROQ_API_KEY environment variable is not configured' },
        { status: 500 }
      );
    }

    // System prompt for the chatbot
    const systemPrompt = `You are a helpful customer support chatbot for NullTicket, a ticketing system for POWERGRID employees.

Your role is to:
1. Provide helpful, accurate responses to user queries
2. Use the knowledge base when relevant
3. Detect when a user needs to create a support ticket (for technical issues, system problems, access requests, etc.)
4. If you detect a ticket should be created, respond with a special marker [TICKET_NEEDED] followed by structured ticket information

Guidelines:
- Be friendly and professional
- For common issues (password reset, VPN access, etc.), provide step-by-step instructions
- For complex technical issues, suggest creating a ticket
- For system outages, urgent issues, or anything requiring investigation, definitely suggest creating a ticket
- Always ask if the user wants to create a ticket when you detect it's needed
- Do not create tickets automatically - always get user confirmation first

When you think a ticket should be created, format your response like this:
[TICKET_NEEDED] I understand you're having trouble with [brief description]. Would you like me to create a support ticket for this issue?

Title: [Concise ticket title]
Priority: [high|medium|low]
Category: [appropriate category like hardware, software, network, access, etc.]

Otherwise, just provide a normal helpful response.`;

    // Prepare messages for Groq API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context.slice(-5), // Include last 5 messages for context
      { role: 'user', content: message }
    ];

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      console.error('Groq API error:', groqResponse.status, groqResponse.statusText);
      const errorText = await groqResponse.text();
      return NextResponse.json(
        { error: `Groq API error: ${groqResponse.status} ${groqResponse.statusText} - ${errorText}` },
        { status: groqResponse.status }
      );
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';

    // Check if AI suggests creating a ticket
    const needsTicket = aiResponse.includes('[TICKET_NEEDED]');
    const cleanResponse = aiResponse.replace('[TICKET_NEEDED]', '').trim();

    // Extract ticket details if needed
    let ticketDetails = null;
    if (needsTicket) {
      // Try to extract structured ticket info from the response
      const titleMatch = cleanResponse.match(/Title:\s*(.+?)(?:\n|$)/i);
      const priorityMatch = cleanResponse.match(/Priority:\s*(high|medium|low)/i);
      const categoryMatch = cleanResponse.match(/Category:\s*(.+?)(?:\n|$)/i);

      ticketDetails = {
        title: titleMatch ? titleMatch[1].trim() : message.substring(0, 100),
        description: `${message}\n\nAI Analysis: ${cleanResponse}`,
        priority: priorityMatch ? priorityMatch[1].toLowerCase() : 'medium',
        category: categoryMatch ? categoryMatch[1].trim() : 'general'
      };
    }

    return NextResponse.json({
      response: cleanResponse,
      needsTicket: needsTicket,
      ticketDetails: ticketDetails
    });

  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Chat API error: ${errorMessage}` },
      { status: 500 }
    );
  }
}