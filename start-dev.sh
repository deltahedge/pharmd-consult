#!/bin/bash

# PharmD Consult Development Server Startup Script
echo "🚀 Starting PharmD Consult Development Environment"
echo "=================================================="

# Start backend API server in background
echo "📡 Starting Backend API Server (Port 8000)..."
cd backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend development server in background  
echo "🌐 Starting Frontend Development Server (Port 3000)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Display running servers
echo ""
echo "✅ Development Environment Ready!"
echo "================================="
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo "🌐 Frontend App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Function to kill all processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Set trap to cleanup on script termination
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait