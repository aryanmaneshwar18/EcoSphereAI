# 🌍 EcoSphere AI

**The world's most intelligent personal sustainability platform.**

Track, predict, and reduce your environmental impact through AI-driven insights, scientific accuracy, and behavior change.

## 🏗️ Architecture

```
├── frontend/          # Next.js 15 + TypeScript + Tailwind + Framer Motion
├── backend/           # FastAPI + SQLAlchemy + Pydantic + Celery
├── docker-compose.yml # Full-stack orchestration
└── .env.example       # Environment configuration template
```

### Tech Stack

| Layer          | Technology                                    |
|----------------|-----------------------------------------------|
| **Frontend**   | Next.js 15, TypeScript, Tailwind CSS, Recharts, Framer Motion, Zustand |
| **Backend**    | FastAPI, Pydantic, SQLAlchemy 2.0, Alembic    |
| **Database**   | PostgreSQL 16 + Supabase                      |
| **Cache**      | Redis 7                                       |
| **Auth**       | Clerk                                         |
| **AI**         | OpenAI GPT-4o, LangGraph, RAG                 |
| **Workers**    | Celery + Redis                                |
| **Monitoring** | Sentry, Prometheus, Grafana                   |

### Scientific Foundation

All emission calculations are based on trusted sources:
- **IPCC AR6** — Global Warming Potentials (GWP100)
- **DEFRA 2025** — UK Government Conversion Factors
- **EPA** — GHG Emission Factors Hub, WARM Model
- **IEA** — Country electricity carbon intensities
- **Poore & Nemecek 2018** — Food lifecycle analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL 16
- Redis 7

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp ../.env.example ../.env
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
uvicorn app.main:app --reload
```

### Docker (Full Stack)
```bash
cp .env.example .env
docker compose up -d
```

## 📊 Features

- ✅ Multi-category carbon footprint tracking (7 categories, 100+ emission factors)
- ✅ Scientific emission engine (IPCC, DEFRA, EPA, IEA)
- ✅ Onboarding with baseline footprint calculation
- ✅ Interactive dashboard with charts and trends
- ✅ Carbon budget tracking (IPCC 2-tonne target)
- ✅ Impact equivalencies (trees, cars, phone charges)
- ✅ Streak and XP gamification system
- ✅ "What if?" scenario simulation (Carbon Twin)
- ✅ AI-powered coaching (GPT-4o)
- ✅ Community challenges and leaderboards
- ✅ Multi-agent AI architecture (LangGraph)

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend build check
cd frontend
npm run build
```

## 📄 License

MIT License — Built for the planet. 🌱
