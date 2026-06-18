# Fullstack Assignment Spring 2026

## Overview
This repository contains a fullstack web application built for the Fullstack Trainee assignment spring 2026. It includes two main parts:

- `backend/` — a FastAPI backend with PostgreSQL database support, JWT authentication, role-based authorization, and REST API endpoints for assistants, categories, runs, and user management.
- `frontend/` — a React + Vite single-page application with authentication, protected routes, admin pages, and API integration.

## Assignment Link
https://github.com/avito-tech/tech-internship/blob/main/Tech%20Internships/Backend/Fullstack-trainee-assignment-spring-2026/Fullstack-trainee-assignment-spring-2026.md

## Architecture

### Backend

The backend is implemented in `backend/src` and uses:

- FastAPI for HTTP routing, dependency injection, and request validation.
- SQLAlchemy + asyncpg for async database access and ORM models.
- PostgreSQL as the primary data store.
- Pydantic settings for config management.
- JWT for authentication and role propagation.
- A layered architecture:
  - `api/endpoints/` — route definitions and request handlers.
  - `services/` — business logic, auth, and assistant/run workflows.
  - `repositories/` — database access and queries.
  - `database/` — connection setup, models, and session management.
  - `auth/` — JWT token creation, verification, and password hashing.
  - `core/` — app configuration and logging setup.

Key backend features:

- `/api/user/login` — user login with email and password returning JWT token and role.
- `/api/user/register` — user registration endpoint.
- `/api/assistants` — assistant listing and retrieval.
- `/api/assistant/:id` — assistant detail lookup.
- `/api/assistants/:id/run` — run an assistant with a prompt.
- `/api/categories` — category listing.
- `/api/admin/*` — admin-only endpoints for creating categories, creating assistants, editing assistants, and viewing all runs.

### Frontend

The frontend is implemented in `frontend/src` and uses:

- React 19 for UI and component structure.
- Vite for fast development builds and production bundling.
- React Router DOM for navigation and protected routes.
- Context API for auth state and role storage.
- Fetch-based API client for REST calls.
- Nginx in Docker for production frontend serving.

Frontend structure:

- `src/App.tsx` — application routes, protected page wrappers.
- `src/context/AuthContext.tsx` — auth state, token and role persistence in `localStorage`.
- `src/api/api.ts` — API client methods for login, assistants, categories, runs, and admin actions.
- `src/components/Nav.tsx` — navigation menu with role-aware admin links.
- `src/components/ProtectedRoute.tsx` — blocks unauthenticated access.
- `src/components/AdminRoute.tsx` — blocks non-admin access.
- `src/pages/` — page components for login, assistants, runs, categories, and admin pages.

## Technologies

### Backend
- Python 3.11
- FastAPI
- SQLAlchemy
- asyncpg
- PostgreSQL
- Pydantic
- Uvicorn

### Frontend
- React 19
- TypeScript
- Vite
- React Router DOM
- ESLint
- Nginx (production container)

### DevOps
- Docker
- Docker Compose
- PostgreSQL 15-alpine

## Running the Project

### Using Docker Compose

From the repository root:

\`\`\`bash
docker compose up --build
\`\`\`

Then open these URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

### Backend only

From `backend/`:

\`\`\`bash
python -m venv venv
source venv/bin/activate  # or `backend\venv\Scripts\Activate.ps1` on Windows
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000
\`\`\`

### Frontend only

From `frontend/`:

\`\`\`bash
npm install
npm run dev
\`\`\`

## Environment

The backend is configured with defaults for Docker Compose:

- `DB_HOST=db`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASS=postgres`
- `DB_NAME=ai_assistants`
- `SECRET_KEY=your-secret-key-change-me`

If you want custom values, create a `.env` file in the repository root and add variables.

## Docker Setup

### Backend
- `backend/Dockerfile` builds a Python image with dependencies and starts Uvicorn on port `8000`.

### Frontend
- `frontend/Dockerfile` builds the React app with Vite and serves it with Nginx on port `80`.
- `frontend/nginx.conf` handles SPA routing and proxies `/api/` requests to backend.

### Compose
- `docker-compose.yml` defines three services:
  - `db` — PostgreSQL database
  - `backend` — FastAPI application
  - `frontend` — built React app served by Nginx

