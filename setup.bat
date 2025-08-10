@echo off
echo ========================================
echo MediLink Health - Windows Setup
echo ========================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Setup Backend
echo.
echo [1/4] Setting up Backend...
cd backend
python -c "import fastapi, uvicorn, mysql.connector, pydantic, jwt, passlib, bcrypt" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing missing Python packages...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Python dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed, skipping...
)
cd ..

REM Setup Frontend
echo.
echo [2/4] Setting up Frontend...
cd frontend
if not exist "node_modules" (
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Node.js dependencies
        pause
        exit /b 1
    )
    call npm install i18next react-i18next --legacy-peer-deps
) else (
    echo Frontend dependencies already installed, skipping...
)
cd ..

REM Database setup prompt
echo.
echo [3/4] Database Setup Required
echo Please ensure MySQL is running and:
echo 1. Import your hospital.sql schema
echo 2. Import database/sample_data.sql for test data
echo 3. Update backend/database/connection.py with your DB credentials
echo.
pause

REM Get MySQL password
echo.
set /p DB_PASSWORD=Enter your MySQL root password: 

REM Launch applications
echo.
echo [4/4] Launching Applications...
echo Starting Backend Server...
cd backend
set SECRET_KEY=your-secret-key-here-change-in-production
set DB_HOST=localhost
set DB_USER=root
set DB_NAME=hospital
start /B python main.py
cd ..

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
cd frontend
start /B npm start
cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Default Login:
echo Username: dr.smith
echo Password: MediLink2024!
echo.
echo Press any key to exit...
pause >nul