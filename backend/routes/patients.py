from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from models.schemas import Patient, PatientCreate, PatientSearch, PatientEncounter
from database.connection import get_db_connection
from datetime import datetime
import json

patients_router = APIRouter()

def log_audit(db, user_id: int, action: str, table: str, record_id: int, old_value: dict = None, new_value: dict = None, ip_address: str = None):
    try:
        query = """
        INSERT INTO audit_logs (user_id, action_type, module, table_name, record_id_affected, 
                               old_value, new_value, ip_address, action_timestamp, is_success)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        db.execute_insert(query, (
            user_id, action, 'PATIENTS', table, record_id,
            json.dumps(old_value) if old_value else None,
            json.dumps(new_value) if new_value else None,
            ip_address, datetime.now(), True
        ))
    except Exception as e:
        import logging
        logging.exception('Audit logging failed: %s', e)

@patients_router.post("/search")
async def search_patients(search_data: PatientSearch, request: Request, user_id: int = Depends(lambda: 1), db=Depends(get_db_connection)):
    try:
        base_query = """
        SELECT p.*, gender_lookup.value as gender, h.name as hospital_name
        FROM patients p
        LEFT JOIN enum_lookups gender_lookup ON p.gender_id = gender_lookup.lookup_id
        LEFT JOIN hospitals h ON p.hospital_id = h.hospital_id
        WHERE {condition} AND p.is_active = 1
        """
        
        search_conditions = {
            "id": ("p.patient_id = %s", (search_data.query,)),
            "national_id": ("p.national_id_number = %s", (search_data.query,)),
            "phone": ("p.phone_number LIKE %s", (f"%{search_data.query}%",)),
            "name": ("(p.first_name LIKE %s OR p.last_name LIKE %s)", (f"%{search_data.query}%", f"%{search_data.query}%"))
        }
        
        condition, params = search_conditions.get(search_data.search_type, search_conditions["name"])
        query = base_query.format(condition=condition)
        
        results = db.execute_query(query, params)
        
        # Log search action
        log_audit(db, user_id, 'SEARCH', 'patients', 0, 
                  old_value={"search_query": search_data.query, "search_type": search_data.search_type},
                  ip_address=request.client.host)
        
        return results or []
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred during patient search")

@patients_router.get("/{patient_id}")
async def get_patient(patient_id: int, request: Request, user_id: int = Depends(lambda: 1), db=Depends(get_db_connection)):
    try:
        query = """
        SELECT p.*, g.value as gender, h.name as hospital_name
        FROM patients p
        LEFT JOIN enum_lookups g ON p.gender_id = g.lookup_id
        LEFT JOIN hospitals h ON p.hospital_id = h.hospital_id
        WHERE p.patient_id = %s AND p.is_active = 1
        """
        result = db.execute_query(query, (patient_id,))
        
        if not result:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Log patient access
        log_audit(db, user_id, 'VIEW', 'patients', patient_id, ip_address=request.client.host)
        
        return result[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")

@patients_router.get("/{patient_id}/encounters")
async def get_patient_encounters(patient_id: int, request: Request, user_id: int = Depends(lambda: 1), db=Depends(get_db_connection)):
    try:
        query = """
        SELECT pe.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
        FROM patient_encounters pe
        LEFT JOIN users u ON pe.doctor_id = u.user_id
        WHERE pe.patient_id = %s
        ORDER BY pe.encounter_date_time DESC
        """
        results = db.execute_query(query, (patient_id,))
        
        # Log encounter access
        log_audit(db, user_id, 'VIEW_ENCOUNTERS', 'patient_encounters', patient_id, ip_address=request.client.host)
        
        return results or []
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")

@patients_router.put("/{patient_id}")
async def update_patient(patient_id: int, patient_data: dict, request: Request, user_id: int = Depends(lambda: 1), db=Depends(get_db_connection)):
    try:
        # Get current patient data for audit
        current_query = "SELECT * FROM patients WHERE patient_id = %s"
        current_data = db.execute_query(current_query, (patient_id,))
        
        if not current_data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        old_data = current_data[0]
        
        # Build update query dynamically
        update_fields = []
        params = []
        
        for field, value in patient_data.items():
            if field in ['first_name', 'last_name', 'phone_number', 'email', 'address', 'city']:
                update_fields.append(f"{field} = %s")
                params.append(value)
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        params.extend([user_id, patient_id])
        
        update_query = f"""
        UPDATE patients 
        SET {', '.join(update_fields)}, updated_by = %s, updated_at = NOW()
        WHERE patient_id = %s
        """
        
        db.execute_insert(update_query, tuple(params))
        
        # Log the update
        log_audit(db, user_id, 'UPDATE', 'patients', patient_id, 
                  old_value=dict(old_data), new_value=patient_data, ip_address=request.client.host)
        
        return {"message": "Patient updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")

@patients_router.post("/{patient_id}/encounters")
async def create_encounter(patient_id: int, encounter_data: PatientEncounter, request: Request, user_id: int = Depends(lambda: 1), db=Depends(get_db_connection)):
    try:
        # First create medical record if it doesn't exist
        record_query = "SELECT record_id FROM medical_records WHERE patient_id = %s"
        record_result = db.execute_query(record_query, (patient_id,))
        
        if not record_result:
            record_insert = """
            INSERT INTO medical_records (patient_id, created_by, created_at, updated_at)
            VALUES (%s, %s, NOW(), NOW())
            """
            record_id = db.execute_insert(record_insert, (patient_id, user_id))
        else:
            record_id = record_result[0]['record_id']
        
        # Create encounter
        encounter_query = """
        INSERT INTO patient_encounters (record_id, patient_id, doctor_id, chief_complaint, 
                                       diagnosis_description, treatment_plan, notes, 
                                       encounter_date_time, created_by, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        
        encounter_id = db.execute_insert(encounter_query, (
            record_id, patient_id, encounter_data.doctor_id, encounter_data.chief_complaint,
            encounter_data.diagnosis_description, encounter_data.treatment_plan, 
            encounter_data.notes, encounter_data.encounter_date_time, user_id
        ))
        
        # Log encounter creation
        log_audit(db, user_id, 'CREATE', 'patient_encounters', encounter_id, 
                  new_value=encounter_data.dict(), ip_address=request.client.host)
        
        return {"encounter_id": encounter_id, "message": "Encounter created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred")