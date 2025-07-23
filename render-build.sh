#!/bin/bash

# Render build script for PharmD Consult
# This script is used by Render to build the application

set -e

echo "🚀 Starting Render build process..."

# Check if we're building backend or frontend based on service name
if [[ "$RENDER_SERVICE_NAME" == *"backend"* ]]; then
    echo "📦 Building Backend Service..."
    cd backend
    pip install -r requirements.txt
    echo "✅ Backend dependencies installed"
elif [[ "$RENDER_SERVICE_NAME" == *"frontend"* ]]; then
    echo "🎨 Building Frontend Service..."
    cd frontend
    npm ci
    npm run build
    echo "✅ Frontend built successfully"
else
    echo "⚠️  Unknown service type, defaulting to backend build..."
    cd backend
    pip install -r requirements.txt
fi

echo "🎉 Build completed successfully!"