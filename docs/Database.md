# VCIE Database Design

This document describes the domain model for the Verified College Intelligence Engine. It is database-agnostic and contains only TypeScript interfaces and enums in `src/domain/`.

## Entities

### College

Represents an engineering college whose official data is tracked by VCIE.

| Field              | Type     | Description                                      |
| ------------------ | -------- | ------------------------------------------------ |
| `id`               | string   | Primary identifier                               |
| `name`             | string   | Official full name                               |
| `shortName`        | string?  | Common abbreviation                              |
| `city`             | string   | City                                             |
| `district`         | string   | District                                         |
| `state`            | string   | State                                            |
| `officialWebsite`  | string?  | Official website URL                             |
| `collegeType`      | union    | `government`, `private` or `aided`               |
| `autonomous`       | boolean  | Autonomous status                                |
| `minorityStatus`   | string?  | Minority status, if applicable                   |
| `university`       | string?  | Affiliating university                           |
| `nirfRank`         | number?  | NIRF engineering rank                            |
| `naacGrade`        | string?  | NAAC accreditation grade                         |
| `nbaAccredited`    | boolean  | NBA accreditation flag                           |
| `createdAt`        | Date     | Record creation timestamp                        |
| `updatedAt`        | Date     | Last update timestamp                            |

### Source

Represents an authoritative origin from which official documents or data are obtained.

| Field           | Type       | Description                              |
| --------------- | ---------- | ---------------------------------------- |
| `id`            | string     | Primary identifier                       |
| `type`          | SourceType | Origin category                          |
| `officialUrl`   | string     | Canonical source URL                     |
| `organization`  | string?    | Publishing organization                  |
| `year`          | number     | Related academic year                    |
| `confidence`    | Confidence | Provenance confidence score              |

### Document

Represents an official file or page discovered and optionally downloaded by VCIE.

| Field            | Type           | Description                              |
| ---------------- | -------------- | ---------------------------------------- |
| `id`             | string         | Primary identifier                       |
| `title`          | string         | Human-readable title                     |
| `documentType`   | DocumentType   | Classification                           |
| `pdfUrl`         | string         | Public URL                               |
| `localPath`      | string?        | Local file path after download           |
| `year`           | number         | Related academic year                    |
| `sha256`         | string?        | File integrity checksum                  |
| `status`         | DocumentStatus | Processing lifecycle state               |
| `sourceId`       | string         | → Source.id                              |
| `collegeId`      | string         | → College.id                             |
| `downloadedAt`   | Date?          | Download timestamp                       |
| `processedAt`    | Date?          | Processing completion timestamp          |

### PlacementRecord

Represents placement statistics extracted from an official document for a specific college and year.

| Field                  | Type         | Description                              |
| ---------------------- | ------------ | ---------------------------------------- |
| `id`                   | string       | Primary identifier                       |
| `collegeId`            | string       | → College.id                             |
| `year`                 | number       | Academic year                            |
| `highestPackage`       | number?      | Highest salary package                   |
| `averagePackage`       | number?      | Average salary package                   |
| `medianPackage`        | number?      | Median salary package                    |
| `placementPercentage`  | number?      | Placement rate                           |
| `studentsPlaced`       | number?      | Students placed                          |
| `higherStudies`        | number?      | Students pursuing higher studies         |
| `topRecruiters`        | string[]     | → Recruiter.id collection                |
| `sourceDocument`       | string       | → Document.id                            |
| `pageNumber`           | number?      | Page reference in source PDF             |
| `confidence`           | Confidence   | Extraction confidence                    |
| `verified`             | boolean      | Whether the record is approved           |
| `verifiedAt`           | Date?        | Approval timestamp                       |

### Recruiter

Represents a company that recruits from colleges tracked by VCIE.

| Field           | Type       | Description                              |
| --------------- | ---------- | ---------------------------------------- |
| `id`            | string     | Primary identifier                       |
| `name`          | string     | Company name                             |
| `category`      | string?    | Industry or sector                       |
| `yearsVisited`  | number[]   | Academic years the recruiter visited     |

### VerificationRecord

Represents a review decision made on a domain entity before it is accepted as verified data.

| Field           | Type                | Description                              |
| --------------- | ------------------- | ---------------------------------------- |
| `id`            | string              | Primary identifier                       |
| `entity`        | string              | Target entity name                       |
| `entityId`      | string              | → Target entity primary id               |
| `reviewer`      | string?             | Reviewer or system identifier            |
| `status`        | VerificationStatus  | Review outcome                           |
| `comments`      | string?             | Review notes                             |
| `verifiedAt`    | Date?               | Decision timestamp                       |

### Job

Represents a unit of background work executed by the VCIE worker layer.

| Field            | Type       | Description                              |
| ---------------- | ---------- | ---------------------------------------- |
| `id`             | string     | Primary identifier                       |
| `jobType`        | JobType    | Discriminator for job handler            |
| `status`         | JobStatus  | Execution lifecycle state                |
| `startedAt`      | Date?      | Start timestamp                          |
| `finishedAt`     | Date?      | Completion timestamp                     |
| `errorMessage`   | string?    | Failure description                      |

## Relationships

```
College 1──* Document
College 1──* PlacementRecord
Source  1──* Document
Document 1──* PlacementRecord
Recruiter *──* PlacementRecord (via topRecruiters ids)
VerificationRecord *──1 (any entity)
```

## Primary Identifiers

All primary identifiers are immutable `string` values. They are platform-generated unique IDs and remain stable across ingestion, verification and publication.

## Why Provenance Matters

Every data point served by VCIE must be traceable to an official source. The `Source` and `Document` entities preserve that provenance:

- **Source type** tells us whether the data came from a government portal, a college website or a press release.
- **Confidence** reflects how trustworthy the source is.
- **Document SHA-256** guarantees the file we processed is exactly what was published.
- **Source document reference** in `PlacementRecord` links every extracted number back to its originating PDF and page.

This lineage is essential for auditing, dispute resolution and rebuilding data when sources change.

## How Verification Works

Verification is a separate concern from extraction. The flow is:

1. A `Document` or `PlacementRecord` is created by an ingestion worker.
2. The system assigns an initial `Confidence` and flags the record as `verified: false`.
3. A human reviewer or automated rule creates a `VerificationRecord` referencing the target entity.
4. The reviewer sets the `VerificationStatus` to `APPROVED`, `REJECTED` or `NEEDS_REVIEW`.
5. Only entities with an approved verification record are exposed through the public API.

`VerificationRecord` is polymorphic: its `entity` and `entityId` fields can refer to any domain entity, keeping the audit trail centralized and consistent.
