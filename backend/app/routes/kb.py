"""
Knowledge Base API endpoints
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..services.kb_service import kb_service

router = APIRouter()

# Pydantic models
class ArticleResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str]
    category: Optional[str]
    tags: List[str]
    view_count: int
    helpful_count: int
    created_at: str

class FullArticleResponse(BaseModel):
    id: int
    title: str
    content: str
    summary: Optional[str]
    category: Optional[str]
    tags: List[str]
    keywords: List[str]
    view_count: int
    helpful_count: int
    not_helpful_count: int
    resolution_count: int
    created_at: str
    updated_at: str

class RatingRequest(BaseModel):
    helpful: bool

class ArticleCreateRequest(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []

@router.get("/search", response_model=List[ArticleResponse])
async def search_articles(
    q: str = Query(..., description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Search knowledge base articles
    """
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query must be at least 2 characters")

    articles = kb_service.search_articles(db, q.strip(), category, limit)
    return articles

@router.get("/popular", response_model=List[ArticleResponse])
async def get_popular_articles(
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    Get most popular knowledge base articles
    """
    return kb_service.get_popular_articles(db, limit)

@router.get("/{article_id}", response_model=FullArticleResponse)
async def get_article(article_id: int, db: Session = Depends(get_db)):
    """
    Get full article content by ID
    """
    article = kb_service.get_article_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("/{article_id}/rate")
async def rate_article(
    article_id: int,
    rating: RatingRequest,
    db: Session = Depends(get_db)
):
    """
    Rate an article as helpful or not helpful
    """
    success = kb_service.rate_article(db, article_id, rating.helpful)
    if not success:
        raise HTTPException(status_code=404, detail="Article not found")

    return {"success": True, "message": "Rating recorded"}

@router.get("/suggest/{ticket_id}")
async def suggest_articles_for_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """
    Get article suggestions for a specific ticket
    """
    # Get ticket details
    from ..models.ticket_models import Ticket
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    suggestions = kb_service.suggest_articles_for_ticket(
        db,
        ticket.title,
        ticket.description,
        ticket.category.value if ticket.category else None
    )

    return {"suggestions": suggestions}

@router.get("/analytics/patterns")
async def get_ticket_patterns(db: Session = Depends(get_db)):
    """
    Analyze ticket patterns for KB article suggestions
    """
    patterns = kb_service.analyze_ticket_patterns(db)
    return {"patterns": patterns}

@router.post("/articles/create-from-pattern")
async def create_article_from_pattern(
    category: str,
    title: str,
    ticket_ids: List[int],
    db: Session = Depends(get_db)
):
    """
    Create a new KB article from ticket patterns
    """
    article_id = kb_service.create_article_from_ticket_pattern(
        db, ticket_ids, title, category
    )

    if not article_id:
        raise HTTPException(status_code=400, detail="Failed to create article")

    return {"success": True, "article_id": article_id}

@router.post("/articles", response_model=dict)
async def create_article(
    article: ArticleCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new knowledge base article
    """
    if not article.title or not article.content:
        raise HTTPException(status_code=400, detail="Title and content are required")

    article_id = kb_service.create_article(
        db,
        article.title,
        article.content,
        article.summary,
        article.category,
        article.tags
    )

    return {"success": True, "article_id": article_id, "message": "Article created successfully"}