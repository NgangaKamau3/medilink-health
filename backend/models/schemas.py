from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    phone_number: str
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    national_id_number: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class PatientCreate(PatientBase):
    hospital_id: int
    gender_id: int

class Patient(PatientBase):
    patient_id: int
    hospital_id: int
    gender_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    hospital_id: Optional[int]
    department_id: Optional[int]
    roles: List[str]

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse

class PatientEncounter(BaseModel):
    encounter_id: Optional[int] = None
    patient_id: int
    doctor_id: int
    chief_complaint: Optional[str] = None
    diagnosis_description: Optional[str] = None
    treatment_plan: Optional[str] = None
    notes: Optional[str] = None
    encounter_date_time: datetime

class AuditLog(BaseModel):
    log_id: Optional[int] = None
    user_id: int
    action_type: str
    module: str
    table_name: Optional[str] = None
    record_id_affected: Optional[int] = None
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    ip_address: Optional[str] = None
    action_timestamp: datetime
    is_success: bool = True

class PatientSearch(BaseModel):
    query: str
    search_type: str  # 'id', 'name', 'phone', 'national_id'