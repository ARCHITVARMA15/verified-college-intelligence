# VCIE Roadmap

This document outlines the planned phases for building the Verified College Intelligence Engine.

## Phase 1 — Foundation

**Current phase.**

- Project scaffolding
- Express server with security and logging middleware
- Zod-validated environment configuration
- MongoDB connection manager (schemas and models are out of scope)
- Health endpoint
- Docker and Docker Compose setup
- Linting, formatting and testing toolchain

## Phase 2 — Source Discovery

- Source registry data model
- CRUD endpoints for sources
- Source metadata (URL patterns, authority level, update frequency)
- Manual source submission and approval workflow

## Phase 3 — Document Downloader

- Download scheduler
- Document metadata and storage tracking
- File storage abstraction (local / cloud)
- Duplicate detection
- Basic rate limiting and retry policies

## Phase 4 — Extraction

- PDF parsing integration
- OCR pipeline
- HTML/table extraction
- AI-assisted extraction (external provider)
- Extracted-data schema and versioning

## Phase 5 — Verification

- Cross-reference rules
- Confidence scoring
- Human review queue
- Audit trail for every data point
- Approval workflow for publishing

## Phase 6 — Public API

- Versioned REST endpoints
- Querying by college, exam, branch, category, year
- Rate limiting and caching
- API documentation (OpenAPI)
- Usage analytics

## Phase 7 — Admin Dashboard

- Authentication and authorization
- Source management UI
- Document queue and review UI
- Verification results dashboard
- Data quality metrics and alerts
