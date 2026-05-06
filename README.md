# 🏙️ AegisOps — Sistem Pelaporan Infrastruktur Kota

[![CI/CD](https://github.com/HilmiKhaidarN/Could-Computing/actions/workflows/deploy.yml/badge.svg)](https://github.com/HilmiKhaidarN/Could-Computing/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/HilmiKhaidarN/Could-Computing/actions/workflows/codeql.yml/badge.svg)](https://github.com/HilmiKhaidarN/Could-Computing/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Platform pemantauan infrastruktur kota berbasis cloud yang memungkinkan warga melaporkan masalah infrastruktur (jalan rusak, lampu mati, banjir, dll.) dan menggunakan machine learning untuk menghitung skor prioritas penanganan secara otomatis.

## 🎯 Fitur Utama

- 📍 **Pelaporan Infrastruktur** — Warga dapat melaporkan masalah dengan lokasi GPS dan foto
- 🤖 **AI Priority Scoring** — Machine learning menghitung skor prioritas berdasarkan Severity, Frequency, dan Recency
- 🗺️ **Dashboard Interaktif** — Visualisasi laporan di peta Bandung dengan filter dan analytics
- 📊 **Analytics & Insights** — Statistik laporan per kategori, status, dan tren waktu
- 📸 **Upload Foto** — Integrasi AWS S3 + CloudFront untuk penyimpanan dan distribusi foto
- 🔐 **Role-Based Access** — Admin, Analyst, dan Viewer dengan permission berbeda

## 🏗️ Arsitektur

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│   NestJS     │────▶│ PostgreSQL  │
│  Frontend   │     │   Backend    │     │  Database   │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   FastAPI    │
                    │  ML Service  │
                    └──────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Leaflet |
| **Backend** | NestJS, Prisma ORM, JWT Auth, AWS SDK |
| **ML Service** | FastAPI, scikit-learn, pandas, numpy |
| **Database** | PostgreSQL 16 |
| **Infrastructure** | Docker, AWS ECS (Fargate), AWS RDS, AWS S3, CloudFront |
| **CI/CD** | GitHub Actions, Amazon ECR |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 16 (atau gunakan Docker)

### 1. Clone Repository

```bash
git clone https://github.com/HilmiKhaidarN/Could-Computing.git
cd Could-Computing/aegisops
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi Anda:

```env
# Database
DATABASE_USER=aegisops
DATABASE_PASSWORD=your_password
DATABASE_NAME=aegisops_db
DATABASE_URL=postgresql://aegisops:your_password@localhost:5432/aegisops_db

# JWT
JWT_SECRET=your_jwt_secret_key

# AWS (untuk production)
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=aegisops-uploads
AWS_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Run with Docker Compose

```bash
docker-compose up -d
```

Services akan berjalan di:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- ML Service: http://localhost:8000
- PostgreSQL: localhost:5432

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

## 🛠️ Development

### Backend Development

```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### ML Service Development

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

## 📚 API Documentation

Setelah backend berjalan, akses Swagger UI di:
- http://localhost:4000/api/docs

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
npm run test:cov
```

### Frontend Tests

```bash
cd frontend
npm test
```

### ML Service Tests

```bash
cd ml-service
pytest tests/ -v
```

## 🚢 Deployment

### AWS ECS Deployment

Proyek ini menggunakan GitHub Actions untuk automated deployment ke AWS ECS.

#### Setup AWS Resources

1. **Create ECR Repositories**
   ```bash
   aws ecr create-repository --repository-name aegisops-backend
   aws ecr create-repository --repository-name aegisops-frontend
   aws ecr create-repository --repository-name aegisops-ml
   ```

2. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name aegisops-cluster
   ```

3. **Setup RDS PostgreSQL**
   - Create RDS instance di private subnet
   - Note down connection string

4. **Setup S3 + CloudFront**
   - Create S3 bucket untuk uploads
   - Setup CloudFront distribution dengan OAC

5. **Configure GitHub Secrets**
   
   Tambahkan secrets di GitHub repository settings:
   ```
   AWS_ACCOUNT_ID
   AWS_REGION
   NEXT_PUBLIC_API_URL
   CLOUDFRONT_DOMAIN
   ```

6. **Setup IAM Roles**
   - Create role untuk GitHub Actions OIDC
   - Attach policies: ECR push, ECS update service

#### Automated Deployment

Push ke branch `main` akan otomatis trigger deployment:

```bash
git push origin main
```

GitHub Actions akan:
1. ✅ Lint & type check
2. ✅ Run tests
3. ✅ Build Docker images
4. ✅ Push ke Amazon ECR
5. ✅ Deploy ke ECS Fargate
6. ✅ Wait for stable deployment

## 📊 Project Structure

```
aegisops/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   ├── common/       # Shared utilities
│   │   └── config/       # Configuration
│   └── prisma/           # Database schema & migrations
├── frontend/             # Next.js App
│   ├── app/              # App Router pages
│   │   ├── (dashboard)/  # Dashboard routes
│   │   ├── components/   # React components
│   │   └── services/     # API clients
│   └── public/           # Static assets
├── ml-service/           # FastAPI ML Service
│   ├── model/            # ML models & predictor
│   └── data/             # Training data
├── docker/               # Dockerfiles
├── docs/                 # Documentation
│   └── ecs-task-definitions/  # ECS task configs
└── .github/              # GitHub Actions workflows
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Hilmi Khaidar N** - [GitHub](https://github.com/HilmiKhaidarN)

## 🙏 Acknowledgments

- Kota Bandung sebagai studi kasus
- AWS for cloud infrastructure
- Open source community

## 📞 Support

Jika ada pertanyaan atau issue, silakan:
- Open an issue di GitHub
- Email: [your-email@example.com]

---

Made with ❤️ for better city infrastructure management
