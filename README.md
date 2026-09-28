# Taroo Full Stack Developer Intern — Take-Home Assignment

Production-minded solution for the **The Untested API** exercise.

## Included
- Unit tests for task business logic
- Supertest integration tests for every endpoint
- Edge-case and validation coverage
- Reproducible bug report with root causes and regression tests
- Focused correctness fixes
- `PATCH /tasks/:id/assign` with validation and conflict handling
- `/health` endpoint for deployment checks
- Jest coverage thresholds
- GitHub Actions CI
- Render deployment configuration
- Reviewer-facing solution notes

## Stack
Node.js, Express 4, Jest 29, Supertest 6.

## Run locally
Prerequisite: Node.js 18+.

```bash
cd task-api
npm install
npm test
npm run coverage
npm start
```

The API uses an in-memory store, so data resets whenever the process restarts.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Service health check |
| GET | `/tasks` | List tasks |
| GET | `/tasks?status=todo` | Filter by exact status |
| GET | `/tasks?page=1&limit=10` | Paginate tasks |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| PATCH | `/tasks/:id/complete` | Complete task |
| PATCH | `/tasks/:id/assign` | Assign task |
| GET | `/tasks/stats` | Counts + overdue count |

### Assignment endpoint

```http
PATCH /tasks/:id/assign
Content-Type: application/json

{"assignee":"Affan Khan"}
```

Rules:
- `assignee` must be a non-empty string after trimming.
- The trimmed name is stored.
- Missing task => `404`.
- Already-assigned task => `409 Conflict`; ownership is never silently overwritten.

## Testing
The suite is split into service-level unit tests and HTTP integration tests. Regression tests reproduce the defects documented in `BUG_REPORT.md`.

```bash
npm test
npm run coverage
```

Jest enforces minimum global coverage so future changes cannot silently reduce test quality.

## Deployment
A Render Blueprint is included in `render.yaml`. The service is configured as a Node web service and exposes `/health` for application-level health checks.

Render settings:
- Root directory: repository root
- Build: `npm install --prefix task-api`
- Start: `npm start --prefix task-api`

## Reviewer guide
- `BUG_REPORT.md` — discovered defects, reproduction and fixes
- `SOLUTION_NOTES.md` — design decisions, trade-offs and production questions
