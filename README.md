# AegisOps — Sistem Pelaporan Infrastruktur Kota Bandung

Platform berbasis cloud untuk pelaporan dan penanganan masalah infrastruktur kota menggunakan machine learning untuk prioritas penanganan.

## Fitur

- Pelaporan infrastruktur dengan foto dan lokasi GPS
- AI Priority Scoring (Severity, Frequency, Recency)
- Dashboard analytics dan visualisasi
- Upload foto ke AWS S3 + CloudFront
- Role-based access (Admin, Supervisor, User)

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **ML Service**: FastAPI, scikit-learn
- **Infrastructure**: AWS ECS, RDS, S3, CloudFront, ECR

## Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/HilmiKhaidarN/Could-Computing.git
cd Could-Computing/aegisops

# Setup environment
cp .env.example .env

# Start PostgreSQL
docker run -d --name aegisops-db -p 5432:5432 \
  -e POSTGRES_USER=aegisops \
  -e POSTGRES_PASSWORD=aegisops_password \
  -e POSTGRES_DB=aegisops_db \
  postgres:16-alpine

# Backend
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev

# ML Service
cd ml-service
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- ML Service: http://localhost:8000

### Default Users

| Email | Password | Role |
|-------|----------|------|
| admin@aegisops.id | admin123 | Admin |
| supervisor@aegisops.id | super123 | Supervisor |
| user@aegisops.id | user123 | User |

## AWS Deployment

Deployed using AWS ECS (Fargate), RDS PostgreSQL, S3, and CloudFront with automated CI/CD via GitHub Actions.

## Project Structure

```
aegisops/
├── backend/          # NestJS API
├── frontend/         # Next.js App
├── ml-service/       # FastAPI ML
├── docker/           # Dockerfiles
└── .github/          # CI/CD workflows
```

## Author

**Hilmi Khaidar N** - Cloud Computing Project
