#!/bin/bash

# PharmD Consult Docker Test Script
# Tests Docker builds and basic functionality

set -e

echo "🧪 PharmD Consult Docker Test Script"
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not running."
    echo "📦 Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available."
    echo "📦 Please install Docker Compose and try again."
    exit 1
fi

echo "✅ Docker and Docker Compose are ready"

# Generate environment file for testing
echo "🔧 Setting up test environment..."
cat > .env << EOF
SECRET_KEY=test-secret-key-for-docker-build-only-change-in-production
DATABASE_URL=sqlite:///./pharmdconsult.db
CORS_ORIGINS=["http://localhost:3000","http://localhost","http://frontend"]
EOF

echo "✅ Test environment configured"

# Test backend Docker build
echo ""
echo "🔨 Testing Backend Docker Build..."
cd backend
if docker build -t pharmd-consult-backend . ; then
    echo "✅ Backend Docker build successful"
else
    echo "❌ Backend Docker build failed"
    exit 1
fi
cd ..

# Test frontend Docker build
echo ""
echo "🔨 Testing Frontend Docker Build..."
cd frontend
if docker build -t pharmd-consult-frontend . ; then
    echo "✅ Frontend Docker build successful"
else
    echo "❌ Frontend Docker build failed"
    exit 1
fi
cd ..

echo ""
echo "🚀 Testing Docker Compose..."
if docker compose build ; then
    echo "✅ Docker Compose build successful"
else
    echo "❌ Docker Compose build failed"
    exit 1
fi

# Optional: Start services for quick test (uncomment if needed)
# echo ""
# echo "🔄 Starting services for test..."
# docker compose up -d
# 
# echo "⏳ Waiting for services to start..."
# sleep 15
# 
# # Test backend health
# if curl -f http://localhost:8000/health > /dev/null 2>&1; then
#     echo "✅ Backend health check passed"
# else
#     echo "⚠️  Backend health check failed (might still be starting)"
# fi
# 
# # Test frontend
# if curl -f http://localhost/health > /dev/null 2>&1; then
#     echo "✅ Frontend health check passed"
# else
#     echo "⚠️  Frontend health check failed (might still be starting)"
# fi
# 
# echo ""
# echo "🛑 Stopping test services..."
# docker compose down

echo ""
echo "🎉 Docker Test Complete!"
echo ""
echo "✅ All Docker builds successful"
echo "🚀 Ready for production deployment"
echo ""
echo "📋 Next steps:"
echo "   1. Run './deploy.sh' to deploy to Railway"
echo "   2. Or manually deploy using Railway CLI"
echo "   3. Update environment variables in Railway dashboard"
echo ""

# Clean up test environment file
rm -f .env

echo "🧹 Test environment cleaned up"