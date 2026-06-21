# Security Architecture

EcoSphere AI is built with enterprise-grade security following the OWASP Top 10 guidelines.

## 1. Injection (SQL, NoSQL, OS, LDAP)
- **Mitigation:** The backend uses **SQLAlchemy 2.0 Core/ORM** which parameterizes all queries automatically. We never concatenate strings into raw SQL queries.
- **Data Validation:** All incoming data is rigorously validated using **Pydantic V2** schemas before it touches any database logic.
- **Frontend:** React inherently protects against XSS (Cross-Site Scripting), mitigating HTML injection.

## 2. Broken Authentication
- **Mitigation:** We leverage **Clerk** for robust, modern authentication on the frontend, handling MFA, passwordless, and OAuth securely.
- **Backend Tokens:** JWTs are verified strictly. Rate limiting (via **SlowAPI**) is applied to all endpoints to prevent brute forcing.

## 3. Sensitive Data Exposure
- **Mitigation:** All traffic is forced over HTTPS/TLS 1.3 in production.
- **At Rest:** Database encryption is handled at the infrastructure layer (e.g., AWS RDS / GCP Cloud SQL KMS encryption).
- **Secrets:** Managed via environment variables and robust secret managers.

## 4. XML External Entities (XXE)
- **Mitigation:** We only accept JSON payloads. XML parsers are not utilized in the application layer.

## 5. Broken Access Control
- **Mitigation:** Role-Based Access Control (RBAC) is enforced at the route and service level in FastAPI. Users can only access their own data, validated via the JWT `sub` claim.

## 6. Security Misconfiguration
- **Mitigation:** We employ a strict `Content-Security-Policy` (CSP) on the frontend.
- **Headers:** `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and `Referrer-Policy` are enforced.
- **CORS:** Cross-Origin Resource Sharing is strictly limited to allowed origins in `main.py`.

## 7. Cross-Site Scripting (XSS)
- **Mitigation:** Next.js / React automatically escapes string values. Dangerous APIs like `dangerouslySetInnerHTML` are completely avoided. Strict CSP restricts `script-src` to prevent unauthorized execution.

## 8. Insecure Deserialization
- **Mitigation:** Standard JSON serialization/deserialization is used. Pickle or other unsafe Python deserializers are never used. Pydantic guarantees the structure of deserialized data.

## 9. Using Components with Known Vulnerabilities
- **Mitigation:** We utilize `npm audit` and `Dependabot` (or similar CI/CD tooling) to track and automatically patch dependency vulnerabilities.

## 10. Insufficient Logging & Monitoring
- **Mitigation:** We use **Structlog** for structured JSON logging. **Sentry** is integrated for real-time error tracking, and **Prometheus** metrics are exposed for observability.

## Reporting a Vulnerability
If you discover a security vulnerability within EcoSphere AI, please send an e-mail to security@ecosphere.ai. We will promptly address all security reports.
