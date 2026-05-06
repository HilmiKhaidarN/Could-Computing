# 📡 API Documentation

Dokumentasi lengkap untuk AegisOps REST API.

## 🔗 Base URL

- **Development**: `http://localhost:4000`
- **Production**: `https://api.aegisops.com`

## 🔐 Authentication

API menggunakan JWT (JSON Web Token) untuk authentication.

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe"
}
```

### Using Token

Include token in Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Endpoints

### Reports

#### Get All Reports

```http
GET /reports
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `pending`, `processing`, `completed`, `failed` |
| `category` | string | Filter by category |
| `limit` | number | Number of results (default: 50) |
| `offset` | number | Pagination offset (default: 0) |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Jalan Rusak di Jl. Sudirman",
      "description": "Lubang besar di tengah jalan",
      "status": "pending",
      "category": "jalan",
      "location": "Jl. Sudirman No. 123",
      "severity": 8.5,
      "frequency": 7.0,
      "recency": 9.0,
      "fileUrl": "https://d123.cloudfront.net/photo.jpg",
      "createdBy": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### Get Report by ID

```http
GET /reports/:id
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Jalan Rusak di Jl. Sudirman",
  "description": "Lubang besar di tengah jalan",
  "status": "pending",
  "category": "jalan",
  "location": "Jl. Sudirman No. 123",
  "severity": 8.5,
  "frequency": 7.0,
  "recency": 9.0,
  "fileUrl": "https://d123.cloudfront.net/photo.jpg",
  "createdBy": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

#### Create Report

```http
POST /reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Lampu Jalan Mati",
  "description": "Lampu jalan di depan sekolah sudah mati 3 hari",
  "category": "lampu",
  "location": "Jl. Merdeka No. 45",
  "severity": 6.5,
  "frequency": 5.0,
  "recency": 8.0
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Lampu Jalan Mati",
  "status": "pending",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

#### Update Report

```http
PATCH /reports/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "processing",
  "description": "Updated description"
}
```

#### Delete Report

```http
DELETE /reports/:id
Authorization: Bearer {token}
```

**Response:**

```json
{
  "message": "Report deleted successfully"
}
```

#### Upload Photo

```http
POST /reports/:id/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary data]
```

**Response:**

```json
{
  "fileUrl": "https://d123.cloudfront.net/uploads/photo-uuid.jpg",
  "message": "File uploaded successfully"
}
```

### Decision / Priority Scoring

#### Calculate Priority Score

```http
POST /decision/predict
Authorization: Bearer {token}
Content-Type: application/json

{
  "severity": 8.5,
  "frequency": 7.0,
  "recency": 9.0
}
```

**Response:**

```json
{
  "predicted_priority": 8.7,
  "confidence": 0.95,
  "model_version": "1.0.0",
  "inputs": {
    "severity": 8.5,
    "frequency": 7.0,
    "recency": 9.0
  }
}
```

#### Get Decision History

```http
GET /decision/history
Authorization: Bearer {token}
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "input": {
        "severity": 8.5,
        "frequency": 7.0,
        "recency": 9.0
      },
      "output": {
        "predicted_priority": 8.7
      },
      "confidence": 0.95,
      "createdBy": {
        "id": "uuid",
        "name": "John Doe"
      },
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### Analytics

#### Get Dashboard Stats

```http
GET /analytics/dashboard
Authorization: Bearer {token}
```

**Response:**

```json
{
  "totalReports": 1248,
  "pendingReports": 342,
  "processingReports": 156,
  "completedReports": 750,
  "averagePriority": 7.2,
  "reportsByCategory": {
    "jalan": 450,
    "lampu": 320,
    "banjir": 180,
    "sampah": 298
  },
  "reportsByStatus": {
    "pending": 342,
    "processing": 156,
    "completed": 750
  },
  "trendData": [
    {
      "date": "2025-01-01",
      "count": 45
    },
    {
      "date": "2025-01-02",
      "count": 52
    }
  ]
}
```

#### Get Reports by Category

```http
GET /analytics/by-category
Authorization: Bearer {token}
```

**Response:**

```json
{
  "data": [
    {
      "category": "jalan",
      "count": 450,
      "percentage": 36.1
    },
    {
      "category": "lampu",
      "count": 320,
      "percentage": 25.6
    }
  ]
}
```

#### Get Trend Analysis

```http
GET /analytics/trends
Authorization: Bearer {token}
Query: ?period=7d
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | Time period: `7d`, `30d`, `90d`, `1y` |

**Response:**

```json
{
  "period": "7d",
  "data": [
    {
      "date": "2025-01-08",
      "total": 45,
      "pending": 12,
      "processing": 8,
      "completed": 25
    }
  ],
  "summary": {
    "totalReports": 315,
    "averagePerDay": 45,
    "trend": "increasing"
  }
}
```

### Users

#### Get Current User

```http
GET /users/me
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### Update Profile

```http
PATCH /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

#### Get All Users (Admin Only)

```http
GET /users
Authorization: Bearer {token}
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

## 🤖 ML Service API

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "service": "aegisops-ml-service",
  "model_ready": true
}
```

### Predict Priority Score

```http
POST /predict
Content-Type: application/json

{
  "severity": 8.5,
  "frequency": 7.0,
  "recency": 9.0
}
```

**Response:**

```json
{
  "predicted_priority": 8.7,
  "model_version": "1.0.0",
  "inputs": {
    "severity": 8.5,
    "frequency": 7.0,
    "recency": 9.0
  }
}
```

### Get Model Info

```http
GET /model/info
```

**Response:**

```json
{
  "model_version": "1.0.0",
  "model_type": "LinearRegression",
  "features": ["severity", "frequency", "recency"],
  "coefficients": {
    "severity": 0.35,
    "frequency": 0.30,
    "recency": 0.35
  },
  "metrics": {
    "r2_score": 0.92,
    "mae": 0.45,
    "rmse": 0.62
  }
}
```

## ❌ Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "error": "An unexpected error occurred"
}
```

## 📝 Data Models

### Report

```typescript
{
  id: string;              // UUID
  title: string;           // Max 255 chars
  description?: string;    // Optional
  status: 'pending' | 'processing' | 'completed' | 'failed';
  category?: string;       // e.g., 'jalan', 'lampu', 'banjir'
  location?: string;       // Address or coordinates
  severity?: number;       // 0-10
  frequency?: number;      // 0-10
  recency?: number;        // 0-10
  fileUrl?: string;        // CloudFront URL
  createdById: string;     // User UUID
  createdAt: Date;
  updatedAt: Date;
}
```

### User

```typescript
{
  id: string;              // UUID
  email: string;           // Unique
  name: string;
  password: string;        // Hashed with bcrypt
  role: 'admin' | 'analyst' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}
```

### Decision

```typescript
{
  id: string;              // UUID
  input: {
    severity: number;
    frequency: number;
    recency: number;
  };
  output: {
    predicted_priority: number;
  };
  confidence?: number;     // 0-1
  createdById: string;     // User UUID
  createdAt: Date;
}
```

## 🔒 Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per minute per user

Headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678
```

## 📊 Pagination

For endpoints that return lists:

**Query Parameters:**

- `limit`: Number of items (default: 50, max: 100)
- `offset`: Skip items (default: 0)

**Response Headers:**

```
X-Total-Count: 1248
X-Limit: 50
X-Offset: 0
```

## 🧪 Testing with cURL

### Login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aegisops.com","password":"admin123"}'
```

### Get Reports

```bash
curl -X GET http://localhost:4000/reports \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Report

```bash
curl -X POST http://localhost:4000/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Report",
    "description": "Test description",
    "category": "jalan",
    "severity": 8.0,
    "frequency": 7.0,
    "recency": 9.0
  }'
```

## 📚 Interactive Documentation

Swagger UI tersedia di:

- **Development**: http://localhost:4000/api/docs
- **Production**: https://api.aegisops.com/api/docs

## 🔗 Additional Resources

- [Postman Collection](./postman_collection.json)
- [OpenAPI Spec](./openapi.yaml)
- [GraphQL Schema](./schema.graphql) (if applicable)

## 💡 Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** (not in localStorage)
3. **Implement token refresh** mechanism
4. **Handle rate limits** gracefully
5. **Validate input** on client side
6. **Handle errors** properly
7. **Use pagination** for large datasets
8. **Cache responses** when appropriate
9. **Monitor API usage**
10. **Keep tokens short-lived**

## 🆘 Support

For API issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Contact: api-support@aegisops.com
