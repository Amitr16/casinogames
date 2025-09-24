# Render Deployment Guide

## Overview
This project is configured for deployment on Render with two services:
1. **Backend**: Python FastAPI application
2. **Frontend**: React static site

## Deployment Steps

### 1. Backend Service
- **Type**: Web Service
- **Environment**: Python 3.11
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check**: `/health`

**Environment Variables:**
```
DATABASE_URL=sqlite:///./casino.db
AUTH_HEADER=X-API-Key
CORS_ORIGINS=["https://casino-frontend.onrender.com"]
```

### 2. Frontend Service
- **Type**: Static Site
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `dist`

**Environment Variables:**
```
VITE_CASINO_API=https://casino-backend.onrender.com
```

## Manual Deployment

### Backend
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Select the `backend` folder as root directory
4. Use the build and start commands above
5. Set the environment variables

### Frontend
1. Create a new Static Site
2. Select the `frontend` folder as root directory
3. Use the build command above
4. Set the environment variables
5. Update the backend CORS_ORIGINS with the frontend URL

## Local Development
```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8888

# Frontend
cd frontend
npm install
npm run dev
```

## Production URLs
- Backend: `https://casino-backend.onrender.com`
- Frontend: `https://casino-frontend.onrender.com`
