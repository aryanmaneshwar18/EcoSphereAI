# ══════════════════════════════════════════════════════════════
# EcoSphere AI - Backend Dockerfile
# Multi-stage build for production-grade Python API
# ══════════════════════════════════════════════════════════════

FROM python:3.12-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ── Dependencies Stage ─────────────────────────────────────────
FROM base AS dependencies

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application Stage ──────────────────────────────────────────
FROM dependencies AS application

COPY . .

# Create non-root user for security
RUN groupadd -r ecosphere && useradd -r -g ecosphere ecosphere
RUN chown -R ecosphere:ecosphere /app
USER ecosphere

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=5s \
    CMD curl -f http://localhost:8000/health || exit 1

# Start uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
