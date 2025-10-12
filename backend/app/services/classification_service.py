"""
AI-powered ticket classification service using LLaMA 3.1
Classifies tickets into categories, assigns priority, and extracts intent
"""
import os
import requests
import logging
from typing import Dict, Optional
from ..config import settings

logger = logging.getLogger(__name__)

class TicketClassificationService:
    """
    Intelligent ticket classification using LLaMA 3.1 8B Instant via Groq
    """
    
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = settings.AI_MODEL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Classification prompt template
        self.classification_prompt = """You are an intelligent IT helpdesk ticket classifier. Analyze the following ticket and provide classification.

TICKET INFORMATION:
Title: {title}
Description: {description}
Source: {source}

YOUR TASK:
1. Categorize this ticket into ONE of these categories:
   - network: Network issues, VPN, WiFi, connectivity
   - hardware: Computer, printer, keyboard, mouse issues
   - software: Application errors, installation, licensing
   - password_reset: Password resets, account unlocks
   - access_request: System access, permissions, new accounts
   - sap_error: SAP system errors and issues
   - printer: Printer problems, print jobs
   - email: Email issues, Outlook problems
   - vpn: VPN connection issues
   - hr_query: HR-related questions
   - finance: Finance and accounting queries
   - general: General IT questions
   - other: Anything else

2. Assign priority (critical/urgent/high/medium/low) based on:
   - Business impact keywords: "down", "critical", "urgent", "can't work"
   - Scope: "all users", "department", "single user"
   - Time sensitivity: "asap", "immediately", "when possible"

3. Extract key information:
   - Main issue or request
   - Affected systems/applications
   - User impact level

RESPOND ONLY IN THIS JSON FORMAT (no markdown, no extra text):
{{
  "category": "category_name",
  "priority": "priority_level",
  "confidence": 0.95,
  "reasoning": "brief explanation",
  "keywords": ["keyword1", "keyword2"],
  "suggested_team": "team_name",
  "requires_immediate_attention": false,
  "self_service_possible": false
}}
"""
    
    def classify_ticket(
        self,
        title: str,
        description: str,
        source: str = "unknown"
    ) -> Dict:
        """
        Classify a ticket using AI
        
        Args:
            title: Ticket title
            description: Ticket description
            source: Source of the ticket (chat/email/etc)
            
        Returns:
            Classification result with category, priority, confidence, etc.
        """
        try:
            # Prepare prompt
            prompt = self.classification_prompt.format(
                title=title,
                description=description,
                source=source
            )
            
            # Call Groq API
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert IT ticket classifier. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3,  # Lower temperature for more consistent classification
                "max_tokens": 500
            }
            
            logger.info(f"Classifying ticket: '{title[:50]}...'")
            response = requests.post(
                self.base_url,
                json=payload,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                ai_response = data['choices'][0]['message']['content'].strip()
                
                # Parse JSON response
                import json
                try:
                    # Remove markdown code blocks if present
                    if ai_response.startswith("```"):
                        ai_response = ai_response.split("```")[1]
                        if ai_response.startswith("json"):
                            ai_response = ai_response[4:]
                    
                    classification = json.loads(ai_response)
                    logger.info(f"✅ Classified as: {classification.get('category')} (confidence: {classification.get('confidence')})")
                    return classification
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse AI response: {e}")
                    logger.error(f"Raw response: {ai_response}")
                    return self._fallback_classification(title, description)
            else:
                logger.error(f"Groq API error: {response.status_code} - {response.text}")
                return self._fallback_classification(title, description)
                
        except Exception as e:
            logger.error(f"Classification error: {e}")
            return self._fallback_classification(title, description)
    
    def _fallback_classification(self, title: str, description: str) -> Dict:
        """
        Simple keyword-based fallback classification
        """
        text = (title + " " + description).lower()
        
        # Keyword-based category detection
        category_keywords = {
            "network": ["network", "internet", "wifi", "ethernet", "connection", "dns", "ip"],
            "hardware": ["laptop", "computer", "printer", "keyboard", "mouse", "monitor", "hardware"],
            "software": ["application", "software", "program", "install", "license", "app"],
            "password_reset": ["password", "reset", "locked", "unlock", "forgot password"],
            "access_request": ["access", "permission", "account", "new user", "grant"],
            "sap_error": ["sap", "erp", "solman", "transaction code"],
            "vpn": ["vpn", "remote", "remote access"],
            "email": ["email", "outlook", "mailbox", "mail"],
            "printer": ["print", "printer", "printing"],
        }
        
        category = "general"
        confidence = 0.5
        
        for cat, keywords in category_keywords.items():
            if any(keyword in text for keyword in keywords):
                category = cat
                confidence = 0.6
                break
        
        # Priority detection
        priority = "medium"
        if any(word in text for word in ["critical", "down", "urgent", "emergency"]):
            priority = "high"
            confidence = 0.7
        elif any(word in text for word in ["asap", "immediately", "can't work"]):
            priority = "high"
        elif any(word in text for word in ["when possible", "low priority"]):
            priority = "low"
        
        return {
            "category": category,
            "priority": priority,
            "confidence": confidence,
            "reasoning": "Fallback keyword-based classification",
            "keywords": [],
            "suggested_team": "General Support",
            "requires_immediate_attention": priority in ["high", "critical"],
            "self_service_possible": False
        }
    
    def extract_intent(self, text: str) -> str:
        """
        Extract user intent from text
        """
        try:
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "Extract the main user intent in one concise sentence."
                    },
                    {
                        "role": "user",
                        "content": f"What does this user want?\n\n{text}"
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 100
            }
            
            response = requests.post(
                self.base_url,
                json=payload,
                headers=self.headers,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content'].strip()
            
        except Exception as e:
            logger.error(f"Intent extraction error: {e}")
        
        return "User needs assistance with their issue"
    
    def suggest_knowledge_base_article(
        self,
        category: str,
        title: str,
        description: str
    ) -> Optional[Dict]:
        """
        Suggest if this ticket pattern should become a KB article
        """
        # This would query the knowledge base and check if similar patterns exist
        # For now, return None (implement based on KB structure)
        return None

# Global instance
classification_service = TicketClassificationService()

# Module-level function for easy importing
async def classify_ticket(title: str, description: str, source: str = "unknown") -> Dict:
    """
    Convenience function to classify a ticket using the global service instance
    """
    return classification_service.classify_ticket(title, description, source)
