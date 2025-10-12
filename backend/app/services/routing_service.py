"""
Intelligent routing service for ticket assignment
Routes tickets to appropriate teams based on rules, AI, and historical patterns
"""
import logging
from typing import Optional, Dict, List
from sqlalchemy.orm import Session
from ..models.ticket_models import (
    Ticket, Team, RoutingRule, TicketCategory, TicketPriority
)
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class RoutingService:
    """
    Intelligent ticket routing system
    """
    
    def __init__(self):
        self.default_team_name = "General Support"
    
    def route_ticket(
        self,
        db: Session,
        ticket: Ticket,
        classification: Dict
    ) -> Optional[Team]:
        """
        Route ticket to appropriate team using multiple strategies
        
        Routing priority:
        1. Exact rule match (category + keywords)
        2. Category-based rules
        3. Historical pattern learning
        4. Default team
        
        Args:
            db: Database session
            ticket: Ticket to route
            classification: AI classification result
            
        Returns:
            Assigned team or None
        """
        logger.info(f"Routing ticket #{ticket.ticket_number}")
        
        # Strategy 1: Try exact rule matching
        team = self._route_by_rules(db, ticket, classification)
        if team:
            logger.info(f"✅ Routed to {team.name} via rule matching")
            return team
        
        # Strategy 2: Category-based fallback
        team = self._route_by_category(db, ticket.category)
        if team:
            logger.info(f"✅ Routed to {team.name} via category")
            return team
        
        # Strategy 3: Historical pattern learning
        team = self._route_by_historical_patterns(db, ticket)
        if team:
            logger.info(f"✅ Routed to {team.name} via historical patterns")
            return team
        
        # Strategy 4: Load balancing among available teams
        team = self._route_by_load_balancing(db)
        if team:
            logger.info(f"✅ Routed to {team.name} via load balancing")
            return team
        
        # Final fallback: Default team
        team = self._get_default_team(db)
        logger.warning(f"⚠️ Using default team: {team.name if team else 'None'}")
        return team
    
    def _route_by_rules(
        self,
        db: Session,
        ticket: Ticket,
        classification: Dict
    ) -> Optional[Team]:
        """
        Route based on configured routing rules
        """
        # Get active rules ordered by priority
        rules = db.query(RoutingRule).filter(
            RoutingRule.is_active == True
        ).order_by(
            RoutingRule.order_priority.asc()
        ).all()
        
        ticket_text = (ticket.title + " " + ticket.description).lower()
        
        for rule in rules:
            # Check category match
            if rule.category and rule.category != ticket.category:
                continue
            
            # Check priority threshold
            if rule.priority_min:
                priority_order = ["low", "medium", "high", "urgent", "critical"]
                if priority_order.index(ticket.priority.value) < priority_order.index(rule.priority_min.value):
                    continue
            
            # Check source match
            if rule.source and rule.source != ticket.source:
                continue
            
            # Check keyword matching
            if rule.keywords:
                keyword_matches = sum(
                    1 for keyword in rule.keywords 
                    if keyword.lower() in ticket_text
                )
                match_ratio = keyword_matches / len(rule.keywords)
                
                if match_ratio >= rule.confidence_threshold:
                    team = db.query(Team).filter(
                        Team.id == rule.assigned_team_id,
                        Team.is_active == True
                    ).first()
                    
                    if team and self._has_capacity(team):
                        logger.info(f"Rule '{rule.name}' matched with {match_ratio:.2f} confidence")
                        return team
        
        return None
    
    def _route_by_category(
        self,
        db: Session,
        category: TicketCategory
    ) -> Optional[Team]:
        """
        Route based on team specialization in category
        """
        # Find teams specialized in this category
        teams = db.query(Team).filter(
            Team.is_active == True
        ).all()
        
        for team in teams:
            if team.specialization and category.value in team.specialization:
                if self._has_capacity(team):
                    return team
        
        return None
    
    def _route_by_historical_patterns(
        self,
        db: Session,
        ticket: Ticket
    ) -> Optional[Team]:
        """
        Route based on historical resolution patterns
        
        Finds teams that have successfully resolved similar tickets
        """
        # Find similar resolved tickets (same category, high satisfaction)
        similar_tickets = db.query(Ticket).filter(
            Ticket.category == ticket.category,
            Ticket.status.in_(["resolved", "closed"]),
            Ticket.satisfaction_rating >= 4,
            Ticket.assigned_team_id.isnot(None)
        ).order_by(
            Ticket.resolved_at.desc()
        ).limit(20).all()
        
        if not similar_tickets:
            return None
        
        # Count team performance
        team_scores = {}
        for similar_ticket in similar_tickets:
            team_id = similar_ticket.assigned_team_id
            if team_id not in team_scores:
                team_scores[team_id] = 0
            
            # Score based on resolution time and satisfaction
            score = similar_ticket.satisfaction_rating or 3
            if similar_ticket.resolution_time_minutes:
                # Bonus for fast resolution (< 4 hours)
                if similar_ticket.resolution_time_minutes < 240:
                    score += 1
            
            team_scores[team_id] += score
        
        # Get best performing team with capacity
        sorted_teams = sorted(
            team_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        for team_id, score in sorted_teams:
            team = db.query(Team).filter(
                Team.id == team_id,
                Team.is_active == True
            ).first()
            
            if team and self._has_capacity(team):
                logger.info(f"Historical pattern score: {score}")
                return team
        
        return None
    
    def _route_by_load_balancing(
        self,
        db: Session
    ) -> Optional[Team]:
        """
        Route to team with lowest current load
        """
        teams = db.query(Team).filter(
            Team.is_active == True
        ).order_by(
            Team.current_load.asc()
        ).all()
        
        for team in teams:
            if self._has_capacity(team):
                return team
        
        return None
    
    def _has_capacity(self, team: Team) -> bool:
        """
        Check if team has capacity for new tickets
        """
        return team.current_load < team.max_capacity
    
    def _get_default_team(self, db: Session) -> Optional[Team]:
        """
        Get default fallback team
        """
        return db.query(Team).filter(
            Team.name == self.default_team_name,
            Team.is_active == True
        ).first()
    
    def update_team_load(
        self,
        db: Session,
        team_id: int,
        increment: int = 1
    ):
        """
        Update team's current load
        """
        team = db.query(Team).filter(Team.id == team_id).first()
        if team:
            team.current_load = max(0, team.current_load + increment)
            db.commit()
            logger.info(f"Updated {team.name} load: {team.current_load}/{team.max_capacity}")
    
    def calculate_priority_score(
        self,
        classification: Dict,
        ticket_text: str
    ) -> int:
        """
        Calculate priority score for escalation and SLA
        
        Returns: Score from 1-10 (10 = most urgent)
        """
        score = 5  # Default medium priority
        
        # Base score from AI classification
        priority = classification.get("priority", "medium").lower()
        priority_scores = {
            "low": 2,
            "medium": 5,
            "high": 7,
            "urgent": 9,
            "critical": 10
        }
        score = priority_scores.get(priority, 5)
        
        # Boost for urgent keywords
        urgent_keywords = ["down", "critical", "can't work", "urgent", "emergency", "asap"]
        text_lower = ticket_text.lower()
        urgency_boost = sum(1 for keyword in urgent_keywords if keyword in text_lower)
        score = min(10, score + urgency_boost)
        
        # Boost for scope keywords
        if "all users" in text_lower or "entire department" in text_lower:
            score = min(10, score + 2)
        
        # Check if requires immediate attention (from AI)
        if classification.get("requires_immediate_attention", False):
            score = max(8, score)
        
        return score
    
    def suggest_new_routing_rule(
        self,
        db: Session,
        category: str,
        keywords: List[str],
        team_id: int,
        ticket_count: int = 10
    ) -> Dict:
        """
        Suggest a new routing rule based on patterns
        """
        return {
            "category": category,
            "keywords": keywords,
            "assigned_team_id": team_id,
            "confidence_threshold": 0.7,
            "reason": f"Observed {ticket_count} tickets with this pattern routed to this team",
            "suggested": True
        }

# Global instance
routing_service = RoutingService()
