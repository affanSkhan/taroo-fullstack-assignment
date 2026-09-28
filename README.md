# Taroo Full Stack Developer Intern — Take-Home Assignment

Production-minded solution for the **The Untested API** exercise.

## Live API

**Live API:** https://affankhan--6cb5d158bb3711f194981607ee4eb77e.web.val.run

Verified live endpoints:
- `GET /health` → `200 {"status":"ok"}`
- `GET /tasks` → `200 []` on a fresh database
- `GET /tasks/stats` → `200` with task counters
- Unknown routes → JSON `404`

The live deployment uses Val Town's public HTTP runtime with a project-scoped SQLite database. It mirrors the assignment API behavior and keeps data persistent across process restarts.

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
- Render deployment configuration for conventional Node hosting
- Verified live API deployment
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

The repository implementation uses an in-memory store, so local API data resets whenever the process restarts. The deployed live mirror uses SQLite so the public API remains persistent.

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

The verified GitHub Actions run passed **43/43 tests** across **3/3 suites** with:

- Statements: **97.31%**
- Branches: **92.64%**
- Functions: **94.28%**
- Lines: **97.60%**

Jest enforces minimum global coverage so future changes cannot silently reduce test quality.

## Deployment
A Render Blueprint is included in `render.yaml` for conventional Node hosting. Render's connected workspace is currently build-quota constrained, so the live submission endpoint is hosted separately on Val Town and has been verified directly.

Render settings:
- Root directory: repository root
- Build: `npm install --prefix task-api`
- Start: `npm start --prefix task-api`

## Reviewer guide
- `BUG_REPORT.md` — discovered defects, reproduction and fixes
- `SOLUTION_NOTES.md` — design decisions, trade-offs and production questions
- `TEST_REPORT.md` — observed CI test and coverage results
