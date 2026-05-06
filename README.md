# AegisOps

Cloud-based web application monorepo built with modern stack.

## Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Frontend    | Next.js + TypeScript        |
| Backend     | NestJS + TypeScript         |
| Database    | PostgreSQL + Prisma ORM     |
| ML Service  | Python + FastAPI            |
| Container   | Docker + Docker Compose     |
| CI/CD       | GitHub Actions              |

## Project Structure

```
aegisops/
├── frontend/         # Next.js application
├── backend/          # NestJS API server
├── ml-service/       # Python ML microservice
├── docker/           # Dockerfiles per service
├── .github/          # CI/CD workflows
├── docs/             # Architecture & documentation
├── docker-compose.yml
├── .env
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 20
- Python >= 3.11
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/aegisops.git
   cd aegisops
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Install root dependencies:
   ```bash
   npm install
   ```

4. Start all services with Docker:
   ```bash
   docker-compose up --build
   ```

### Development (without Docker)

**Frontend:**
```bash
cd frontend && npm install && npm run dev
```

**Backend:**
```bash
cd backend && npm install && npm run start:dev
```

**ML Service:**
```bash
cd ml-service && pip install -r requirements.txt && uvicorn app:app --reload
```

## Environment Variables

See `.env` for all required environment variables.

## License

MIT
