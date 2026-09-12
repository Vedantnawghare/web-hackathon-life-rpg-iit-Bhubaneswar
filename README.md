# Life RPG

Life RPG transforms real-world personal productivity and habit tracking into an immersive, tactile fantasy RPG progression system. Users create quests, clear them, earn authoritative XP and Gold, level up their characters across 5 core attributes, maintain streaks, and customize their persona with Guild Shop cosmetics.

---

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui.
- **Server State Management**: TanStack Query v5 (client never computes or stores progression truth).
- **Client UI State**: Zustand (ephemeral audio preferences and modal triggers only).
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (asyncpg), Alembic, Pytest.
- **Database**: PostgreSQL 16 (via Supabase or local Docker).
- **Authentication**: Supabase Auth (cryptographically verified server-side via JWT).

---

## Repository Structure

```
Life-RPG/
├── backend/
│   ├── alembic/                # Database migration scripts
│   ├── app/
│   │   ├── api/v1/endpoints/   # Modular API routers
│   │   ├── core/               # Config, security, database session, exceptions
│   │   ├── models/             # SQLAlchemy 2.0 ORM models
│   │   ├── schemas/            # Pydantic v2 validation models
│   │   ├── services/           # Authoritative game logic & services
│   │   └── main.py             # FastAPI app entrypoint
│   ├── tests/                  # Pytest test suite
│   ├── Dockerfile
│   ├── requirements.txt
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router routes
│   │   ├── components/         # UI primitives, layout & RPG components
│   │   ├── hooks/              # Custom hooks & query wrappers
│   │   ├── lib/                # API client & Supabase client
│   │   └── types/              # TypeScript types
│   ├── tailwind.config.ts
│   └── package.json
├── docs/
│   ├── architecture.md         # System design & boundaries
│   ├── security.md             # Security, auth, and isolation
│   └── game-mechanics.md       # Formulas, attributes, and economy
├── docker-compose.yml          # Local PostgreSQL 16 container
├── ATTRIBUTIONS.md             # Verified licenses & credits
├── PRODUCT_SPEC.md             # Functional product specification
└── README.md
```

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+
- **Python**: 3.11+
- **Docker**: For running local PostgreSQL (optional if connecting to Supabase directly)

### 2. Environment Variables
Copy the template files:
```bash
cp .env.example .env
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

### 3. Start Local PostgreSQL Database
```bash
docker-compose up -d
```
The database will be available at `localhost:5432` with database `liferpg`, user `postgres`, password `postgrespassword`.

### 4. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Run tests
pytest

# Start development server
uvicorn app.main:app --reload --port 8000
```
The backend API documentation is available at `http://localhost:8000/docs`.
Verify health at `http://localhost:8000/api/v1/health`.

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
