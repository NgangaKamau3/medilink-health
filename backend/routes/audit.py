from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from datetime import datetime, date
from database.connection import get_db_connection

audit_router = APIRouter()

@audit_router.get("/logs")
async def get_audit_logs(
    patient_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    action_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    current_user_id: int = Depends(lambda: 1),
    db=Depends(get_db_connection)
):
    """Get audit logs with filtering options"""
    
    base_query = """
    SELECT al.*, u.first_name, u.last_name, u.username
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.user_id
    WHERE 1=1
    """
    
    params = []
    conditions = []
    
    if patient_id and patient_id.strip():
        conditions.append("al.record_id_affected = %s AND al.table_name = 'patients'")
        params.append(int(patient_id))
    
    if user_id and user_id.strip():
        conditions.append("al.user_id = %s")
        params.append(int(user_id))
    
    if action_type and action_type.strip():
        conditions.append("al.action_type = %s")
        params.append(action_type)
    
    if start_date and start_date.strip():
        conditions.append("DATE(al.action_timestamp) >= %s")
        params.append(start_date)
    
    if end_date and end_date.strip():
        conditions.append("DATE(al.action_timestamp) <= %s")
        params.append(end_date)
    
    if conditions:
        base_query += " AND " + " AND ".join(conditions)
    
    base_query += " ORDER BY al.action_timestamp DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    results = db.execute_query(base_query, tuple(params))
    
    return results or []

@audit_router.get("/patient/{patient_id}/history")
async def get_patient_edit_history(
    patient_id: int,
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    current_user_id: int = Depends(lambda: 1),
    db=Depends(get_db_connection)
):
    """Get edit history for a specific patient with pagination"""
    try:
        query = """
        SELECT al.*, u.first_name, u.last_name, u.username
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.user_id
        WHERE al.record_id_affected = %s 
        AND al.table_name IN ('patients', 'patient_encounters', 'medical_records')
        ORDER BY al.action_timestamp DESC
        LIMIT %s OFFSET %s
        """
        
        results = db.execute_query(query, (patient_id, limit, offset))
        
        return results or []
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")

@audit_router.get("/user/{user_id}/activity")
async def get_user_activity(
    user_id: int,
    days: int = Query(30, le=90),
    current_user_id: int = Depends(lambda: 1),
    db=Depends(get_db_connection)
):
    """Get user activity for the specified number of days"""
    
    query = """
    SELECT al.*, u.first_name, u.last_name
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.user_id
    WHERE al.user_id = %s 
    AND al.action_timestamp >= DATE_SUB(NOW(), INTERVAL %s DAY)
    ORDER BY al.action_timestamp DESC
    """
    
    results = db.execute_query(query, (user_id, days))
    
    return results or []

@audit_router.get("/summary")
async def get_audit_summary(
    current_user_id: int = Depends(lambda: 1),
    db=Depends(get_db_connection)
):
    """Get audit summary statistics"""
    try:
        # Get today's activity
        today_query = """
        SELECT action_type, COUNT(*) as count
        FROM audit_logs
        WHERE DATE(action_timestamp) = CURDATE()
        GROUP BY action_type
        """
        
        # Get this week's activity
        week_query = """
        SELECT action_type, COUNT(*) as count
        FROM audit_logs
        WHERE action_timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY action_type
        """
        
        # Get most active users
        users_query = """
        SELECT u.first_name, u.last_name, u.username, COUNT(*) as activity_count
        FROM audit_logs al
        JOIN users u ON al.user_id = u.user_id
        WHERE al.action_timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY al.user_id
        ORDER BY activity_count DESC
        LIMIT 10
        """
        
        today_stats = db.execute_query(today_query)
        week_stats = db.execute_query(week_query)
        active_users = db.execute_query(users_query)
        
        return {
            "today_activity": today_stats or [],
            "week_activity": week_stats or [],
            "most_active_users": active_users or []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")