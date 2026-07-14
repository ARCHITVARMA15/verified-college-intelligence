# VCIE Discovery Framework

The discovery framework finds candidate sources for a college without downloading or parsing any documents. It is designed to be pluggable so that new discovery strategies can be added without changing existing code.

## Why Discovery Exists

Before VCIE can verify college data, it must know where official documents live. Discovery answers that question by returning structured metadata about potential sources: URLs, document types, confidence levels and years. The actual download and extraction happen in later modules.

## Strategy Pattern

Each discovery strategy implements the `DiscoveryStrategy` interface:

- `getName()` — returns a unique strategy name.
- `supports(college)` — decides whether the strategy applies to the given college.
- `discover(college)` — returns an array of `CandidateSource` objects.

Strategies are registered in a `DiscoveryRegistry`. The registry executes every supporting strategy and hands the combined output to `DiscoveryService` for normalization.

## Execution Flow

```
+-------------+     supports()      +------------------+
|   College   | --------------------> | DiscoveryStrategy |
+-------------+                     +------------------+
                                           |
                                           | discover()
                                           v
+---------------+     register()     +------------------+
|  Application  | -------------------> | DiscoveryRegistry |
+---------------+                     +------------------+
                                              |
                                              | executeAll()
                                              v
                                       +------------------+
                                       | DiscoveryService  |
                                       +------------------+
                                              |
                                              | merge + sort
                                              v
                                       +------------------+
                                       | DiscoveryResult   |
                                       +------------------+
```

## Components

### CandidateSource

A lightweight metadata object describing a potential source:

- `id` — unique identifier
- `title` — human-readable title
- `url` — canonical source URL
- `sourceType` — origin category
- `documentType` — expected document classification
- `year` — related academic year (optional)
- `confidence` — provenance confidence
- `metadata` — strategy-specific context

### DiscoveryResult

Aggregated output of a discovery run:

- `collegeId` — identifier of the scanned college
- `strategy` — name of the runner, usually `DiscoveryService`
- `startedAt` / `finishedAt` — run timestamps
- `candidateSources` — deduplicated and confidence-sorted candidates
- `errors` — per-strategy failure context

### DiscoveryRegistry

- `register(strategy)` — add a strategy; throws on duplicate names
- `remove(name)` — remove a strategy
- `executeAll(college)` — run every supporting strategy and return per-strategy results

### DiscoveryService

- Runs all supporting strategies via the registry
- Merges duplicate candidates by URL
- Sorts candidates by descending confidence
- Captures errors and returns a `DiscoveryResult`

## Adding a New Strategy

1. Implement `DiscoveryStrategy` in `src/discovery/strategies/`.
2. Return only `CandidateSource` objects — do not download documents.
3. Register the strategy with the registry:

```typescript
const registry = new DiscoveryRegistry();
registry.register(new OfficialWebsiteStrategy());
registry.register(new NirfStrategy());
registry.register(new YourNewStrategy());

const service = new DiscoveryService(registry);
const result = await service.discover(college);
```

No existing file needs to change.

## Duplicate Merging

Candidate sources are grouped by their normalized URL. When multiple strategies discover the same URL, the candidate with the highest confidence is kept. This avoids processing the same document more than once while preserving the strongest provenance information.

## Mock Strategies

The current implementation includes two mock strategies that return synthetic URLs:

- `OfficialWebsiteStrategy` — produces candidates for the official website, training & placement page and admissions page.
- `NirfStrategy` — produces candidates for NIRF ranking and report PDF pages.

These strategies do not access the internet and exist only to validate the framework.
