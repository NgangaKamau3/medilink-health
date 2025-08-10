#!/bin/bash

echo "========================================"
echo "MediLink Health - Automated Setup"
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from https://python.org"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Setup Backend
echo
echo "[1/4] Setting up Backend..."
cd backend
python3 -c "import fastapi, uvicorn, mysql.connector, pydantic, jwt, passlib, bcrypt" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Installing missing Python packages..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install Python dependencies"
        exit 1
    fi
else
    echo "Backend dependencies already installed, skipping..."
fi
cd ..

# Setup Frontend
echo
echo "[2/4] Setting up Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install Node.js dependencies"
        exit 1
    fi
    npm install i18next react-i18next --legacy-peer-deps
else
    echo "Frontend dependencies already installed, skipping..."
fi
cd ..

# Database setup prompt
echo
echo "[3/4] Database Setup Required"
echo "Please ensure MySQL is running and:"
echo "1. Import your hospital.sql schema"
echo "2. Import database/sample_data.sql for test data"
echo "3. Update backend/database/connection.py with your DB credentials"
echo
read -p "Press Enter when database setup is complete..."

# Get MySQL password
echo
echo "Enter your MySQL root password:"
read -s DB_PASSWORD

# Launch applications
echo
echo "[4/4] Launching Applications..."
echo "Starting Backend Server..."
cd backend
export SECRET_KEY="your-secret-key-here-change-in-production"
export DB_HOST="localhost"
export DB_USER="root"
export DB_PASSWORD="$DB_PASSWORD"
export DB_NAME="hospital"
python3 main.py &
BACKEND_PID=$!
cd ..

sleep 3

echo "Starting Frontend Server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo
echo "Default Login:"
echo "Username: dr.smith"
echo "Password: MediLink2024!"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait