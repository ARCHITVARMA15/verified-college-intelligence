# VCIE Discovery Framework

The discovery framework finds candidate sources for a college. It is designed to be pluggable so that new discovery strategies can be added without changing existing code.

## Why Discovery Exists

Before VCIE can verify college data, it must know where official documents live. Discovery answers that question by returning structured metadata about potential sources: URLs, document types, confidence levels and years. The actual download and extraction happen in later modules.

## Real Discovery Workflow

The first real strategy, `OfficialWebsiteDiscoveryStrategy`, demonstrates the production workflow:

1. Read the canonical `CollegeIdentity` from the College Registry.
2. Fetch the college homepage HTML using Axios.
3. Parse anchor tags with Cheerio.
4. Resolve relative URLs against the homepage URL.
5. Normalize URLs and remove duplicates.
6. Keep links whose text or URL matches curated keywords such as `placement`, `nirf`, `naac`, `annual report`, `downloads` and `pdf`.
7. Assign a confidence score to each candidate:
   - **HIGH** — URL ends with `.pdf`.
   - **MEDIUM** — Internal official page on the college domain.
   - **LOW** — External domain that is not a direct PDF link.
8. Return in-memory `CandidateSource` objects.

This strategy currently supports only DJSCE. Run it with:

```bash
npm run discover:djsce
```

Results are written to `output/djsce-discovery.json`.

## Strategy Pattern

Each discovery strategy implements the `DiscoveryStrategy` interface:

- `getName()` — returns a unique strategy name.
- `supports(college)` — decides whether the strategy applies to the given `CollegeIdentity`.
- `discover(college)` — returns an array of `CandidateSource` objects.

Strategies are registered in a `DiscoveryRegistry`. The registry executes every supporting strategy and hands the combined output to `DiscoveryService` for normalization.

## Execution Flow

```
+-------------------+     supports()      +------------------+
| CollegeIdentity   | --------------------> | DiscoveryStrategy |
+-------------------+                     +------------------+
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

## Strategies

The current implementation includes:

- `OfficialWebsiteDiscoveryStrategy` — real Axios/Cheerio strategy for DJSCE that parses the homepage and returns keyword-matched candidate sources.
- `OfficialWebsiteStrategy` — mock strategy that produces synthetic candidates for the official website, training & placement page and admissions page.
- `NirfStrategy` — mock strategy that produces synthetic candidates for NIRF ranking and report PDF pages.

Mock strategies do not access the internet and exist only to validate the framework.
