# Verified College Intelligence Engine (VCIE)

A standalone, enterprise-grade backend service for collecting, verifying, storing and serving official engineering college information.

## Domain Driven Design Philosophy

VCIE is built around a clearly defined domain model that lives in `src/domain/`. The domain layer contains only pure TypeScript interfaces and enums that describe the data, its relationships and its lifecycle. It has no knowledge of databases, HTTP, queues or frameworks.

This separation ensures that:

- Business concepts remain stable even as infrastructure changes.
- Future engineers can reason about entities such as `College`, `Source`, `Document`, `PlacementRecord`, `Recruiter`, `VerificationRecord` and `Job` without understanding MongoDB or Express.
- Repositories, services, workers and APIs each have a single, well-defined responsibility.

See [Database.md](./docs/Database.md) for the domain model and [Architecture.md](./docs/Architecture.md) for how the domain layer fits into the overall system.

## Quick Start

```bash
npm install
npm run dev
```

Verify the server:

```bash
curl http://localhost:3000/health
```

## Documentation

- [README Details](./docs/README.md)
- [Architecture](./docs/Architecture.md)
- [Roadmap](./docs/Roadmap.md)

## Scripts

- `npm run dev` — Start in watch mode
- `npm run build` — Compile TypeScript
- `npm start` — Run compiled output
- `npm run typecheck` — Type-check without emit
- `npm run lint` — Run ESLint
- `npm run format` — Format with Prettier
- `npm test` — Run Vitest suite

## License

Private and confidential.
