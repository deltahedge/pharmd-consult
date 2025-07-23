# PharmD Consult 💊

A comprehensive medication reconciliation platform designed to streamline pharmaceutical consultations and improve patient safety through automated medication management and conflict detection.

## 🎯 Overview

PharmD Consult provides healthcare providers and pharmacists with tools to:
- Manage patient records and medication histories
- Perform comprehensive medication reconciliations
- Process medication images using OCR technology
- Detect medication conflicts and interactions
- Generate detailed consultation reports

## 🚀 Live Application

**Production Deployment (Render.com):**
- **Frontend**: https://pharmd-consult-frontend.onrender.com
- **Backend API**: https://pharmd-consult.onrender.com
- **API Documentation**: https://pharmd-consult.onrender.com/docs

**Local Development:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🏗️ Architecture

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 with custom components
- **State Management**: TanStack Query for server state
- **Routing**: React Router 7
- **Authentication**: JWT-based with context management
- **Icons**: Lucide React
- **Deployment**: Render Static Site

### Backend
- **Framework**: FastAPI 0.104.1 with Python
- **Database**: SQLAlchemy ORM with PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT tokens with bcrypt hashing
- **File Processing**: OCR with Tesseract and OpenCV
- **API Documentation**: Automatic OpenAPI/Swagger docs
- **Database Migrations**: Alembic
- **Deployment**: Render Web Service with Docker

## ✅ Current Features

### 🔐 Authentication System
- ✅ User registration for healthcare providers
- ✅ JWT-based login/logout
- ✅ Protected routes with automatic token refresh
- ✅ Professional details (license number, specialty, practice)

### 👥 Patient Management
- ✅ Complete CRUD operations for patient records
- ✅ Patient search and filtering
- ✅ Demographics management (name, DOB, contact info, MRN)
- ✅ Responsive table view with age calculation
- ✅ Real-time updates with optimistic UI

### 💊 Medication Management
- ✅ Medication CRUD operations
- ✅ Multiple data sources (photo, pharmacy, EMR, manual)
- ✅ NDC number tracking and validation
- ✅ Dosage and frequency management

### 🔍 Medication Reconciliation
- ✅ Step-by-step reconciliation workflow
- ✅ Conflict detection and resolution
- ✅ Provider approval system
- ✅ Reconciliation history tracking

### 📷 OCR & Image Processing
- ✅ Medication bottle/label OCR
- ✅ Image preprocessing and enhancement
- ✅ Confidence scoring for extracted text
- ✅ Manual correction interface

### 📊 Dashboard & Analytics
- ✅ Provider overview with key statistics
- ✅ Recent reconciliation summaries
- ✅ Interactive charts and visualizations
- ✅ Quick action cards for common tasks
- ✅ Responsive sidebar navigation

### 🛠️ API Infrastructure
- ✅ RESTful API with full OpenAPI documentation
- ✅ Comprehensive error handling
- ✅ Database migrations and seeding
- ✅ File upload capabilities
- ✅ CORS configuration for production
- ✅ Health check endpoints

## 🚀 Deployment

### Production Deployment (Render.com)

The application is deployed on Render.com's free tier:

**Backend Configuration:**
- Web Service with Docker
- PostgreSQL database automatically provisioned
- Environment variables configured
- Health checks enabled

**Frontend Configuration:**
- Static Site deployment
- SPA routing with `_redirects` file
- Environment variables for API URL
- Automatic deployments from GitHub

**Environment Variables:**

Backend:
```env
SECRET_KEY=production-secret-key
DATABASE_URL=${{DATABASE_URL}}
CORS_ORIGINS=["https://pharmd-consult-frontend.onrender.com"]
```

Frontend:
```env
VITE_API_URL=https://pharmd-consult.onrender.com
```

### Local Development Setup

#### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** (optional, defaults to SQLite)
- **WSL2** (recommended for Windows development)

#### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/deltahedge/pharmd-consult.git
cd pharmd-consult
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac/WSL
source venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Start Both Services (Recommended)**
```bash
# From project root
./start-dev.sh
```

### 🔧 Configuration

**Backend Environment Variables** (`.env`):
```env
DATABASE_URL=sqlite:///./pharmdconsult.db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000","http://localhost"]
```

**Frontend Configuration**:
- Development proxy automatically configured for `localhost:8000`
- PostCSS configured for modern Tailwind CSS support

## 📁 Project Structure

```
pharmd-consult/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   └── endpoints/  # Individual endpoint modules
│   │   ├── core/           # Configuration and database
│   │   ├── models/         # SQLAlchemy models
│   │   ├── services/       # Business logic (planned)
│   │   └── utils/          # Utility functions (planned)
│   ├── alembic/            # Database migrations
│   ├── Dockerfile          # Docker configuration
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Route components
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript definitions
│   ├── public/
│   │   └── _redirects      # SPA routing for deployment
│   ├── Dockerfile          # Docker configuration
│   └── package.json        # Node.js dependencies
├── docs/                   # Documentation
├── docker-compose.yml      # Local development
├── render.yaml            # Render Blueprint (optional)
├── deploy.sh              # Deployment script
├── test-docker.sh         # Docker testing script
└── start-dev.sh           # Development startup script
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Docker Testing
```bash
# Test Docker builds locally
./test-docker.sh
```

## 🔄 Deployment Pipeline

### Automatic Deployments
- **GitHub Integration**: Both services automatically deploy when changes are pushed to the main branch
- **Build Process**: TypeScript compilation, Docker builds, and database migrations handled automatically
- **Health Checks**: Automatic health monitoring and restart policies

### Manual Deployment
```bash
# Deploy to Render using CLI (optional)
./deploy.sh
```

## 🛠️ Next Steps & Roadmap

### 📈 Immediate Improvements
- [ ] Remove debug logging from production code
- [ ] Add comprehensive error boundary components
- [ ] Implement user profile management
- [ ] Add medication interaction checking APIs
- [ ] Enhanced OCR accuracy with better preprocessing

### 🔒 Security Enhancements
- [ ] Rate limiting on API endpoints
- [ ] Input validation middleware
- [ ] Audit logging for sensitive operations
- [ ] Two-factor authentication option

### 📊 Advanced Features
- [ ] Detailed reporting and analytics
- [ ] Export capabilities (PDF, CSV)
- [ ] Multi-provider/organization support
- [ ] Mobile app development
- [ ] Integration with external pharmacy systems

### 🏥 Clinical Features
- [ ] Drug interaction database integration
- [ ] Allergy checking and alerts
- [ ] Clinical decision support rules
- [ ] Integration with EMR systems
- [ ] Prescription verification workflows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Additional Documentation

- **[Patient Management Guide](docs/PATIENT_MANAGEMENT.md)** - Detailed patient management documentation
- **[Deployment Guide](README-DEPLOYMENT.md)** - Comprehensive deployment instructions
- **[Progress Log](README-PROGRESS.md)** - Development progress and milestones
- **[API Reference](https://pharmd-consult.onrender.com/docs)** - Interactive API documentation

## 🔗 Quick Links

- **Live Application**: https://pharmd-consult-frontend.onrender.com
- **API Documentation**: https://pharmd-consult.onrender.com/docs
- **GitHub Repository**: https://github.com/deltahedge/pharmd-consult
- **Issue Tracker**: https://github.com/deltahedge/pharmd-consult/issues

## 💻 Development Notes

### WSL2 Development
This application runs successfully on WSL2 (Windows Subsystem for Linux):
- All development servers work seamlessly in WSL
- Frontend accessible at `localhost:3000` from Windows browser
- Backend API accessible at `localhost:8000` from Windows browser
- Database file stored in WSL filesystem for optimal performance

### Docker Support
- Full Docker containerization for both services
- Docker Compose for local development
- Production-ready Docker builds
- Multi-stage builds for optimized images

### Database Management
- Alembic migrations for schema changes
- SQLite for local development
- PostgreSQL for production
- Automatic database provisioning on Render

---

## 🎯 Getting Started

1. **Try the Live Demo**: Visit https://pharmd-consult-frontend.onrender.com
2. **Register an Account**: Create a new healthcare provider account
3. **Explore Features**: Add patients, medications, and try the reconciliation workflow
4. **Development**: Clone the repo and follow the local setup instructions
5. **Deploy Your Own**: Fork the repository and deploy to Render using the provided configurations

**PharmD Consult** - Empowering healthcare providers with intelligent medication management solutions.