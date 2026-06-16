# Backend - FastAPI with PostgreSQL

## 📚 Run app with Docker

```bash
docker compose up --build
```

## 🗄️ Database Migrations

Migrations run automatically when the app starts. To manually run migrations:

```bash
docker compose exec app bash
```

To create a new migration:

```bash
alembic revision --autogenerate -m "init" --rev-id=0001
```

View migration history:

```bash
docker-compose exec app alembic history
```

Downgrade to a specific revision:

```bash
docker-compose exec app alembic downgrade <revision>
```

## 🔧 Local Development (without Docker)

### Install Dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Create .env file

```bash
cp .env.example .env
# Edit .env with local database settings
```

### Run Migrations

```bash
alembic upgrade head
```

### Start the Server

```bash
uvicorn src.main:app --reload
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/                 # API endpoints
│   │   ├── dependencies/    # Dependency injection
│   │   ├── endpoints/       # API routes
│   │   └── schemas/         # Pydantic models
│   ├── auth/                # Authentication logic
│   ├── core/                # Core configuration
│   ├── database/            # Database setup & models
│   ├── exception_handlers/  # Custom exceptions
│   ├── middleware/          # Middleware
│   ├── repositories/        # Data access layer
│   └── services/            # Business logic
├── migrations/              # Alembic migrations
├── tests/                   # Test suite
├── Dockerfile               # Docker image definition
├── docker-compose.yml       # Docker Compose configuration
├── requirements.txt         # Python dependencies
├── alembic.ini             # Alembic configuration
└── .env.example            # Environment variables template
```

