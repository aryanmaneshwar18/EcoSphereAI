# Observability & Infrastructure

EcoSphere AI integrates a robust observability stack to ensure maximum uptime, rapid debugging, and seamless monitoring.

## 1. Structured Logging
- The backend utilizes `structlog` to emit JSON-formatted logs.
- Contextual variables (e.g., `user_id`, `request_id`, `endpoint`) are bound to the logger at the middleware level.
- This allows seamless ingestion into aggregators like Datadog, ELK, or Google Cloud Logging.

## 2. Health Checks
- `GET /api/v1/health` provides a quick liveness probe (HTTP 200 OK).
- `GET /api/v1/health/deep` provides a readiness probe that verifies database connectivity, Redis cache status, and external API integrations.

## 3. Metrics & Monitoring
- FastAPI is instrumented with Prometheus (`starlette_exporter` / `prometheus_client`).
- Key metrics tracked:
  - Request latency (p95, p99)
  - HTTP status code distributions
  - Database connection pool utilization
  - Active users and activity log counts

## 4. Distributed Tracing
- OpenTelemetry is integrated to provide distributed tracing across the backend and frontend.
- `Trace-Id` headers are passed through to all downstream microservices to visualize the entire lifecycle of a request.
