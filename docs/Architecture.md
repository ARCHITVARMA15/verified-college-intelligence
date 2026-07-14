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
