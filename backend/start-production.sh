#!/bin/bash

# Production startup script for PharmD Consult Backend
# This script is used by Railway and other deployment platforms

set -e

echo "🚀 Starting PharmD Consult Backend in Production Mode"
echo "===================================================="

# Check if required environment variables are set
if [ -z "$SECRET_KEY" ]; then
    echo "⚠️  WARNING: SECRET_KEY not set. Using fallback."
    export SECRET_KEY="fallback-secret-key-change-immediately"
fi

# Set default port if not provided
if [ -z "$PORT" ]; then
    export PORT=8000
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads
chmod 755 uploads

# Run database migrations/initialization
echo "📊 Initializing database..."
python -c "from app.core.database import create_tables; create_tables()"

# Print startup information
echo "✅ Database initialized"
echo "🌐 Starting server on port $PORT"
echo "📚 API Documentation will be available at /docs"
echo "🏥 Health check available at /health"

# Start the server with production settings
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port $PORT \
    --workers 1 \
    --access-log \
    --log-level info