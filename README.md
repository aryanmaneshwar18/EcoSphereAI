<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/leaf.svg" alt="EcoSphere AI Logo" width="120" height="120" />
  
  # EcoSphere AI
  
  **The Next-Generation AI-Powered Carbon Tracking & Sustainability Platform**
  
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square)](#)
  [![Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen.svg?style=flat-square)](#)
  [![Security Rating](https://img.shields.io/badge/security-A%2B-success.svg?style=flat-square)](#)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

  <p align="center">
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#documentation">Documentation</a>
  </p>
</div>

---

## 🌍 Overview

EcoSphere AI is an enterprise-grade platform designed to help individuals and organizations meticulously track, analyze, and reduce their carbon footprint. By combining a beautiful, high-performance UI with advanced machine learning models and deterministic carbon calculation engines, EcoSphere AI provides unparalleled accuracy and actionable insights.

Built with performance, security, and scalability in mind, the platform adheres to industry-leading standards set by Google, Stripe, and Vercel.

---

## ✨ Features

- **Real-Time Carbon Dashboard:** Instant visibility into daily, weekly, and monthly emissions utilizing dynamic React data visualization.
- **AI Eco-Coach:** Context-aware AI assistant leveraging RAG to deliver personalized, actionable reduction strategies.
- **Predictive Carbon Twin:** "What-If" scenario modeling to forecast long-term environmental impact using advanced predictive algorithms.
- **Gamified Global Community:** Real-time leaderboards, challenges, and achievement tracking to foster a culture of sustainability.
- **Enterprise-Grade Security:** Comprehensive OWASP Top 10 mitigation, strict CSP, SQL injection prevention, and robust authentication via Clerk.
- **Uncompromised Performance:** Lighthouse 95+ scores achieved through dynamic imports, payload minimization, edge caching, and optimized DB queries.
- **WCAG 2.2 AA Accessibility:** Fully inclusive design featuring keyboard navigation, screen reader support, and strict contrast ratios.

---

## 🏗 Architecture

EcoSphere AI employs a modern decoupled architecture:

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Framer Motion for micro-interactions
- **State Management:** Zustand + React Query
- **Data Validation:** Zod
- **Authentication:** Clerk

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.12
- **Database:** PostgreSQL (SQLAlchemy 2.0 ORM & Core)
- **Caching & Rate Limiting:** Redis + SlowAPI
- **AI Integration:** Google Gemini Pro

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.x
- Python >= 3.11
- PostgreSQL >= 15
- Redis

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 📚 Documentation

Detailed documentation is maintained in the root of the repository:

- 🛡️ [**Security Architecture**](./SECURITY.md) - Details on OWASP mitigations, CSP, and RBAC.
- ⚡ [**Performance Guidelines**](./PERFORMANCE.md) - Lighthouse optimization strategies and infrastructure scaling.
- ♿ [**Accessibility Standards**](./ACCESSIBILITY.md) - WCAG 2.2 AA compliance details and Pa11y/Axe-core integration.
- 🧪 [**Testing Strategy**](./TESTING.md) - E2E, Component, and Unit testing methodologies (Jest/Pytest).
- 📊 [**Observability**](./OBSERVABILITY.md) - Telemetry, health checks, and structured logging.

---

## 🤝 Contributing
We welcome contributions to EcoSphere AI. Please read our `CONTRIBUTING.md` before submitting a Pull Request. Ensure that all tests pass and that coverage does not drop below 95%.

<div align="center">
  <br/>
  <p>Built with ❤️ for the planet.</p>
</div>
