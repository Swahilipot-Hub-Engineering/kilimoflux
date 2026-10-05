# ADR-0002: LoRaWAN, Sentinel-2 Satellite, and Multimodal AI Architecture

- **Status:** Accepted
- **Date:** 2026-10-05
- **Deciders:** @jkose002

## Context
Kenyan agriculture suffers from erratic rainfall, high water stress, and devastating pest outbreaks (e.g. Fall Armyworm). Cellular IoT solutions (3G/4G GSM) face high recurring SIM data fees and rural signal blackouts. At the same time, satellite imagery alone lacks root-zone soil resolution for smallholder plots (0.5 to 2 acres).

## Decision
We adopt a three-tier architecture:
1. **IoT:** Open-source LoRaWAN operating under Communications Authority of Kenya (CAK) EU868 standard. Battery/solar nodes measure root-zone soil moisture and actuate Class C latching solenoid valves without cellular dependencies.
2. **Satellite:** Copernicus Sentinel-2 multispectral imagery (B04, B08, B11) processed every 5 days for macro canopy vigor (NDVI) and water stress (NDWI).
3. **AI:** Fused FAO-56 Penman-Monteith Evapotranspiration engine ($ET_c = K_c \times ET_0$) with 24-hour weather forecast gating, coupled with a lightweight computer vision plant pathology classifier delivering Integrated Pest Management (IPM) advisories.

## Alternatives Considered
- **GSM / Cellular per Sensor Node:** High monthly SIM subscriptions ($2–5/SIM/month) make multi-node deployments cost-prohibitive for smallholder cooperatives.
- **Pure Satellite-based Irrigation:** 10m Sentinel-2 pixels cannot measure root-zone moisture or detect micro-deficits before visual leaf wilting occurs.
- **Pure Schedule-based Timers:** Ignores real soil moisture and runs during rain, wasting scarce water and leaching fertilizers.

## Consequences
- **Positive:** Low power, free radio spectrum, fused macro/micro intelligence, fail-safe valve downlinks, and actionable pest diagnosis.
- **Trade-offs:** Requires initial LoRaWAN gateway setup within 10–15km of the farm cluster.
