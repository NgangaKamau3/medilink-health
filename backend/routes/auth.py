from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from models.schemas import UserLogin, TokenResponse, UserResponse
from database.connection import get_db_connection

auth_router = APIRouter()
security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable must be set")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@auth_router.post("/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin, request: Request, db=Depends(get_db_connection)):
    try:
        # Get user from database
        query = """
        SELECT u.user_id, u.username, u.password_hash, u.email, u.first_name, 
               u.last_name, u.hospital_id, u.department_id
        FROM users u 
        WHERE u.username = %s AND u.is_active = 1
        """
        user_result = db.execute_query(query, (user_credentials.username,))
        
        if not user_result:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user = user_result[0]
        
        # Verify password
        if not verify_password(user_credentials.password, user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get user roles
        roles_query = """
        SELECT r.role_name 
        FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.role_id 
        WHERE ur.user_id = %s
        """
        roles_result = db.execute_query(roles_query, (user['user_id'],))
        roles = [role['role_name'] for role in roles_result] if roles_result else []
        
        # Create access token
        access_token = create_access_token(data={"sub": user['user_id']})
        
        # Log successful login
        log_query = """
        INSERT INTO audit_logs (user_id, action_type, module, ip_address, action_timestamp, is_success)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        client_ip = request.client.host
        db.execute_insert(log_query, (
            user['user_id'], 'LOGIN', 'AUTH', client_ip, datetime.now(), True
        ))
        
        user_response = UserResponse(
            user_id=user['user_id'],
            username=user['username'],
            email=user['email'],
            first_name=user['first_name'],
            last_name=user['last_name'],
            hospital_id=user['hospital_id'],
            department_id=user['department_id'],
            roles=roles
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Authentication service error")

@auth_router.post("/logout")
async def logout(request: Request, user_id: int = Depends(lambda: 1)):  # Will be replaced with actual token verification
    # Log logout
    db = next(get_db_connection())
    log_query = """
    INSERT INTO audit_logs (user_id, action_type, module, ip_address, action_timestamp, is_success)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    client_ip = request.client.host
    db.execute_insert(log_query, (
        user_id, 'LOGOUT', 'AUTH', client_ip, datetime.now(), True
    ))
    
    return {"message": "Successfully logged out"}