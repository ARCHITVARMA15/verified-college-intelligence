# VCIE Architecture

## Why VCIE is a Standalone Service

VCIE isolates the domain of verified college intelligence from product-specific code. This separation provides:

- **Single source of truth** — One authoritative store for official college data.
- **Reusability** — Multiple products (CetPilot and future products) can consume the same API.
- **Independent scaling** — The ingestion pipeline and public API can scale on their own.
- **Clear ownership** — Data quality, verification rules and source management live in one place.
- **Security boundaries** — Crawlers, parsers and admin tools are isolated from consumer-facing products.

## How CetPilot Will Consume VCIE

CetPilot will interact with VCIE exclusively through the public REST API:

- Read verified college profiles, cutoffs, fees and seat matrices.
- Query by exam, branch, category, year and other dimensions.
- Receive standardized, versioned responses with provenance metadata.

CetPilot will never scrape, parse or verify source documents directly. VCIE owns that complexity.

## Service Boundaries

```
+--------------------------------------------------+
|                    VCIE                          |
|  +-------------+  +---------------+  +--------+  |
|  |   Crawler   |  |   Document    |  | Public |  |
|  |   Module    |  |   Processor   |  |  API   |  |
|  +-------------+  +---------------+  +--------+  |
|  +-------------+  +---------------+  +--------+  |
|  |   Source    |  | Verification|  |  Admin  |  |
|  |  Discovery  |  |    Engine     |  |  Panel  |  |
|  +-------------+  +---------------+  +--------+  |
|                    MongoDB                        |
+--------------------------------------------------+
          ^                              |
          | REST API                     |
          +------------------------------+
                       CetPilot
```

## Layered Architecture

VCIE is organized into five layers. Each layer owns a single responsibility and depends only on layers below it.

### 1. Domain Layer

Contains pure TypeScript interfaces, enums and type aliases in `src/domain/`. This layer defines the language of the business and has no dependencies on databases, frameworks or external services. See [Database.md](./Database.md) for the full model.

### 2. Repository Layer

Will be responsible for persistence. Repositories translate between domain entities and the chosen storage technology. In the current phase only the MongoDB connection manager exists; schemas and repositories are future work.

### 3. Service Layer

Will implement business workflows such as source discovery, document download scheduling, extraction orchestration and verification. Services use repositories and domain types but contain no HTTP or worker infrastructure code.

### 4. Worker Layer

Will execute background jobs defined by the `Job` domain entity. Workers consume jobs from a queue and call services to perform download, processing or verification tasks. This keeps heavy I/O and CPU work out of the request/response path.

### 5. API Layer

The Express-based HTTP surface. Controllers in this layer receive requests, delegate to services and return standardized responses. The API layer does not contain business rules; it only adapts between HTTP and domain objects.

## Future Modules

### 1. Crawler

Responsible for fetching official documents from known sources. Will respect robots.txt, rate limits and source-specific rules. No scraping logic exists in this foundation phase.

### 2. Source Discovery

Maintains a registry of authoritative sources (university websites, admission authorities, government portals). Tracks source health, URL patterns and change frequency.

### 3. Document Processing

Downloads PDFs, images and HTML pages retrieved by the crawler. Parsing, OCR and AI extraction are future concerns and are intentionally absent now.

### 4. Verification

Validates extracted data against cross-references, historical records and human-defined rules. Produces confidence scores and audit trails for every data point.

### 5. Admin Dashboard

Web interface for operations staff to review sources, queued documents, verification results and data quality metrics.

### 6. Public API

Versioned REST (and potentially GraphQL) surface for consumers like CetPilot. Will include caching, rate limiting and usage analytics.

## Design Principles

- **No business logic in the foundation** — This phase establishes wiring, not workflows.
- **Explicit dependency injection** — Database, logger and config are injectable to keep tests fast.
- **Fail fast on config errors** — Invalid environment variables prevent startup.
- **Structured logging** — Pino outputs JSON in production and pretty logs in development.
- **Graceful shutdown** — SIGTERM/SIGINT close the HTTP server and MongoDB connection cleanly.
