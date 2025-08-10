# 🚀 Quick Start Guide

## One-Click Setup & Launch

### Windows Users
```bash
# Double-click or run in Command Prompt
setup.bat
```

### Linux/Mac Users
```bash
# Make executable and run
chmod +x setup.sh
./setup.sh
```

## What the Setup Script Does

1. **✅ Checks Prerequisites**
   - Verifies Python 3.8+ is installed
   - Verifies Node.js is installed

2. **📦 Installs Dependencies**
   - Backend: `pip install -r requirements.txt`
   - Frontend: `npm install`

3. **🗄️ Database Setup Reminder**
   - Prompts you to import hospital.sql schema
   - Reminds to import sample_data.sql for testing
   - Asks to configure database credentials

4. **🚀 Launches Both Servers**
   - Backend API: http://localhost:8000
   - Frontend App: http://localhost:3000

## Default Test Login
- **Username:** `dr.smith`
- **Password:** `password123`

## Manual Setup (if needed)

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 5.7+

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Database
1. Import `hospital.sql` (your existing schema)
2. Import `database/sample_data.sql` (test data)
3. Update `backend/database/connection.py` with your MySQL credentials

## Troubleshooting

**Port Already in Use:**
- Backend (8000): Change port in `backend/main.py`
- Frontend (3000): React will prompt for alternative port

**Database Connection:**
- Ensure MySQL is running
- Check credentials in `backend/database/connection.py`
- Verify database name is 'hospital'

**Dependencies Issues:**
- Update pip: `python -m pip install --upgrade pip`
- Clear npm cache: `npm cache clean --force`