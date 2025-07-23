# PharmD Consult 💊

A comprehensive medication reconciliation platform designed to streamline pharmaceutical consultations and improve patient safety through automated medication management and conflict detection.

## 🎯 Overview

PharmD Consult provides healthcare providers and pharmacists with tools to:
- Manage patient records and medication histories
- Perform comprehensive medication reconciliations
- Process medication images using OCR technology
- Detect medication conflicts and interactions
- Generate detailed consultation reports

## 🚀 Live Demo

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🏗️ Architecture

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 with custom components
- **State Management**: TanStack Query for server state
- **Routing**: React Router 7
- **Authentication**: JWT-based with context management
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI 0.104.1 with Python
- **Database**: SQLAlchemy ORM with PostgreSQL support
- **Authentication**: JWT tokens with bcrypt hashing
- **File Processing**: OCR with Tesseract and OpenCV
- **API Documentation**: Automatic OpenAPI/Swagger docs
- **Database Migrations**: Alembic

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

### 📊 Dashboard
- ✅ Provider overview with key statistics
- ✅ Recent reconciliation summaries
- ✅ Quick action cards for common tasks
- ✅ Responsive sidebar navigation

### 🛠️ API Infrastructure
- ✅ RESTful API with full OpenAPI documentation
- ✅ Comprehensive error handling
- ✅ Database migrations and seeding
- ✅ File upload capabilities
- ✅ CORS configuration for development

## 🔄 Upcoming Features

### 💊 Medication Management
- [ ] Medication CRUD operations
- [ ] Multiple data sources (photo, pharmacy, EMR, manual)
- [ ] NDC number tracking and validation
- [ ] Dosage and frequency management

### 🔍 Medication Reconciliation
- [ ] Step-by-step reconciliation workflow
- [ ] Conflict detection and resolution
- [ ] Provider approval system
- [ ] Reconciliation history tracking

### 📷 OCR & Image Processing
- [ ] Medication bottle/label OCR
- [ ] Image preprocessing and enhancement
- [ ] Confidence scoring for extracted text
- [ ] Manual correction interface

### 📈 Advanced Features
- [ ] Medication interaction checking
- [ ] Reporting and analytics
- [ ] Export capabilities
- [ ] Multi-provider support

## 🛠️ Development Setup

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** (optional, defaults to SQLite)
- **WSL2** (Windows Subsystem for Linux) - Recommended for Windows development

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd pharmd-consult
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
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
│   │   └── services/       # Business logic
│   ├── alembic/            # Database migrations
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Route components
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript definitions
│   └── package.json        # Node.js dependencies
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

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head

# Frontend  
cd frontend
npm run build
npm run preview
```

### Environment Setup
- Set secure `SECRET_KEY` for JWT tokens
- Configure production database (PostgreSQL recommended)
- Set up proper CORS origins for production domain
- Configure file upload storage (local or cloud)

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
- **[API Reference](http://localhost:8000/docs)** - Interactive API documentation
- **[Frontend Components](frontend/src/components/)** - Reusable React components

## 🔗 Links

- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Database Admin**: SQLite browser or PostgreSQL admin tools

## 💻 WSL Development Notes

This application runs successfully on WSL2 (Windows Subsystem for Linux):
- All development servers work seamlessly in WSL
- Frontend accessible at `localhost:3000` from Windows browser
- Backend API accessible at `localhost:8000` from Windows browser
- Database file stored in WSL filesystem for optimal performance

---

**PharmD Consult** - Empowering healthcare providers with intelligent medication management solutions.