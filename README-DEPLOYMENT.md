# 🚀 PharmD Consult - Production Deployment Guide

## Quick Start

### Prerequisites
- [Railway CLI](https://docs.railway.app/develop/cli) installed
- Docker installed (for local testing)
- Git repository

### Option 1: One-Click Railway Deployment (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Deploy with our script**
   ```bash
   ./deploy.sh
   ```

### Option 2: Manual Railway Deployment

1. **Deploy Backend**
   ```bash
   cd backend
   railway login
   railway up
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   railway up
   ```

### Option 3: Local Docker Testing

1. **Test Docker builds**
   ```bash
   ./test-docker.sh
   ```

2. **Run locally with Docker Compose**
   ```bash
   docker compose up
   ```

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///./pharmdconsult.db
CORS_ORIGINS=["https://your-frontend-domain.com"]
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com
```

## Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend.railway.app/health`
- [ ] Frontend loads: `https://your-frontend.railway.app`
- [ ] API documentation: `https://your-backend.railway.app/docs`
- [ ] Authentication works
- [ ] Patient management works
- [ ] Medication upload works
- [ ] OCR processing works

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update `CORS_ORIGINS` in backend environment variables
   - Include your frontend domain

2. **Build Failures**
   - Check Railway build logs
   - Verify Dockerfile syntax
   - Check dependency versions

3. **Database Issues**
   - SQLite database is created automatically
   - For PostgreSQL, add `DATABASE_URL` environment variable

## Architecture

```
Frontend (React/TypeScript) → Backend (FastAPI/Python) → SQLite Database
     ↓                              ↓                        ↓
   Nginx                         Uvicorn                  File System
   Port 80                      Port 8000                   /app/
```

## Support

For issues with deployment:
1. Check Railway logs: `railway logs`
2. Check build status in Railway dashboard
3. Verify environment variables are set correctly

## Production Optimizations

- [ ] Set up custom domain
- [ ] Configure SSL/TLS
- [ ] Set up monitoring
- [ ] Configure database backups
- [ ] Set up error tracking
- [ ] Configure log aggregation