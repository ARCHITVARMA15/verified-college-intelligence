# VCIE College Registry

The College Registry is the single source of truth for every engineering college recognized by VCIE. All other modules—Discovery, Downloader, Extractor, Verification and the Public API—reference colleges through identities managed here.

## Why the Registry Exists

Official college data must be traceable to a canonical entity. Without a central registry, the same institution could be represented by many slightly different names or URLs, causing duplicate sources, conflicting data and broken audit trails. The registry solves this by:

- Assigning one stable identifier to each college.
- Capturing aliases, official names and known domains.
- Providing normalized lookup and search.
- Remaining manually curated so crawlers cannot create or modify colleges.

## Canonical Identity

A `CollegeIdentity` defines the minimum information required to recognize and reference a college:

| Field            | Purpose                                          |
| ---------------- | ------------------------------------------------ |
| `id`             | Stable identifier used across all modules        |
| `officialName`   | Full legal or official name                      |
| `shortName`      | Common abbreviation                               |
| `aliases`        | Alternative names and known variations           |
| `knownDomains`   | Domains that officially belong to the college    |
| `officialWebsite`| Primary website URL                               |
| `city`           | City of the main campus                           |
| `district`       | District                                          |
| `state`          | State                                             |
| `university`     | Affiliating or parent university                  |
| `collegeType`    | `government`, `private` or `aided`              |
| `autonomous`     | Autonomous status flag                            |
| `minorityStatus` | Minority status, if applicable                    |
| `knownKeywords`  | Extra terms used to improve search recall         |
| `status`         | `ACTIVE`, `INACTIVE` or `MERGED`                |
| `createdAt`      | Record creation timestamp                         |
| `updatedAt`      | Last update timestamp                             |

## Alias Resolution

The registry can locate a college through any of its recognized aliases. Text is normalized before comparison: lowercased, punctuation removed and whitespace collapsed. This allows queries such as "VJTI", "VJTI Mumbai" and "Veermata Jijabai Technological Institute" to resolve to the same canonical identity.

## Domain Lookup

Every college record stores one or more known domains. The registry can attribute a discovered source to the correct college by matching the source URL's hostname against these domains, after stripping `www.` and normalizing case.

## Search Normalization

The search engine builds a single searchable text blob from the official name, short name, aliases, keywords, city, district, state and university. A query is normalized in the same way and split into tokens. A college is returned if any token matches anywhere in its searchable text, making search resilient to typos, abbreviations and partial input.

## Manual Curation

The registry is intentionally read-only for automated systems. Discovery may consume it to know which colleges to scan, but it may never create or update colleges. Only administrators or manual seeding processes can modify the registry. This guarantees that the canonical identity layer remains authoritative and clean.

## Import / Export

The registry can be serialized to JSON and restored from JSON:

- `RegistryExporter` produces a portable JSON snapshot.
- `RegistryImporter` validates the snapshot and returns `CollegeIdentity` objects that can be registered in a new service instance.

This makes backups, migrations and offline editing straightforward without requiring a database.

## Future Expansion

Later phases may add:

- Versioning and audit history for registry changes.
- Merge workflows when two records are found to represent the same college.
- Bulk import from official government lists.
- Integration with the Discovery framework so strategies receive registry entries instead of ad-hoc college objects.

## Seeded Colleges

The initial seed contains the following colleges:

- COEP Technological University
- Veermata Jijabai Technological Institute (VJTI)
- Sardar Patel Institute of Technology (SPIT)
- Dwarkadas J. Sanghvi College of Engineering (DJSCE)
- Thadomal Shahani Engineering College (TSEC)
- Vivekanand Education Society's Institute of Technology (VESIT)
- K. J. Somaiya College of Engineering (KJSCE)
- Pune Institute of Computer Technology (PICT)
- Pimpri Chinchwad College of Engineering (PCCOE)
- Walchand College of Engineering (WCE)
