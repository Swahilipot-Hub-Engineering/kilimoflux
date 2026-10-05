# AGENTS.md — guide for AI coding agents

Context for GitHub Copilot, the Copilot app, and any other coding agent working in this
repository. **Keep it accurate** — a stale instruction here is worse than none.

> Human contributors: read [CONTRIBUTING.md](CONTRIBUTING.md) instead.

## Project summary

**KilimoFlux** is an open-source smart agriculture platform integrating LoRaWAN IoT telemetry, Copernicus Sentinel-2 satellite remote sensing, AI precision irrigation, and crop pest diagnosis for Kenyan smallholders. Built with Node.js 20+, TypeScript, Express, and Leaflet.

## Commands — use exactly these

| Task | Command | Notes |
| --- | --- | --- |
| Install | `npm install` | Uses package.json / package-lock.json |
| Dev server | `npm run dev` | Serves on port `3000` with hot-reload via tsx |
| Simulator | `npm run simulate` | Streams mock LoRaWAN sensor uplinks |
| Build | `npm run build` | Compiles TypeScript via `tsc` into `dist/` |
| Typecheck | `npm run typecheck` | `tsc --noEmit` |
| Test (all) | `npm test` | Runs vitest test suite |
| Test (one file) | `npx vitest run tests/api.test.ts` | Target specific test file |

Do **not** invent scripts. Check `package.json` first.

## Repository layout

```
src/
  models/       # TypeScript types for telemetry, satellite, irrigation, and pathology
  config/       # Environment, LoRa EU868, and agricultural physical thresholds
  iot/          # LoRaWAN binary decoders (Dragino/Milesight) and downlink encoders
  satellite/    # Sentinel-2 multispectral indices (NDVI, NDWI, NDRE) and parcel profiling
  ai/           # FAO-56 Penman-Monteith ETc, rain gating, and crop pest diagnosis
  engine/       # Farm state manager, event emitter, and seed farms
  routes/       # Express route handlers (/telemetry, /irrigation, /satellite, /pest-diagnosis, /farms)
  simulator/    # Mock telemetry simulator runner for local development
  public/       # Mobile-first interactive Leaflet web GIS dashboard
docs/           # Architecture, onboarding, runbook, ADRs
tests/          # Vitest automated test suite (lorawan, irrigation, satellite, pest, api)
.github/        # CI workflows, branch policy, issue templates, labels
```

## Conventions

- **Language:** TypeScript 5.7+ in strict mode. Use ES Modules (`import`/`export`), explicit types, and avoid `any`.
- **Imports:** Relative ESM paths ending in `.js` (e.g. `import { farmManager } from '../engine/farm-manager.js'`).
- **Commits:** Conventional Commits — `feat(scope): description`.
- **Branches:** Branch from `staging`, name `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- **Pull requests:** Always target `staging`, never `main`.

## Rules for agents

**Always**
- Run `npm test` and `npm run typecheck` after changing code.
- Keep changes surgical and scoped.
- Update `README.md` and documentation when changing interfaces.
