# EpicAgent

Full-stack agent terminal workspace with an Express + TypeScript backend and a React + Vite frontend.

## Structure

```
backend/   - Node.js/Express API (TypeScript)
frontend/  - React + Vite SPA (TypeScript)
.github/   - CI workflows
```

## Prerequisites

- Node.js >= 20
- npm >= 10
- Docker & Docker Compose
- PostgreSQL (local dev) or a managed Postgres URL

## Setup

1. Clone the repo:

```bash
git clone https://github.com/rriyansh/EpicAgent.git
cd EpicAgent
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit both files with your values.

4. Run the database migration:

```bash
cd backend
npm run migrate
cd ..
```

## Development

Run both services with hot reload:

```bash
make dev
```

Or start them individually:

```bash
# backend (http://localhost:4000)
cd backend && npm run dev

# frontend (http://localhost:5173)
cd frontend && npm run dev
```

## Production

Build and run with Docker Compose:

```bash
make build
docker-compose -f docker-compose.prod.yml up -d
```

The backend is served on port 4000 and the frontend (served by nginx) on port 80.

## Scripts

| Command | Description |
|---------|-------------|
| `make dev` | Start backend + frontend in dev mode |
| `make build` | Build backend + frontend for production |
| `make start` | Start production servers |
| `make lint` | Run ESLint across workspaces |
| `make test` | Run the test suite |

## License

MIT
