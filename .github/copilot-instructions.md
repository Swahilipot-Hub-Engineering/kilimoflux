# KilimoFlux — Copilot Instructions

GitHub Copilot loads this file automatically as context for this repository.
See [`AGENTS.md`](../AGENTS.md) for the full agent contract.

## Big picture

- **KilimoFlux** is an open-source smart agriculture platform integrating LoRaWAN IoT telemetry, Copernicus Sentinel-2 satellite remote sensing, AI precision irrigation, and crop pest diagnosis.
- **Stack:** Node.js 20+, TypeScript, Express, Leaflet, Vitest.
- **Entry points:** Server: `src/server.ts`, Simulator: `src/simulator/runner.ts`, Web UI: `src/public/index.html` + `src/public/app.js`.
- Target `staging` in pull requests; `main` is production.

## Key concepts

- **LoRaWAN Decoders:** `src/iot/decoder.ts` handles Dragino/Milesight binary sensor packets and ChirpStack/TTN webhooks.
- **Evapotranspiration:** `src/ai/fao-irrigation.ts` computes FAO-56 $ET_0$ and $ET_c = K_c \times ET_0$ with 24h rain gating.
- **Satellite Indices:** `src/satellite/indices.ts` computes NDVI, NDWI, and NDRE.
- **Pathology AI:** `src/ai/pest-diagnosis.ts` provides diagnosis and PCPB Kenya approved IPM remedies.
