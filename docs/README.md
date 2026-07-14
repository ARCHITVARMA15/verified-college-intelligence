# Verified College Intelligence Engine (VCIE)

VCIE is a standalone, enterprise-grade backend service responsible for collecting, verifying, storing and serving official engineering college information.

It is designed to become the single source of truth for verified college data and will eventually power products such as CetPilot.

## What is VCIE?

VCIE manages the complete lifecycle of official engineering college data:

- **Collection** — discovering and retrieving authoritative documents from official sources.
- **Verification** — validating data provenance, accuracy and freshness.
- **Storage** — persisting structured, queryable records.
- **Serving** — exposing clean, versioned APIs to consuming products.

## Architecture Philosophy

- **Standalone service** — VCIE owns its domain and exposes APIs rather than embedding logic in consumers.
- **Clean architecture** — config, routes, controllers, middleware and utilities are separated by responsibility.
- **Strict TypeScript** — no `any`, explicit types everywhere.
- **Dependency injection** — services are injected where reasonable to keep components testable.
- **Production ready** — structured logging, environment validation, security headers, graceful shutdown and Docker support out of the box.

## Tech Stack

- Node.js 20+
- TypeScript 5
- Express
- MongoDB (connection setup only in this phase)
- Pino Logger
- Zod (environment validation)
- Helmet, CORS, Compression
- ESLint + Prettier
- Vitest
- Docker + Docker Compose

## Folder Structure

```
src/
  app.ts              # Express application factory
  server.ts           # Bootstrap, DB connection and graceful shutdown
  config/
    env.ts            # Zod-validated environment variables
    logger.ts         # Pino logger configuration
    database.ts       # MongoDB connection manager
  routes/
    index.ts          # Top-level route registration
  controllers/
    healthController.ts
  middleware/
    errorHandler.ts   # Global error handler
    notFound.ts       # 404 handler
    requestLogger.ts  # HTTP request logging
types/
  index.ts            # Shared TypeScript types
utils/
  index.ts            # Reusable utilities
docs/
  README.md
  Architecture.md
  Roadmap.md
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm
- Docker and Docker Compose (optional)

### Local Development

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server with hot reload:

   ```bash
   npm run dev
   ```

4. Verify the health endpoint:

   ```bash
   curl http://localhost:3000/health
   ```

### Using Docker Compose

```bash
docker-compose up --build
```

The API will be available at `http://localhost:3000` and MongoDB at `mongodb://localhost:27017/vcie`.

## Available Scripts

- `npm run dev` — Start with `tsx` watch mode
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run compiled output
- `npm run typecheck` — Type-check without emitting
- `npm run lint` — Run ESLint
- `npm run lint:fix` — Fix ESLint issues
- `npm run format` — Format with Prettier
- `npm run test` — Run Vitest suite

## Environment Variables

| Variable     | Description                       | Required |
| ------------ | --------------------------------- | -------- |
| `PORT`       | HTTP port for the server          | Yes      |
| `NODE_ENV`   | `development`, `test`, `production` | Yes    |
| `MONGODB_URI`| MongoDB connection string         | Yes      |
| `LOG_LEVEL`  | Pino log level                    | Yes      |

The application will refuse to start if any required variable is missing or invalid.

## Future Roadmap

See [Roadmap.md](./Roadmap.md) for the full phased plan.

High-level phases:

1. Foundation (current)
2. Source Discovery
3. Document Downloader
4. Extraction
5. Verification
6. Public API
7. Admin Dashboard

## License

Private and confidential.
