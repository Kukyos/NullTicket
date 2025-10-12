"""
Analytics and reporting endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional

from ..database import get_db
from ..models.ticket_models import Ticket, TicketSource, TicketStatus

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Get dashboard overview metrics
    """
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Total tickets
    total_tickets = db.query(Ticket).count()
    today_tickets = db.query(Ticket).filter(Ticket.created_at >= today).count()
    week_tickets = db.query(Ticket).filter(Ticket.created_at >= week_ago).count()
    month_tickets = db.query(Ticket).filter(Ticket.created_at >= month_ago).count()
    
    # Status breakdown
    status_counts = db.query(
        Ticket.status,
        func.count(Ticket.id)
    ).group_by(Ticket.status).all()
    
    # Source breakdown
    source_counts = db.query(
        Ticket.source,
        func.count(Ticket.id)
    ).group_by(Ticket.source).all()
    
    # Priority breakdown
    priority_counts = db.query(
        Ticket.priority,
        func.count(Ticket.id)
    ).group_by(Ticket.priority).all()
    
    # Category breakdown
    category_counts = db.query(
        Ticket.category,
        func.count(Ticket.id)
    ).group_by(Ticket.category).all()
    
    # Average resolution time
    avg_resolution = db.query(
        func.avg(Ticket.resolution_time_minutes)
    ).filter(Ticket.resolution_time_minutes.isnot(None)).scalar()
    
    # Satisfaction rating
    avg_satisfaction = db.query(
        func.avg(Ticket.satisfaction_rating)
    ).filter(Ticket.satisfaction_rating.isnot(None)).scalar()
    
    # SLA compliance
    total_resolved = db.query(Ticket).filter(
        Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED])
    ).count()
    sla_breached = db.query(Ticket).filter(
        Ticket.sla_breached == True
    ).count()
    
    return {
        "totals": {
            "all_time": total_tickets,
            "today": today_tickets,
            "this_week": week_tickets,
            "this_month": month_tickets
        },
        "status_breakdown": {
            status.value: count for status, count in status_counts
        },
        "source_breakdown": {
            source.value: count for source, count in source_counts
        },
        "priority_breakdown": {
            priority.value: count for priority, count in priority_counts
        },
        "category_breakdown": {
            category.value: count for category, count in category_counts
        },
        "performance": {
            "avg_resolution_minutes": round(avg_resolution, 2) if avg_resolution else 0,
            "avg_satisfaction_rating": round(avg_satisfaction, 2) if avg_satisfaction else 0,
            "sla_compliance_rate": round((1 - (sla_breached / max(total_resolved, 1))) * 100, 2)
        }
    }

@router.get("/tickets/trend")
async def get_ticket_trend(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Get daily ticket creation trend
    """
    from datetime import date
    
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days)
    
    # Get tickets grouped by date
    tickets_by_date = db.query(
        func.date(Ticket.created_at).label('date'),
        func.count(Ticket.id).label('count')
    ).filter(
        Ticket.created_at >= start_date
    ).group_by(
        func.date(Ticket.created_at)
    ).all()
    
    # Fill in missing dates with 0
    result = {}
    current_date = start_date
    while current_date <= today:
        result[str(current_date)] = 0
        current_date += timedelta(days=1)
    
    for date_obj, count in tickets_by_date:
        result[str(date_obj)] = count
    
    return {
        "period": f"Last {days} days",
        "data": [
            {"date": date_str, "count": count}
            for date_str, count in sorted(result.items())
        ]
    }

@router.get("/teams/performance")
async def get_team_performance(db: Session = Depends(get_db)):
    """
    Get team performance metrics
    """
    from ..models.ticket_models import Team
    
    teams = db.query(Team).filter(Team.is_active == True).all()
    
    performance = []
    for team in teams:
        # Get team's tickets
        tickets = db.query(Ticket).filter(Ticket.assigned_team_id == team.id).all()
        
        if not tickets:
            performance.append({
                "team_name": team.name,
                "total_tickets": 0,
                "resolved_tickets": 0,
                "avg_resolution_time": 0,
                "avg_satisfaction": 0,
                "current_load": team.current_load,
                "capacity": team.max_capacity
            })
            continue
        
        resolved_tickets = [t for t in tickets if t.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]]
        
        avg_resolution = 0
        if resolved_tickets:
            resolution_times = [t.resolution_time_minutes for t in resolved_tickets if t.resolution_time_minutes]
            if resolution_times:
                avg_resolution = sum(resolution_times) / len(resolution_times)
        
        avg_satisfaction = 0
        rated_tickets = [t for t in tickets if t.satisfaction_rating]
        if rated_tickets:
            avg_satisfaction = sum(t.satisfaction_rating for t in rated_tickets) / len(rated_tickets)
        
        performance.append({
            "team_name": team.name,
            "total_tickets": len(tickets),
            "resolved_tickets": len(resolved_tickets),
            "resolution_rate": round((len(resolved_tickets) / len(tickets)) * 100, 2) if tickets else 0,
            "avg_resolution_time_minutes": round(avg_resolution, 2),
            "avg_satisfaction": round(avg_satisfaction, 2),
            "current_load": team.current_load,
            "capacity": team.max_capacity,
            "utilization": round((team.current_load / team.max_capacity) * 100, 2) if team.max_capacity > 0 else 0
        })
    
    return {"teams": performance}

@router.get("/satisfaction")
async def get_satisfaction_stats(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Get satisfaction rating statistics
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get all rated tickets
    rated_tickets = db.query(Ticket).filter(
        Ticket.satisfaction_rating.isnot(None),
        Ticket.created_at >= start_date
    ).all()
    
    if not rated_tickets:
        return {
            "total_ratings": 0,
            "average": 0,
            "distribution": {}
        }
    
    # Calculate distribution
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for ticket in rated_tickets:
        distribution[ticket.satisfaction_rating] = distribution.get(ticket.satisfaction_rating, 0) + 1
    
    avg_rating = sum(t.satisfaction_rating for t in rated_tickets) / len(rated_tickets)
    
    return {
        "total_ratings": len(rated_tickets),
        "average": round(avg_rating, 2),
        "distribution": distribution,
        "satisfaction_rate": round((sum(distribution[4] + distribution[5]) / len(rated_tickets)) * 100, 2)
    }
