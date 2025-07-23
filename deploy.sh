#!/bin/bash

# PharmD Consult Production Deployment Script
# This script helps deploy the application to Railway

set -e

echo "🚀 PharmD Consult Deployment Script"
echo "====================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo "📦 Install it with: npm install -g @railway/cli"
    echo "🔗 Or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway first:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI is ready"

# Generate a secure secret key
echo "🔐 Generating secure secret key..."
SECRET_KEY=$(openssl rand -hex 32)
echo "Generated SECRET_KEY: $SECRET_KEY"

echo ""
echo "📋 Deployment Options:"
echo "1. Deploy Backend Only"
echo "2. Deploy Frontend Only" 
echo "3. Deploy Both (Recommended)"
echo ""

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        echo "🔧 Deploying Backend..."
        cd backend
        railway up --detach
        cd ..
        ;;
    2)
        echo "🎨 Deploying Frontend..."
        cd frontend  
        railway up --detach
        cd ..
        ;;
    3)
        echo "🚀 Deploying Both Services..."
        
        # Deploy backend first
        echo "1️⃣ Deploying Backend..."
        cd backend
        railway up --detach
        BACKEND_URL=$(railway status --json | grep -o '"url":"[^"]*' | cut -d'"' -f4)
        cd ..
        
        echo "Backend deployed to: $BACKEND_URL"
        
        # Update frontend environment with backend URL
        if [ ! -z "$BACKEND_URL" ]; then
            echo "🔗 Updating frontend API URL to: $BACKEND_URL"
            cd frontend
            echo "VITE_API_URL=$BACKEND_URL" > .env.railway
            railway up --detach
            cd ..
        else
            echo "⚠️  Could not determine backend URL. Deploying frontend with default settings."
            cd frontend
            railway up --detach
            cd ..
        fi
        ;;
    *)
        echo "❌ Invalid option. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🔗 Your applications should be available at:"
echo "   Backend: Check Railway dashboard for backend URL"
echo "   Frontend: Check Railway dashboard for frontend URL"
echo ""
echo "📊 To monitor your deployments:"
echo "   railway logs"
echo ""
echo "🎯 Don't forget to:"
echo "   1. Update CORS origins with your frontend URL"
echo "   2. Set up custom domains if needed"
echo "   3. Configure environment variables in Railway dashboard"
echo ""

# Save deployment info
echo "DEPLOYMENT_DATE=$(date)" > deployment.info
echo "SECRET_KEY=$SECRET_KEY" >> deployment.info
echo ""
echo "💾 Deployment info saved to deployment.info"
echo "🔒 Keep this file secure - it contains your secret key!"