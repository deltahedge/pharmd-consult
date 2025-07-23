#!/bin/bash

# Railway deployment script for WSL
# Run this after logging in on Windows

set -e

echo "🚀 PharmD Consult Railway Deployment"
echo "====================================="

# Create Railway projects using the Railway web dashboard approach
echo "📝 Deployment Instructions:"
echo ""
echo "1. Go to https://railway.app/dashboard"
echo "2. Click 'New Project'"
echo "3. Select 'Deploy from GitHub repo' or 'Empty Project'"
echo "4. If using GitHub, connect your repository"
echo "5. If using Empty Project, we'll deploy manually"
echo ""

echo "🔧 Manual Deployment Steps:"
echo ""
echo "Backend Deployment:"
echo "  1. Create new project: 'pharmd-consult-backend'"
echo "  2. In project settings, connect this repository"
echo "  3. Set root directory to: backend/"
echo "  4. Railway will auto-detect the Dockerfile"
echo "  5. Set environment variables:"
echo "     - SECRET_KEY=$(openssl rand -hex 32)"
echo "     - DATABASE_URL=\${{DATABASE_URL}} (Railway will provide)"
echo "     - CORS_ORIGINS=[\"https://your-frontend-url.railway.app\"]"
echo ""

echo "Frontend Deployment:"
echo "  1. Create new project: 'pharmd-consult-frontend'"  
echo "  2. Set root directory to: frontend/"
echo "  3. Set build command: npm run build"
echo "  4. Set start command: npm run preview"
echo "  5. Set environment variables:"
echo "     - VITE_API_URL=https://your-backend-url.railway.app"
echo ""

echo "🔗 Alternative: Use Railway CLI from Windows PowerShell"
echo "Run these commands in Windows PowerShell (not WSL):"
echo ""
echo "cd E:\\pharmd-consult\\pharmd-consult"
echo "railway init"
echo "# Follow prompts to create project"
echo ""
echo "# Deploy backend"
echo "cd backend"
echo "railway up"
echo ""
echo "# Deploy frontend"  
echo "cd ..\\frontend"
echo "railway up"
echo ""

echo "💡 If you encounter the node_modules error:"
echo "  1. Delete frontend/node_modules"
echo "  2. Run: npm install --no-optional"
echo "  3. Or use yarn instead: yarn install"
echo ""

echo "✅ After deployment, update CORS_ORIGINS in backend with frontend URL"
echo "✅ Update VITE_API_URL in frontend with backend URL"