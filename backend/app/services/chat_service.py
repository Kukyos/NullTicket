"""
AI-powered chat service for conversational support
"""
import os
import requests
import logging
from typing import Dict, Optional, List
from ..config import settings

logger = logging.getLogger(__name__)

class ChatService:
    """
    Conversational AI chat service using LLaMA 3.1 via Groq
    """

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = settings.AI_MODEL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def chat(self, message: str, context: Optional[List[Dict]] = None) -> str:
        """
        Generate a conversational response to user message
        """
        if not self.api_key:
            return "I'm sorry, but the AI chat service is not configured. Please contact IT support."

        # Build conversation context
        messages = [
            {
                "role": "system",
                "content": """You are NullTicket, an intelligent IT support chatbot for POWERGRID corporation.

Your role is to provide helpful, accurate IT support while being friendly and professional. You should:

1. Answer IT-related questions about:
   - Password resets and account issues
   - Network and VPN connectivity
   - Hardware problems (computers, printers, etc.)
   - Software installation and troubleshooting
   - Email and Outlook issues
   - SAP system problems
   - General IT procedures

2. When you can solve the issue with instructions, provide clear step-by-step guidance

3. When the issue requires human intervention, politely explain that you'll create a support ticket

4. Always maintain a professional, helpful tone

5. If you're unsure about something, admit it and suggest creating a ticket

6. Keep responses concise but comprehensive

Remember: You're an AI assistant, not a replacement for human IT support staff."""
            }
        ]

        # Add conversation history if provided
        if context:
            messages.extend(context[-10:])  # Keep last 10 messages for context

        # Add current user message
        messages.append({
            "role": "user",
            "content": message
        })

        try:
            payload = {
                "model": self.model,
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7,
                "top_p": 0.9
            }

            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                ai_response = result["choices"][0]["message"]["content"].strip()

                # Clean up response
                ai_response = ai_response.replace("NullTicket:", "").strip()
                ai_response = ai_response.replace("AI Assistant:", "").strip()

                return ai_response
            else:
                logger.error(f"Groq API error: {response.status_code} - {response.text}")
                return "I'm experiencing technical difficulties. Please try again or create a support ticket."

        except Exception as e:
            logger.error(f"Chat service error: {e}")
            return "I'm having trouble connecting to the AI service. Please try again or create a support ticket."

# Global instance
chat_service = ChatService()