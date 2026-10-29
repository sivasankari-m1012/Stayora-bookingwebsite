# Backend (v2): layered Node API

Express 5 + built-in `node:sqlite` (Node >= 22.13). Same JSON contract as v1, so the React app works unchanged.

```bash
cd backend
npm install
npm start          # http://localhost:4000   (first start: migrates + seeds the database)
npm test           # 21 tests, in-memory DB, pinned clock
```
Frontend: `npm run dev` in the project root (Vite proxies `/api` -> :4000). API docs: `GET /api/openapi.yaml`.

## Layers (a request flows top to bottom; each layer only knows the one below)

| Layer | Folder | Job | Knows about |
|---|---|---|---|
| HTTP | `src/http/` | routes, zod validation, auth, rate limit, error format | Express |
| Services | `src/services/` | use-cases: create / cancel booking, quote, availability | repositories, domain |
| Domain | `src/domain/` | pure rules: dates, guest limits, pricing, `AppError` | nothing (no I/O) |
| Repositories | `src/repositories/` | ALL SQL lives here | SQLite |
| DB | `src/db/`, `migrations/` | connection pragmas, transactions, migrations | SQLite |

`src/container.js` wires everything (manual dependency injection); `src/app.js` builds the Express app;
`src/server.js` is the process entry (config, DB, migrate, seed, listen, graceful shutdown).

## What makes it production-minded
- **Config validated at startup** (`src/config`): wrong env = readable crash, not a mystery at 2 a.m. Production requires `ADMIN_TOKEN`.
- **Validation at the edge** (zod, `src/http/schemas.js`) separate from **business rules** (`domain/stay.js`).
- **One error shape** everywhere: `{ error: { code, message, details?, requestId } }`; bugs return a generic 500 and are logged with the stack.
- **Request id** on every response, log line and error body (`X-Request-Id`, caller may supply one).
- **Security**: helmet headers, CORS allow-list, rate limits (global + stricter on booking writes), 16 KB body cap,
  admin endpoints behind a bearer token (constant-time compare), admin page under a strict CSP (no inline script).
- **Booking correctness**: the free-dates check, the idempotency check and the INSERT share one `BEGIN IMMEDIATE` transaction.
  Same `Idempotency-Key` + same body = replay (200); same key + different body = 409. Check-out day may equal the next check-in.
- **Unguessable booking references** (`BK` + 10 random Crockford-base32 chars). Guests use the reference to view / cancel; listing all bookings is admin-only.
- **"Today" in the property's timezone** (`TIMEZONE`, default Asia/Kolkata), not the server's.
- **Migrations** (`migrations/NNN_*.sql`, tracked in `schema_migrations`); v1 databases upgrade in place (tested).
- **Structured logs** (pino JSON), `/api/health` (liveness) and `/api/ready` (DB check), graceful shutdown on SIGTERM/SIGINT.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/listing` `/api/photos` `/api/amenities` `/api/nearby` | content (cached 60 s) |
| GET | `/api/reviews?limit&offset&q` | stats + paged reviews |
| GET | `/api/availability?from=YYYY-MM&months=` | nights that cannot be booked |
| GET | `/api/quote?checkIn&checkOut&adults&children&infants&pets` | price + availability |
| POST | `/api/bookings` | create (`Idempotency-Key` header) |
| GET / DELETE | `/api/bookings/:ref` | fetch / cancel (reference is the secret) |
| GET | `/api/bookings` | list all (admin token) |
| GET | `/api/health` `/api/ready` `/api/openapi.yaml` `/admin` | ops |

Status codes: 200/201 ok, 400 invalid input, 401 admin token, 404, 405 (+`Allow`), 409 conflict
(`dates_unavailable`, `idempotency_key_reused`, `cannot_cancel`), 413, 429, 500.

## Scripts
`npm run migrate` · `npm run seed` (reloads content tables from `../src/data`, never touches bookings) · `npm run dump` (SQL copy of the DB).

## Honest limits and the scale-up path
- SQLite + one process is right for a demo and small traffic. `node:sqlite` is synchronous, so inside one process requests are
  already serialised; `BEGIN IMMEDIATE` is what keeps it correct if several processes share the file.
- Money is `nightlyRate` as a float (5699.8) to match the frontend contract; a real system stores integer paise.
- No payments, emails or user accounts. Growth path: Postgres with an exclusion constraint on a `daterange`, Redis cache for content,
  a payment provider + outbox/queue for confirmation emails, auth for guests.
- `Dockerfile` and `.github/workflows/ci.yml` are provided but were not run in the build environment.
