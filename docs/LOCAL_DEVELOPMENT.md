# 💻 Local Development Guide

Panduan lengkap untuk setup dan development AegisOps di local environment.

## 📋 Prerequisites

Pastikan sudah terinstall:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **Docker** & Docker Compose ([Download](https://www.docker.com/))
- **PostgreSQL** 16 (optional, bisa pakai Docker)
- **Git** ([Download](https://git-scm.com/))

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/HilmiKhaidarN/Could-Computing.git
cd Could-Computing/aegisops
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan:

```env
# Database
DATABASE_USER=aegisops
DATABASE_PASSWORD=aegisops_dev
DATABASE_NAME=aegisops_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_URL=postgresql://aegisops:aegisops_dev@localhost:5432/aegisops_db

# JWT
JWT_SECRET=dev_secret_key_change_in_production

# Services
ML_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:4000

# Ports
BACKEND_PORT=4000
APP_PORT=3000
ML_SERVICE_PORT=8000
```

### 3. Start with Docker Compose (Recommended)

```bash
docker-compose up -d
```

Ini akan start:
- ✅ PostgreSQL database
- ✅ Backend API (NestJS)
- ✅ Frontend (Next.js)
- ✅ ML Service (FastAPI)

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- ML Service: http://localhost:8000
- API Docs: http://localhost:4000/api/docs

### 4. Run Migrations

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
```

### 5. Seed Database (Optional)

```bash
npx prisma db seed
```

## 🛠️ Development Mode

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start dev server with hot reload
npm run start:dev

# Backend akan berjalan di http://localhost:4000
```

#### Backend Commands

```bash
npm run start:dev      # Development mode dengan hot reload
npm run build          # Build untuk production
npm run start          # Start production build
npm run lint           # Lint code
npm run test           # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npx prisma studio      # Open Prisma Studio (database GUI)
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Frontend akan berjalan di http://localhost:3000
```

#### Frontend Commands

```bash
npm run dev            # Development mode dengan hot reload
npm run build          # Build untuk production
npm run start          # Start production build
npm run lint           # Lint code
npm run type-check     # TypeScript type checking
```

### ML Service Development

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start dev server
uvicorn app:app --reload --port 8000

# ML Service akan berjalan di http://localhost:8000
```

#### ML Service Commands

```bash
uvicorn app:app --reload --port 8000    # Development mode
python -m pytest tests/ -v              # Run tests
python -m pytest tests/ --cov=.         # Run tests with coverage
```

## 🗄️ Database Management

### Using Prisma Studio

GUI untuk manage database:

```bash
cd backend
npx prisma studio
```

Access di http://localhost:5555

### Create Migration

```bash
cd backend
npx prisma migrate dev --name migration_name
```

### Reset Database

```bash
npx prisma migrate reset
```

### Seed Database

```bash
npx prisma db seed
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:cov

# Specific test file
npm test -- auth.service.spec.ts
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Watch mode
npm test -- --watch

# Type check
npm run type-check
```

### ML Service Tests

```bash
cd ml-service

# Run all tests
pytest tests/ -v

# With coverage
pytest tests/ -v --cov=. --cov-report=html

# Specific test file
pytest tests/test_predictor.py -v
```

### Integration Tests

```bash
# Start all services
docker-compose up -d

# Wait for services to be ready
sleep 10

# Test backend health
curl http://localhost:4000/health

# Test ML service health
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000
```

## 🐛 Debugging

### Backend Debugging (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

### Frontend Debugging

Next.js sudah support debugging out of the box. Gunakan browser DevTools.

### ML Service Debugging

```bash
# Run with debugger
python -m debugpy --listen 5678 --wait-for-client -m uvicorn app:app --reload
```

## 📊 Monitoring & Logs

### View Docker Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ml-service
docker-compose logs -f postgres
```

### Backend Logs

Logs akan muncul di console saat development mode.

### Database Logs

```bash
docker-compose logs -f postgres
```

## 🔧 Common Issues & Solutions

### Port Already in Use

```bash
# Find process using port
# Windows:
netstat -ano | findstr :4000

# macOS/Linux:
lsof -i :4000

# Kill process
# Windows:
taskkill /PID <PID> /F

# macOS/Linux:
kill -9 <PID>
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Prisma Client Not Generated

```bash
cd backend
npx prisma generate
```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Python Dependencies Issues

```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## 🎨 Code Style & Linting

### Backend (TypeScript)

```bash
cd backend

# Lint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Format with Prettier (if configured)
npm run format
```

### Frontend (TypeScript)

```bash
cd frontend

# Lint
npm run lint

# Type check
npm run type-check
```

### ML Service (Python)

```bash
cd ml-service

# Format with black
black .

# Lint with flake8
flake8 .

# Type check with mypy
mypy .
```

## 📦 Building for Production

### Backend

```bash
cd backend
npm run build
# Output: dist/
```

### Frontend

```bash
cd frontend
npm run build
# Output: .next/
```

### Docker Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
docker-compose build ml-service
```

## 🔄 Git Workflow

### Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Commit Changes

```bash
git add .
git commit -m "feat(backend): add new feature"
```

### Push to Remote

```bash
git push origin feature/your-feature-name
```

### Create Pull Request

Go to GitHub and create PR from your branch to `main`.

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)

## 💡 Tips & Best Practices

1. **Always run tests** before committing
2. **Use meaningful commit messages** (follow Conventional Commits)
3. **Keep dependencies updated** (check Dependabot PRs)
4. **Write tests** for new features
5. **Document complex logic** with comments
6. **Use TypeScript types** properly
7. **Handle errors gracefully**
8. **Log important events**
9. **Keep functions small** and focused
10. **Review your own code** before creating PR

## 🆘 Getting Help

- Check [CONTRIBUTING.md](../CONTRIBUTING.md)
- Open an issue on GitHub
- Ask in discussions
- Check existing issues and PRs

Happy coding! 🚀
