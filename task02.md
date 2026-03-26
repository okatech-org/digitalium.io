# NEXUS-OMEGA Implementation Tasks

## Module 1: Immersion Totale & Architecture
- [ ] Perform total project scan (package.json, config files, endpoints, Convex maturity).
- [ ] Understand the vision, target personas, user flows, and current vs. target architecture.
- [ ] Execute prioritized triage (P0, P1, P2).
- [ ] Conduct exhaustive frontend audit (Routes, Components, Navigation, Handlers).
- [ ] Conduct backend CRUD audit.
- [ ] Evaluate NEOCORTEX maturity score.
- [ ] Detect existing subsystems (Chat, Uploads, Roles, Dashboard, etc.).
- [ ] Audit hybrid infrastructure (Convex + SQL).
- [ ] Generate the final OMEGA Audit Report.

## Module 2: NEOCORTEX Full Backend
- [ ] Implement complete bio-inspired schema (`schema.ts`).
- [ ] Define comprehensive types and helpers (`lib/types.ts`).
- [ ] Implement `limbique.ts` (Signal emission, routing, and cleanup).
- [ ] Implement `hippocampe.ts` (Audit trail, metrics, history logging).
- [ ] Implement `plasticite.ts` (Dynamic configuration, adaptive weights).
- [ ] Implement `prefrontal.ts` (Weighted decision scoring, workflows).
- [ ] Implement `sensoriel.ts` (HTTP Actions, webhooks).
- [ ] Implement `visuel.ts` (File storage, OCR, media).
- [ ] Implement `auditif.ts` (Multi-channel notifications).
- [ ] Implement `moteur.ts` (External actions, async tasks).
- [ ] Implement `crons.ts` (Scheduled tasks for cleanup and metrics).
- [ ] Implement `monitoring.ts` (System health, alerts).
- [ ] Apply the OMEGA Mutation Pattern to all domain mutations.
- [ ] Check robustness (Strict `v.*` validation, try/catch, pure TypeScript).

## Module 3: Frontend & Espaces Utilisateurs
- [ ] Resolve P0 blocking issues (build issues, env variables, PWA removal, routing/auth).
- [ ] Refactor Profile Section (Read, Edit, Avatar Upload, validation).
- [ ] Refactor Settings Section (Personal, Security, Notifications, Appearance, Danger Zone).
- [ ] Refactor Dashboard Section (KPI Cards, Trend Graphs, Activity Timeline).
- [ ] Connect and finalize detected subsystems (Documents, Chat, Notifications, Admin Space).
- [ ] Enforce the 8-Step Handler pattern globally across all user interactions.
- [ ] Ensure double validation (Frontend form validation + Backend schema validation).
- [ ] Polish UI/UX (Skeletons, empty states, responsiveness, animations).

## Module 4: Infrastructure & BDD
- [ ] Setup/Verify Google Cloud SQL Database Instance for the Sovereign Hub.
- [ ] Secure Database (SSL, IPs, custom users, automated backups).
- [ ] Implement Convex to PostgreSQL synchronization (`syncVersPostgres`).
- [ ] Configure PostgreSQL to Convex synchronization mapping.
- [ ] Verify environment variables structure (`.env.local`, `.env.production`).
- [ ] Conduct full connectivity tests locally and in production.
- [ ] Execute PostgreSQL schema migrations to match Convex data structures.

## Module 5: Nettoyage & Production
- [ ] Purify codebase (Remove orphan files, ghost imports, dead code, mock data completely).
- [ ] Run complete NEOCORTEX end-to-end health check.
- [ ] Optimize performance (Targeted memos, lazy loading, indexed queries).
- [ ] Apply final security patches (No client secrets, secure headers, strict roles check).
- [ ] Complete pre-deployment checklist (Favicon, SEO, 404, Error Boundaries).
- [ ] Deploy Convex backend functions to production.
- [ ] Deploy frontend to production hosting.
- [ ] Perform post-deployment verification (Crons, real-time sync, signals).
- [ ] Generate Final OMEGA Delivery Report.
