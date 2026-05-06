# =============================================================================
# AegisOps — ML Service (FastAPI + scikit-learn)
# Base: python:3.11-slim | Target: AWS ECS
# =============================================================================

# ─── Stage 1: Build / install dependencies ────────────────────────────────────
FROM python:3.14-slim AS builder

# Install build tools needed for numpy/scikit-learn compilation
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      build-essential \
      gcc \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip and install wheel for faster builds
RUN pip install --upgrade pip wheel

# Install dependencies into an isolated prefix so we can copy them cleanly
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ─── Stage 2: Production runner ───────────────────────────────────────────────
FROM python:3.14-slim AS runner

# Runtime-only system libs (no build tools)
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libgomp1 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Security: non-root user
RUN groupadd --system --gid 1001 mlservice \
 && useradd  --system --uid 1001 --gid mlservice mlservice

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY --chown=mlservice:mlservice . .

# Ensure model artefacts directory exists and is writable
RUN mkdir -p /app/model && chown -R mlservice:mlservice /app

USER mlservice

ENV PORT=8000 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

# Use shell form so $PORT is expanded at runtime
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT} --workers 1
