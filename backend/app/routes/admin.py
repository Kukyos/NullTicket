"""
Admin endpoints for system configuration and management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from ..database import get_db
from ..models.ticket_models import Team, RoutingRule, KnowledgeArticle, User

router = APIRouter()

# Placeholder for future admin functionality
class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    email: str
    max_capacity: int = 50
    specialization: List[str] = []

@router.get("/teams")
async def list_teams(db: Session = Depends(get_db)):
    """List all teams"""
    teams = db.query(Team).all()
    return {"teams": teams}

@router.post("/teams")
async def create_team(team_data: TeamCreate, db: Session = Depends(get_db)):
    """Create a new team"""
    team = Team(**team_data.dict())
    db.add(team)
    db.commit()
    db.refresh(team)
    return {"success": True, "team": team}

@router.get("/routing/rules")
async def list_routing_rules(db: Session = Depends(get_db)):
    """List all routing rules"""
    rules = db.query(RoutingRule).order_by(RoutingRule.order_priority).all()
    return {"rules": rules}

@router.get("/kb/articles")
async def list_kb_articles(db: Session = Depends(get_db)):
    """List knowledge base articles"""
    articles = db.query(KnowledgeArticle).filter(KnowledgeArticle.is_active == True).all()
    return {"articles": articles}
