# AI Fitness Tracker

[![CI](https://github.com/HeyRupam/ai-fitness-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/HeyRupam/ai-fitness-tracker/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A microservices-based fitness tracking application that logs workouts and delivers AI-powered recommendations using Google Gemini. Built with Spring Boot 3.5, Spring Cloud, and a React 19 frontend — all containerized with Docker Compose.

## Architecture

```
Browser
  │
  ├─► http://localhost        → React Frontend (nginx)
  │         │
  │         └─► /api/*        → Spring Cloud Gateway (JWT validation)
  │                                     │
  │                           ┌─────────┼─────────┐
  │                           ▼         ▼         ▼
  │                      User Svc  Activity Svc  AI Svc
  │                      (PostgreSQL) (MongoDB) (MongoDB)
  │                                     │
  │                                 RabbitMQ
  │                                     │
  │                                   AI Svc ──► Google Gemini
  │
  └─► http://localhost:8181   → Keycloak (OAuth2 / PKCE)
```

### Services

| Service | Docker port | Local port | Description |
|---|---|---|---|
| Frontend | 80 | 5173 | React 19 + Vite SPA served via nginx |
| Gateway | 8080 | 8095 | Spring Cloud Gateway — JWT validation, routing |
| User Service | 8081 | 8090 | User registration & profile (PostgreSQL) |
| Activity Service | 8082 | 8091 | Workout CRUD, publishes events to RabbitMQ (MongoDB) |
| AI Service | 8083 | 8093 | Consumes activity events, calls Gemini, stores recommendations (MongoDB) |
| Eureka | 8761 | 8092 | Service registry |
| Config Server | 8888 | 8094 | Centralized configuration |
| Keycloak | 8181 | 8181 | OAuth2 identity provider (PKCE flow) |
| RabbitMQ | 5672 / 15672 | 5672 / 15672 | Message broker + management UI |
| PostgreSQL | 5432 | 5432 | User data |
| MongoDB | 27017 | 27017 | Activity and recommendation data |

"Docker port" is used by `docker compose`; "Local port" is used when running services directly with Maven (defaults from the Config Server).

## Tech Stack

**Backend**
- Java 25, Spring Boot 3.5.7, Spring Cloud 2025.0.0
- Spring Cloud Gateway, Eureka, Config Server
- Spring Security OAuth2 Resource Server (JWT)
- Spring Data JPA (PostgreSQL), Spring Data MongoDB
- Spring AMQP / RabbitMQ
- Lombok, Maven

**Frontend**
- React 19, Vite, Bun
- Redux Toolkit, Material UI
- `react-oauth2-code-pkce` (PKCE authorization code flow)

**Infrastructure**
- Keycloak (OAuth2 / OpenID Connect)
- Docker, Docker Compose
- nginx (frontend reverse proxy)
- Google Gemini API (`gemini-2.0-flash` by default)

## Project Structure

```
.
├── backend/
│   ├── configserver/     # Spring Cloud Config Server — all service config lives in src/main/resources/config/
│   ├── eureka/           # Service registry
│   ├── gateway/          # API gateway, JWT validation, auto-registers Keycloak users
│   ├── userservice/      # Users (PostgreSQL)
│   ├── activityservice/  # Activities (MongoDB) + RabbitMQ publisher
│   └── aiservice/        # RabbitMQ consumer + Gemini recommendations (MongoDB)
├── frontend/
│   └── fitness-app-frontend/   # React SPA
├── docker-compose.yaml
└── .env.example
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- A Google Gemini API key — get one free at [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_key_here
```

> `.env` is git-ignored. Never commit real API keys or passwords.

### 2. Start all services

```bash
docker compose up --build
```

First build takes ~5–10 minutes (downloads JDK layers and npm packages). Subsequent starts are faster.

Wait until all services are running:

```bash
docker compose ps
```

### 3. Configure Keycloak

Keycloak starts empty — run this one-time setup to create the realm, client, and a test user:

```bash
# Get admin token
TOKEN=$(curl -s -X POST http://localhost:8181/realms/master/protocol/openid-connect/token \
  -d "client_id=admin-cli&username=admin&password=admin&grant_type=password" \
  | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Create realm
curl -s -X POST http://localhost:8181/admin/realms \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"realm":"fitness-oauth2","enabled":true}'

# Create PKCE public client
curl -s -X POST http://localhost:8181/admin/realms/fitness-oauth2/clients \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "clientId": "oauth2-pkce-client",
    "publicClient": true,
    "redirectUris": ["http://localhost", "http://localhost/*", "http://localhost:5173/*"],
    "webOrigins": ["http://localhost", "http://localhost:5173"],
    "standardFlowEnabled": true,
    "attributes": {"pkce.code.challenge.method": "S256"}
  }'

# Create test user (password: Test@1234)
curl -s -X POST http://localhost:8181/admin/realms/fitness-oauth2/users \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "username":"testuser","email":"testuser@example.com",
    "firstName":"Test","lastName":"User","enabled":true,
    "credentials":[{"type":"password","value":"Test@1234","temporary":false}]
  }'
```

> Keycloak data is persisted in a Docker volume — this only needs to be done once.

### 4. Open the app

Go to **[http://localhost](http://localhost)**, click **Login**, and sign in with:

- **Username:** `testuser`
- **Password:** `Test@1234`

## How It Works

1. User logs a workout (type, duration, calories) via the frontend
2. Activity Service saves it to MongoDB and publishes an event to RabbitMQ
3. AI Service picks up the event, calls Google Gemini to generate a personalized recommendation, and stores it
4. User can view the recommendation on the activity detail page

The gateway validates the Keycloak JWT on every request and forwards the user's ID (the JWT `sub` claim) to downstream services in the `X-User-ID` header. On first login, the gateway auto-registers the user in the User Service using the profile claims from the token.

## API

All endpoints are served through the gateway and require a `Bearer` token.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/activities` | Log an activity |
| `GET` | `/api/activities` | List the current user's activities |
| `GET` | `/api/activities/{activityId}` | Get one activity |
| `GET` | `/api/recomendation/activity/{activityId}` | AI recommendation for an activity |
| `GET` | `/api/recomendation/user/{userId}` | All recommendations for a user |
| `GET` | `/api/users/{userId}` | User profile |
| `GET` | `/api/users/{userId}/validate` | Check whether a Keycloak user ID is registered |

Example activity payload:

```json
{
  "type": "RUNNING",
  "duration": 30,
  "caloriesBurned": 300,
  "startTime": "2026-01-01T07:30:00",
  "additionalMetrics": { "distanceKm": 5.2 }
}
```

Activity types: `RUNNING`, `CYCLING`, `SWIMMING`, `WEIGHT_TRAINING`, `YOGA`, `CARDIO`, `HIT`, `STRETCHING`, `OTHER`.

## Development (without Docker)

Start the infrastructure containers only:

```bash
docker compose up -d postgres mongo rabbitmq keycloak
```

Then run the Spring services with Maven, in this order: `eureka` → `configserver` → `userservice`, `activityservice`, `aiservice` → `gateway`.

```bash
cd backend/eureka
./mvnw spring-boot:run
```

The AI Service needs your Gemini key in its environment:

```bash
cd backend/aiservice
GEMINI_API_KEY=your_key_here ./mvnw spring-boot:run
```

For the frontend, create `frontend/fitness-app-frontend/.env.local`:

```
VITE_API_URL=http://localhost:8095/api
VITE_KEYCLOAK_URL=http://localhost:8181
```

Then:

```bash
cd frontend/fitness-app-frontend
bun install
bun run dev
```

## Environment Variables

| Variable | Used by | Description |
|---|---|---|
| `GEMINI_API_KEY` | AI Service | Google Gemini API key (required for AI recommendations; without it a generic fallback recommendation is stored) |
| `GEMINI_API_URL` | AI Service | Gemini endpoint (defaults to `gemini-2.0-flash`) |
| `DB_URL` | User Service | JDBC URL (local default `jdbc:postgresql://localhost:5432/ai_db`) |
| `DB_USERNAME` / `DB_PASSWORD` | User Service | PostgreSQL credentials (local default `postgres` / `postgres`) |

In Docker Compose, service-specific settings (datasource, MongoDB URI, RabbitMQ, Eureka) are set in `docker-compose.yaml` and override the Config Server defaults.

## Security Notes

This project is configured for **local development**. Before deploying anywhere public:

- Change all default credentials in `docker-compose.yaml` (PostgreSQL, MongoDB, RabbitMQ, Keycloak admin).
- Don't publish the individual service ports (8081–8083, databases, broker) — only the frontend and gateway should be reachable.
- Run Keycloak in production mode (`start` instead of `start-dev`) with a real database and HTTPS.

## License

[MIT](LICENSE)
