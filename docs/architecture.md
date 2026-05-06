# AegisOps — Cloud Architecture Overview

> **Catatan:** Diagram arsitektur visual (PNG/SVG) dibuat secara manual menggunakan draw.io.
> File ini menjelaskan komponen dan alur sistem secara tekstual.

## Deskripsi Sistem

**AegisOps** adalah platform pemantauan infrastruktur kota berbasis cloud yang memungkinkan
warga melaporkan masalah infrastruktur (jalan rusak, lampu mati, banjir, dll.) dan menggunakan
machine learning untuk menghitung skor prioritas penanganan secara otomatis.

- **Nama Aplikasi:** AegisOps — Sistem Pelaporan Infrastruktur Kota
- **Domain:** Sistem Transportasi & Infrastruktur Kota (Kota Bandung)
- **Target Pengguna:** Warga (pelapor), Admin/Supervisor (pengelola laporan)

---

## Arsitektur Cloud AWS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└──────────────┬──────────────────────────────────────┬───────────────────────┘
               │                                      │
    ┌──────────▼──────────┐              ┌────────────▼────────────┐
    │   Amazon CloudFront  │              │   Application Load      │
    │   (CDN — Static      │              │   Balancer (ALB)        │
    │    Assets & Images)  │              │   Public Subnet         │
    └──────────┬──────────┘              └────────────┬────────────┘
               │                                      │
    ┌──────────▼──────────┐    ┌─────────────────────▼─────────────────────┐
    │   Amazon S3          │    │              AWS VPC                       │
    │   (File Storage)     │    │                                            │
    │   - Foto laporan     │    │  ┌─────────────── Public Subnet ────────┐ │
    │   - Static assets    │    │  │                                      │ │
    └─────────────────────┘    │  │  ┌──────────────────────────────────┐ │ │
                                │  │  │     Amazon ECS (Fargate)        │ │ │
                                │  │  │                                 │ │ │
                                │  │  │  ┌──────────┐  ┌─────────────┐  │ │ │
                                │  │  │  │ Frontend │  │  Backend    │  │ │ │
                                │  │  │  │ Next.js  │  │  NestJS     │  │ │ │
                                │  │  │  │ :3000    │  │  :4000      │  │ │ │
                                │  │  │  └──────────┘  └──────┬──────┘  │ │ │
                                │  │  │                        │         │ │ │
                                │  │  │  ┌─────────────────────┘         │ │ │
                                │  │  │  │  ┌──────────────┐             │ │ │
                                │  │  │  │  │  ML Service  │             │ │ │
                                │  │  │  │  │  FastAPI     │             │ │ │
                                │  │  │  │  │  :8000       │             │ │ │
                                │  │  │  │  └──────────────┘             │ │ │
                                │  │  └──────────────────────────────────┘ │ │
                                │  │                                        │ │
                                │  │  ┌─────────────── Private Subnet ───┐  │ │
                                │  │  │                                   │  │ │
                                │  │  │  ┌──────────────────────────────┐ │  │ │
                                │  │  │  │     Amazon RDS               │ │  │ │
                                │  │  │  │     PostgreSQL 16            │ │  │ │
                                │  │  │  │     (Private — no public IP) │ │  │ │
                                │  │  │  └──────────────────────────────┘ │  │ │
                                │  │  └───────────────────────────────────┘  │ │
                                │  └────────────────────────────────────────┘ │
                                └─────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────┐
    │                     CI/CD Pipeline (GitHub Actions)                      │
    │                                                                          │
    │  GitHub Push → Lint/Test → Build Docker → Push ECR → Deploy ECS         │
    └─────────────────────────────────────────────────────────────────────────┘
```

---

## Komponen AWS

| Komponen              | Service AWS          | Keterangan                                              |
|-----------------------|----------------------|---------------------------------------------------------|
| Container Orchestration | Amazon ECS (Fargate) | Menjalankan 3 container: frontend, backend, ml-service |
| Container Registry    | Amazon ECR           | Menyimpan Docker image (backend, frontend, ml)          |
| Database              | Amazon RDS           | PostgreSQL 16 di **private subnet** (tidak publik)      |
| File Storage          | Amazon S3            | Menyimpan foto laporan yang diupload warga              |
| CDN                   | Amazon CloudFront    | Distribusi konten statis & foto via CDN (bukan S3 langsung) |
| Load Balancer         | Application LB (ALB) | Routing traffic ke ECS tasks                            |
| Networking            | Amazon VPC           | Isolasi jaringan dengan public & private subnet         |
| Secrets               | AWS Secrets Manager  | DATABASE_URL, JWT_SECRET, S3_BUCKET_NAME, dll.          |
| Logging               | Amazon CloudWatch    | Log semua ECS containers                                |
| CI/CD                 | GitHub Actions       | Build → ECR → Deploy ke ECS otomatis                   |

---

## Subnet Layout

```
VPC: 10.0.0.0/16
├── Public Subnet A  (10.0.1.0/24) — ECS Tasks, ALB
├── Public Subnet B  (10.0.2.0/24) — ECS Tasks, ALB (Multi-AZ)
├── Private Subnet A (10.0.3.0/24) — RDS Primary
└── Private Subnet B (10.0.4.0/24) — RDS Standby (Multi-AZ)
```

---

## Alur Data

### 1. Pengguna Mengakses Aplikasi
```
User → CloudFront (static assets) → ALB → ECS Frontend (Next.js)
```

### 2. Membuat Laporan
```
User → Frontend → Backend API (POST /reports) → RDS (simpan laporan)
                                               → ML Service (hitung skor AI)
```

### 3. Upload Foto Laporan
```
User → Frontend → Backend API (POST /reports/:id/upload)
                → S3 (simpan file)
                → RDS (simpan CloudFront URL)
                → Return CloudFront URL (bukan S3 URL langsung)
```

### 4. Akses Foto
```
User → CloudFront URL → CloudFront CDN → S3 (origin)
       (bukan langsung ke S3)
```

### 5. CI/CD Pipeline
```
git push main → GitHub Actions:
  1. Lint & Type Check
  2. Test (backend + ML)
  3. Build Docker images
  4. Push ke Amazon ECR
  5. Update ECS services (force new deployment)
  6. Wait for stable deployment
```

---

## Fitur Utama Aplikasi

| No | Fitur                        | Deskripsi                                                    |
|----|------------------------------|--------------------------------------------------------------|
| 1  | Pelaporan Infrastruktur      | Warga membuat laporan masalah dengan kategori & lokasi       |
| 2  | AI Priority Scoring          | ML service menghitung skor prioritas (0–10) otomatis         |
| 3  | Dashboard & Peta             | Admin melihat semua laporan di peta interaktif Bandung       |
| 4  | Upload Foto ke S3            | Warga upload foto bukti, disimpan S3, diakses via CloudFront |
| 5  | Analytics                    | Statistik laporan per kategori, status, dan tren waktu       |

---

## Security

- RDS berada di **private subnet** — tidak dapat diakses dari internet
- File S3 tidak publik — hanya bisa diakses melalui **CloudFront** (OAC)
- JWT authentication untuk semua API endpoint
- Password di-hash dengan bcrypt (cost factor 10)
- Secrets disimpan di **AWS Secrets Manager** (bukan environment variable hardcoded)
- ECS tasks berjalan sebagai non-root user
- CORS dikonfigurasi hanya untuk domain frontend
