"""
Knowledge Base service for self-service articles and AI suggestions
"""
import logging
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from ..models.ticket_models import KnowledgeArticle, KBSuggestion, Ticket, TicketCategory
from ..services.classification_service import classification_service

logger = logging.getLogger(__name__)

class KnowledgeBaseService:
    """
    Knowledge Base management and article recommendations
    """

    def __init__(self):
        pass

    def search_articles(
        self,
        db: Session,
        query: str,
        category: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        Search knowledge base articles by query and category
        """
        # Simple text search - in production, use full-text search
        search_term = f"%{query.lower()}%"

        q = db.query(KnowledgeArticle).filter(
            KnowledgeArticle.is_active == True,
            or_(
                KnowledgeArticle.title.ilike(search_term),
                KnowledgeArticle.content.ilike(search_term),
                KnowledgeArticle.summary.ilike(search_term)
            )
        )

        if category:
            q = q.filter(KnowledgeArticle.category == category)

        articles = q.order_by(
            KnowledgeArticle.view_count.desc(),
            KnowledgeArticle.helpful_count.desc()
        ).limit(limit).all()

        return [
            {
                "id": article.id,
                "title": article.title,
                "summary": article.summary,
                "category": article.category.value if article.category else None,
                "tags": article.tags,
                "view_count": article.view_count,
                "helpful_count": article.helpful_count,
                "created_at": article.created_at.isoformat() if article.created_at else None
            }
            for article in articles
        ]

    def get_article_by_id(self, db: Session, article_id: int) -> Optional[Dict]:
        """
        Get full article content by ID
        """
        article = db.query(KnowledgeArticle).filter(
            KnowledgeArticle.id == article_id,
            KnowledgeArticle.is_active == True
        ).first()

        if not article:
            return None

        # Increment view count
        article.view_count += 1
        db.commit()

        return {
            "id": article.id,
            "title": article.title,
            "content": article.content,
            "summary": article.summary,
            "category": article.category.value if article.category else None,
            "tags": article.tags,
            "keywords": article.keywords,
            "view_count": article.view_count,
            "helpful_count": article.helpful_count,
            "not_helpful_count": article.not_helpful_count,
            "resolution_count": article.resolution_count,
            "created_at": article.created_at.isoformat() if article.created_at else None,
            "updated_at": article.updated_at.isoformat() if article.updated_at else None
        }

    def rate_article(self, db: Session, article_id: int, helpful: bool) -> bool:
        """
        Rate article as helpful or not helpful
        """
        article = db.query(KnowledgeArticle).filter(
            KnowledgeArticle.id == article_id
        ).first()

        if not article:
            return False

        if helpful:
            article.helpful_count += 1
        else:
            article.not_helpful_count += 1

        db.commit()
        return True

    def suggest_articles_for_ticket(
        self,
        db: Session,
        ticket_title: str,
        ticket_description: str,
        category: Optional[str] = None
    ) -> List[Dict]:
        """
        Suggest relevant KB articles for a ticket
        """
        # Search for articles matching ticket content
        query = f"{ticket_title} {ticket_description}"
        articles = self.search_articles(db, query, category, limit=5)

        # Filter and rank by relevance
        relevant_articles = []
        ticket_text = (ticket_title + " " + ticket_description).lower()

        for article in articles:
            relevance_score = 0

            # Check keyword matches
            article_keywords = [kw.lower() for kw in (article.get("tags", []) + article.get("keywords", []))]
            for keyword in article_keywords:
                if keyword in ticket_text:
                    relevance_score += 1

            # Check category match
            if category and article.get("category") == category:
                relevance_score += 2

            if relevance_score > 0:
                article["relevance_score"] = relevance_score
                relevant_articles.append(article)

        # Sort by relevance and helpfulness
        relevant_articles.sort(
            key=lambda x: (x.get("relevance_score", 0), x.get("helpful_count", 0)),
            reverse=True
        )

        return relevant_articles[:3]  # Return top 3

    def create_article_from_ticket_pattern(
        self,
        db: Session,
        ticket_ids: List[int],
        suggested_title: str,
        category: str
    ) -> Optional[int]:
        """
        Create a new KB article from common ticket patterns
        """
        if not ticket_ids:
            return None

        # Get sample tickets
        tickets = db.query(Ticket).filter(Ticket.id.in_(ticket_ids)).limit(5).all()

        if not tickets:
            return None

        # Generate content from ticket patterns
        content_parts = []
        keywords = set()

        for ticket in tickets:
            content_parts.append(f"**Issue:** {ticket.title}")
            content_parts.append(f"**Description:** {ticket.description}")
            content_parts.append("")

            # Extract keywords from title and description
            text = f"{ticket.title} {ticket.description}".lower()
            # Simple keyword extraction - in production, use NLP
            words = text.split()
            keywords.update([word for word in words if len(word) > 3])

        content = "\n".join(content_parts)
        keywords_list = list(keywords)[:10]  # Limit to 10 keywords

        # Create article
        article = KnowledgeArticle(
            title=suggested_title,
            content=content,
            summary=f"Common solutions for {suggested_title.lower()}",
            category=category,
            keywords=keywords_list,
            tags=[category.lower(), "auto-generated"]
        )

        db.add(article)
        db.commit()
        db.refresh(article)

        logger.info(f"Created KB article '{suggested_title}' from {len(ticket_ids)} tickets")
        return article.id

    def analyze_ticket_patterns(self, db: Session) -> List[Dict]:
        """
        Analyze ticket patterns to suggest new KB articles
        """
        # Find frequent ticket patterns (simplified version)
        # Group tickets by similar titles/categories

        patterns = db.query(
            Ticket.category,
            func.count(Ticket.id).label('count'),
            func.group_concat(Ticket.title).label('titles')
        ).filter(
            Ticket.created_at >= func.date('now', '-30 days'),  # Last 30 days
            Ticket.category.isnot(None)
        ).group_by(
            Ticket.category
        ).having(
            func.count(Ticket.id) >= 5  # At least 5 tickets per pattern
        ).all()

        suggestions = []
        for category, count, titles in patterns:
            if count >= 5:  # Only suggest for patterns with 5+ tickets
                suggestion = {
                    "category": category.value,
                    "frequency": count,
                    "suggested_title": f"Common {category.value} Issues",
                    "reason": f"{count} tickets in {category.value} category suggest need for KB article"
                }
                suggestions.append(suggestion)

        return suggestions

    def get_popular_articles(self, db: Session, limit: int = 10) -> List[Dict]:
        """
        Get most popular/viewed KB articles
        """
        articles = db.query(KnowledgeArticle).filter(
            KnowledgeArticle.is_active == True
        ).order_by(
            KnowledgeArticle.view_count.desc(),
            KnowledgeArticle.helpful_count.desc()
        ).limit(limit).all()

        return [
            {
                "id": article.id,
                "title": article.title,
                "summary": article.summary,
                "category": article.category.value if article.category else None,
                "tags": article.tags,
                "view_count": article.view_count,
                "helpful_count": article.helpful_count,
                "created_at": article.created_at.isoformat() if article.created_at else None
            }
            for article in articles
        ]

    def create_article(
        self,
        db: Session,
        title: str,
        content: str,
        summary: Optional[str] = None,
        category: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> int:
        """
        Create a new knowledge base article manually
        """
        from ..models.ticket_models import TicketCategory

        # Convert category string to enum if provided
        category_enum = None
        if category:
            try:
                category_enum = TicketCategory(category)
            except ValueError:
                # If invalid category, default to None
                category_enum = None

        # Create article
        article = KnowledgeArticle(
            title=title,
            content=content,
            summary=summary,
            category=category_enum,
            tags=tags or [],
            keywords=[],  # Will be populated by AI later if needed
            view_count=0,
            helpful_count=0,
            not_helpful_count=0,
            resolution_count=0,
            is_active=True
        )

        db.add(article)
        db.commit()
        db.refresh(article)

        logger.info(f"Created KB article '{title}' manually")
        return article.id

# Global instance
kb_service = KnowledgeBaseService()