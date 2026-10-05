# 🌾 KilimoFlux

[![Swahilipot Hub Engineering](https://img.shields.io/badge/Swahilipot%20Hub-Engineering-orange?style=flat-square)](https://swahilipothub.co.ke)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square)](https://www.typescriptlang.org)
[![IoT Standard](https://img.shields.io/badge/IoT-LoRaWAN%20EU868-indigo?style=flat-square)](https://lora-alliance.org/)
[![Earth Observation](https://img.shields.io/badge/Satellite-Sentinel--2%20NDVI%20%2F%20NDWI-emerald?style=flat-square)](https://sentinels.copernicus.eu/)
[![AI Engine](https://img.shields.io/badge/AI-FAO--56%20ETc%20%26%20IPM%20Vision-violet?style=flat-square)](https://fao.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

**KilimoFlux** is an open-source smart agriculture platform engineered for smallholder and commercial farming across Kenya and East Africa. It unifies **open-source LoRaWAN IoT telemetry**, **Copernicus Sentinel-2 satellite remote sensing**, and **multimodal AI** to automate precision irrigation and provide instant crop pest and foliar disease diagnosis.

Developed by the community of volunteers, fellows, and mentors at **[Swahilipot Hub Foundation](https://swahilipothub.co.ke)** in Mombasa, Kenya.

---

## 📖 Table of Contents

1. [🎯 Project Vision & Context](#-project-vision--context)
2. [🏗️ Architectural & Infrastructural Design](#️-architectural--infrastructural-design)
   * [Layer 1: Field IoT & LoRaWAN Infrastructure](#1-field-iot--lorawan-infrastructure)
   * [Layer 2: Earth Observation & Satellite Remote Sensing](#2-earth-observation--satellite-remote-sensing)
   * [Layer 3: AI Decision Intelligence & Precision Irrigation](#3-ai-decision-intelligence--precision-irrigation)
   * [Layer 4: Application, Web GIS & Presentation](#4-application-web-gis--presentation)
3. [🔌 Hardware Reference & Sensor Pinout Guide](#-hardware-reference--sensor-pinout-guide)
4. [👥 Community Volunteer Contributor Tracks](#-community-volunteer-contributor-tracks)
5. [🚀 Quick Start (Developer Setup in 15 Minutes)](#-quick-start-developer-setup-in-15-minutes)
6. [📡 Complete API Reference](#-complete-api-reference)
7. [🧪 Testing & Validation](#-testing--validation)
8. [🐳 Docker & Production Deployment](#-docker--production-deployment)
9. [🤝 Community Governance & Pull Request Process](#-community-governance--pull-request-process)
10. [📄 License & Maintainers](#-license--maintainers)

---

## 🎯 Project Vision & Context

Agriculture accounts for over **33% of Kenya's GDP** and sustains over **70% of the rural population**. Despite this immense significance, Kenyan smallholders face severe systemic challenges:

1. **Unpredictable Weather & Severe Water Stress:** Over 80% of smallholders rely on rainfed agriculture or manual flood/bucket watering. Climate change has exacerbated dry spells, leading to either crop desiccation or nutrient leaching from over-watering.
2. **Devastating Pest Outbreaks:** Invasive pests such as the **Fall Armyworm (*Spodoptera frugiperda*)** and fungal pathogens like **Tomato Late Blight (*Phytophthora infestans*)** can wipe out up to 50% of a seasonal harvest before agricultural extension officers can visit remote farms.
3. **Rural Connectivity Gaps:** Cellular data (3G/4G GSM) is frequently patchy, expensive, and battery-intensive for field sensors located in rural shambas.
4. **Data Fragmentation:** Soil sensors, satellite imagery, and weather forecasts exist in disconnected silos. Farmers lack a unified, automated system that translates raw data into automated physical actuation (e.g. turning on irrigation valves) and plain-language agronomic advice.

**KilimoFlux solves this** by creating an open-source, low-cost technological stack combining **free, license-exempt LoRaWAN radio frequencies (EU868)**, **free open-access European Space Agency (ESA) Sentinel-2 satellite data**, and **physics-grounded AI engines** accessible to smallholders via web dashboards, SMS, and WhatsApp.

---

## 🏗️ Architectural & Infrastructural Design

KilimoFlux employs a modular, four-tier hybrid architecture combining edge field hardware, satellite constellations, core analytical pipelines, and user-facing delivery interfaces.

```mermaid
flowchart TD
    subgraph Layer 1: Field IoT & Edge Infrastructure
        S1[Soil VWC & Temp Probe<br/>RS485 / Modbus] -->|Analog/Digital| Node1[ESP32 / SX1262 LoRa Node]
        S2[NPK & Soil EC Sensor<br/>Optical / Resistive] -->|Analog/Digital| Node2[ESP32 / SX1262 LoRa Node]
        Node1 -->|Uplink 868 MHz| Gateway[LoRaWAN Gateway<br/>RAK / Dragino Outdoor]
        Node2 -->|Uplink 868 MHz| Gateway
        Gateway -->|MQTT / HTTPS| NetworkServer[ChirpStack v4 / TTN Server]
        Valve[9-12V Latching Solenoid Valve] <--|Class C Downlink| Gateway
    end

    subgraph Layer 2: Earth Observation & Satellite
        Constellation[Copernicus Sentinel-2 Constellation] -->|Optical Bands B04/B08/B8A/B11| CDSE[Copernicus Data Space API]
        CDSE -->|L2A Surface Reflectance| SatPipeline[Satellite Indices Engine<br/>NDVI • NDWI • NDRE]
    end

    subgraph Layer 3: KilimoFlux Core AI & Decision Engine
        NetworkServer -->|Webhook POST| Ingest[Telemetry Ingestion Service]
        Ingest --> FarmManager[Farm & Parcel State Store]
        SatPipeline --> FarmManager
        
        FarmManager --> FAO[FAO-56 Penman-Monteith ETc Engine]
        Weather[Weather Station & 24h Rain Forecast] --> Gating[Dynamic Rain Gating Safety]
        FAO --> Gating
        Gating -->|Autonomous Water Demand| ValveController[Irrigation Downlink Generator]
        ValveController -->|Class C Queue| NetworkServer
        
        FarmerPhoto[Farmer Leaf Photo / Symptoms] --> VisionAI[Plant Pathology Classifier]
        VisionAI --> IPM[Integrated Pest Management & PCPB Registry]
    end

    subgraph Layer 4: Application & Presentation
        FarmManager --> SSE["/api/v1/farms/stream (Server-Sent Events)"]
        SSE --> WebGIS[Leaflet Satellite Web GIS Dashboard]
        IPM --> WebGIS
        IPM --> AlertBus[Africa's Talking SMS / WhatsApp Gateway]
        AlertBus --> SmallholderPhone[Smallholder Feature Phone]
    end
```

---

### 1. Field IoT & LoRaWAN Infrastructure

* **Radio Spectrum & Regulations:** Operates on **EU868 (863–870 MHz)**, the harmonized frequency band designated by the **Communications Authority of Kenya (CAK)** for license-free short-range IoT telecommunications.
* **Transmission Range:** 10–15 km Line-of-Sight (LoS) between outdoor gateways and field sensor nodes, easily covering dozens of surrounding smallholder farms.
* **Network Server Integration:** Native webhook and MQTT payload ingestion adapters for **ChirpStack v4** (self-hosted open-source) and **The Things Network (TTN)**.
* **Binary Telemetry Codecs:** Custom high-efficiency binary encoders compressing 6 key parameters (VWC, temperature, EC, battery voltage, pH, NPK) into an 8-to-12 byte uplink packet, conserving battery life and airtime duty cycle (<1%).
* **Actuation Downlink Protocol:** Generates Class A / Class C downlink buffers containing operation opcodes (`0x01` OPEN, `0x00` CLOSE), runtime duration in minutes, and checksum verification bytes.

---

### 2. Earth Observation & Satellite Remote Sensing

* **Constellation & Platform:** European Space Agency (ESA) **Copernicus Sentinel-2 (Sentinel-2A & Sentinel-2B)** multispectral instrument (MSI).
* **Spatial & Temporal Resolution:** 10m Ground Sample Distance (GSD) for visible and Near-Infrared (NIR) bands, with a 5-day revisit cycle over Kenya.
* **Processed Spectral Indices:**
  * **NDVI (Normalized Difference Vegetation Index):**
    $$\text{NDVI} = \frac{B_{08} (\text{NIR}) - B_{04} (\text{Red})}{B_{08} (\text{NIR}) + B_{04} (\text{Red})}$$
    Measures overall photosynthetic canopy vigor, leaf biomass, and crop establishment.
  * **NDWI (Normalized Difference Water Index / Gao 1996):**
    $$\text{NDWI} = \frac{B_{08} (\text{NIR}) - B_{11} (\text{SWIR})}{B_{08} (\text{NIR}) + B_{11} (\text{SWIR})}$$
    Detects canopy moisture content and liquid water absorption in spongy mesophyll tissues, providing early warning of water stress before visible wilting.
  * **NDRE (Normalized Difference Red Edge):**
    $$\text{NDRE} = \frac{B_{08} (\text{NIR}) - B_{8A} (\text{Narrow NIR})}{B_{08} (\text{NIR}) + B_{8A} (\text{Narrow NIR})}$$
    Measures chlorophyll content in mature crops where standard NDVI saturates.
* **Cloud Masking:** Automatic filtering of scenes with $>35\%$ cloud cover and shadow artifacts to prevent corrupted time-series trends.

---

### 3. AI Decision Intelligence & Precision Irrigation

* **FAO-56 Penman-Monteith Evapotranspiration ($ET_c$):**
  Calculates reference crop evapotranspiration based on net solar radiation, ambient temperature, relative humidity, and wind speed:
  $$ET_0 = R_n \text{ (radiation equivalent)} + 0.012 (T + 5) u_2 \left(\frac{100 - RH}{100}\right)$$
  Multiplied dynamically by crop-specific coefficients ($K_c$) based on phenological stage:
  $$ET_c = K_c \times ET_0$$
* **Multimodal Data Fusion:** Combines ground-level root-zone soil moisture (%) with satellite NDWI. If satellite detects canopy stress ($\text{NDWI} < -0.15$), safety water buffer multipliers are applied.
* **Dynamic Rain Gating:** If weather forecasts predict $\ge 5\text{mm}$ of rainfall in the next 24 hours, scheduled irrigation cycles are automatically paused to conserve water, energy, and soil nutrients.
* **Computer Vision Pathology Engine:** Evaluates foliar disease symptoms and leaf photographs against trained agricultural models for African staples (Maize Fall Armyworm, MLND, Tomato Late Blight, Tuta Absoluta, Cassava Mosaic).
* **Integrated Pest Management (IPM) & PCPB Advisory:** Pairs every diagnosis with:
  1. *Cultural & Organic remedies* (neem extract, ash dusting, push-pull intercropping, parasitoids).
  2. *Kenya Pest Control Products Board (PCPB)* registered agrochemicals with exact dosage and Pre-Harvest Intervals (PHI in days).

---

### 4. Application, Web GIS & Presentation

* **Reactive Web GIS Dashboard:** Zero-build vanilla JavaScript and Leaflet with satellite imagery basemap (Esri World Imagery), visualizing farm polygon health heatmaps, real-time gauges, and live valve statuses.
* **Server-Sent Events (SSE):** Persistent HTTP streaming (`/api/v1/farms/stream`) delivering sub-second sensor updates to connected dashboards without heavy polling.
* **Smallholder SMS & WhatsApp Bridge:** Extensible architecture designed to broadcast high-priority alerts and accept diagnosis images via low-cost mobile messaging channels.

---

## 🔌 Hardware Reference & Sensor Pinout Guide

For volunteers working on the embedded IoT track, here is the reference circuit wiring for a KilimoFlux field node:

```
                      +-----------------------------+
                      |   Solar Panel (5V / 2W)     |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | TP4056 Solar Charge Module  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | 18650 LiFePO4 Battery 3.7V |
                      +--------------+--------------+
                                     |
+------------------------------------+------------------------------------+
|                                    v                                    |
|                      +---------------------------+                      |
|                      | ESP32-WROOM-32 / RP2040   |                      |
|                      +-------------+-------------+                      |
|                                    |                                    |
|       SPI Bus                      | I2C / UART / RS485                 |
|       (SCK, MISO, MOSI, NSS)       | (GPIO 21, 22 / RS485 MAX485)       |
|                                    |                                    |
|   +-------------------+            |            +-------------------+   |
|   | SX1262 LoRa Radio |            |            | RS485 Modbus Soil |   |
|   | Transceiver Module|            |            | Moisture/Temp/EC  |   |
|   | (868 MHz Antenna) |            |            +-------------------+   |
|   +-------------------+            |                                    |
|                                    | GPIO 16 (Digital Trigger)          |
|                                    v                                    |
|                      +---------------------------+                      |
|                      | Latching Solenoid Driver  |                      |
|                      | (H-Bridge / Dual NPN)     |                      |
|                      +-------------+-------------+                      |
|                                    |                                    |
+------------------------------------+------------------------------------+
                                     v
                       +---------------------------+
                       | 9-12V Latching Solenoid   |
                       | Drip Irrigation Valve     |
                       +---------------------------+
```

### Standard Sensor Parameter Specifications
* **Volumetric Water Content (VWC):** Range $0\% - 100\%$, Accuracy $\pm 2\%$.
* **Soil Temperature:** Range $-20^\circ\text{C}$ to $+70^\circ\text{C}$, Accuracy $\pm 0.5^\circ\text{C}$.
* **Electrical Conductivity (EC):** Range $0 - 20{,}000\ \mu\text{S/cm}$ (Salinity and nutrient proxy).
* **Macronutrients (N-P-K):** Optical absorption / electrochemical probe in $\text{mg/kg}$.

---

## 👥 Community Volunteer Contributor Tracks

Swahilipot Hub volunteers are organized into four dedicated technical tracks. Choose the track that aligns with your skills or learning goals:

```
                                  KILIMOFLUX TRACKS
                                          │
       ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
       ▼                  ▼                               ▼                  ▼
┌──────────────┐   ┌──────────────┐                ┌──────────────┐   ┌──────────────┐
│   Track A    │   │   Track B    │                │   Track C    │   │   Track D    │
│  IoT & LoRa  │   │ Satellite &  │                │ AI & Science │   │  Web, Mobile │
│   Hardware   │   │     GIS      │                │  (Agronomy)  │   │    & Bots    │
└──────────────┘   └──────────────┘                └──────────────┘   └──────────────┘
```

### 🔌 Track A: Embedded Systems & LoRaWAN Hardware
* **Focus:** Developing low-power sensor node firmware (C++ / Arduino / FreeRTOS), battery conservation, antenna tuning, and gateway deployments.
* **Starter Tasks:**
  * Implement Dragino LSE01 / Milesight EM500 binary codecs ([Issue #8](https://github.com/Swahilipot-Hub-Engineering/kilimoflux/issues/8)).
  * Design 3D-printable weatherproof (IP67) enclosures for shamba nodes.
  * Optimize deep-sleep current draw ($<15\ \mu\text{A}$) on ESP32 nodes.

### 🛰️ Track B: Satellite Remote Sensing & GIS
* **Focus:** Copernicus Open Access API integrations, polygon parcel clipping, cloud masking, and vegetative time-series analysis.
* **Starter Tasks:**
  * Build the Copernicus Data Space OAuth2 integration client ([Issue #9](https://github.com/Swahilipot-Hub-Engineering/kilimoflux/issues/9)).
  * Implement automated GeoJSON bounding box spatial intersections with Turf.js.
  * Calculate zonal crop statistics for county-level agricultural boards.

### 🤖 Track C: AI, Data Science & Agronomy
* **Focus:** Evapotranspiration physics models, computer vision disease classification, and local agronomic dataset curation.
* **Starter Tasks:**
  * Expand the African crop pathogen knowledge base for Coffee Berry Disease and Leaf Rust ([Issue #14](https://github.com/Swahilipot-Hub-Engineering/kilimoflux/issues/14)).
  * Fine-tune a lightweight MobileNetV3 / YOLOv11 model on field photos of Fall Armyworm and Tomato Blight.
  * Map PCPB (Pest Control Products Board) agrochemical guidelines to seasonal crop calendars.

### 💻 Track D: Full-Stack Web, Mobile & Alert Bots
* **Focus:** Interactive web GIS dashboard, real-time event streaming, responsive UI/UX, and SMS/WhatsApp messaging integrations.
* **Starter Tasks:**
  * Add 7-day soil moisture and temperature time-series graphs with Chart.js ([Issue #11](https://github.com/Swahilipot-Hub-Engineering/kilimoflux/issues/11)).
  * Build an Africa's Talking SMS and WhatsApp emergency alert webhook ([Issue #12](https://github.com/Swahilipot-Hub-Engineering/kilimoflux/issues/12)).
  * Implement offline PWA service workers for field extension officers.

---

## 🚀 Quick Start (Developer Setup in 15 Minutes)

### Prerequisites
* **Node.js 20+** installed (`node -v`)
* **npm** (`npm -v`)
* **Git** installed and configured

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Swahilipot-Hub-Engineering/kilimoflux.git
cd kilimoflux
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```
*(The default `.env` configuration works out-of-the-box for local development with mock data).*

### 3. Run Automated Tests

Ensure your local environment passes all 20 unit and integration tests:

```bash
npm test
```

### 4. Start Development Server

```bash
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)** to view the live dashboard!

### 5. Launch the Multi-Farm Telemetry Simulator

In a separate terminal window, start the telemetry generator:

```bash
npm run simulate
```

You will immediately see synthetic LoRaWAN packets flowing into the engine from farms in Kilifi, Naivasha, and Eldoret, with live updates reflecting on your browser dashboard via Server-Sent Events!

---

## 📡 Complete API Reference

### 1. IoT & Telemetry Ingestion

#### `POST /api/v1/telemetry/lorawan`
Ingests ChirpStack or TTN webhook uplinks:
```bash
curl -X POST http://localhost:3000/api/v1/telemetry/lorawan \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "farm-kilifi-01",
    "parcelId": "parcel-kilifi-cassava",
    "end_device_ids": { "dev_eui": "A84041000181A001" },
    "uplink_message": {
      "f_port": 2,
      "decoded_payload": { "soil_moisture": 24.2, "temperature": 27.5, "ec": 380, "battery": 3610 }
    }
  }'
```

#### `POST /api/v1/telemetry/raw`
Direct JSON ingest from custom microcontrollers or gateway scripts:
```bash
curl -X POST http://localhost:3000/api/v1/telemetry/raw \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "farm-kilifi-01",
    "parcelId": "parcel-kilifi-tomato",
    "vwc": 22.5,
    "temperature": 26.8,
    "ec": 395,
    "battery": 3650
  }'
```

---

### 2. Precision Irrigation & Actuation

#### `GET /api/v1/irrigation/recommendations[?farmId=farm-kilifi-01]`
Returns multimodal FAO-56 deficit calculations, crop coefficients, runtime recommendations, and rain gating flags:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "zoneId": "zone-kilifi-z1",
      "cropType": "CASSAVA",
      "growthStage": "MID_SEASON",
      "currentVwc": 21.5,
      "targetVwc": 35.0,
      "soilMoistureDeficitMm": 10.8,
      "faoEtcMmDay": 5.46,
      "cropCoefficientKc": 1.05,
      "satelliteNdwiSupport": 0.22,
      "recommendedRuntimeMinutes": 24,
      "estimatedWaterLiters": 14400,
      "weatherGated": false,
      "status": "RECOMMENDED"
    }
  ]
}
```

#### `POST /api/v1/irrigation/zones/:id/actuate`
Sends an actuation command and generates the LoRaWAN downlink buffer:
```bash
curl -X POST http://localhost:3000/api/v1/irrigation/zones/zone-kilifi-z1/actuate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "OPEN",
    "durationMinutes": 30,
    "triggeredBy": "MANUAL_OVERRIDE"
  }'
```

---

### 3. Satellite Remote Sensing

#### `GET /api/v1/satellite/observations/:parcelId`
Returns historical Sentinel-2 observations with NDVI, NDWI, NDRE, and canopy health ratings.

#### `POST /api/v1/satellite/analyze`
Accepts raw multispectral surface reflectance bands ($B_{02}, B_{03}, B_{04}, B_{08}, B_{8A}, B_{11}$) and returns calculated indices with cloud validation.

---

### 4. AI Plant Pathology & Pest Diagnosis

#### `POST /api/v1/pest-diagnosis/analyze`
Evaluates symptoms or image metadata and generates localized Integrated Pest Management (IPM) advisories:
```bash
curl -X POST http://localhost:3000/api/v1/pest-diagnosis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "cropType": "TOMATO",
    "affectedPart": "LEAF",
    "symptomNotes": "Water soaked brown lesions on leaf tips with white cottony mold"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cropType": "TOMATO",
    "detectedPathogen": {
      "commonName": "Late Blight",
      "scientificName": "Phytophthora infestans",
      "type": "FUNGAL"
    },
    "confidenceScore": 0.88,
    "urgency": "HIGH",
    "ipmAdvice": {
      "culturalAndOrganic": [
        "Spray copper hydroxide / Bordeaux mixture (30g/10L)",
        "Remove lower foliage to improve air circulation",
        "Avoid overhead sprinkler irrigation; switch to drip"
      ],
      "chemicalControls": [
        "Metalaxyl + Mancozeb (e.g. Ridomil Gold) as preventive spray",
        "Cymoxanil + Propineb for systemic curative action"
      ],
      "pcpbRecommendedProducts": ["PCPB(CR)0412", "PCPB(CR)1158"],
      "preHarvestIntervalDays": 14
    }
  }
}
```

---

## 🧪 Testing & Validation

KilimoFlux enforces high test coverage across mathematical physics, binary decoders, and REST APIs:

```bash
# Run unit and integration tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Validate TypeScript type consistency
npm run typecheck

# Build compiled production distribution
npm run build
```

---

## 🐳 Docker & Production Deployment

Run the complete platform via Docker Compose:

```bash
docker compose up --build -d
```

Verify service logs:
```bash
docker compose logs -f kilimoflux
```

Check health status:
```bash
curl http://localhost:3000/api/v1/health
```

---

## 🤝 Community Governance & Pull Request Process

We welcome community members of all experience levels!

1. **Find an Issue:** Browse our [Good First Issues](https://github.com/Swahilipot-Hub-Engineering/kilimoflux/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) and ask to be assigned.
2. **Branching Model:**
   * Create a feature branch off `staging`: `git checkout -b feat/your-feature-name staging`.
   * **Never commit directly to `main` or target `main` in feature PRs.** All development merges into `staging`.
3. **Commit Standards:** Use Conventional Commits (`feat(iot): add dragino codec`, `fix(irrigation): correct deficit rounding`).
4. **Automated Verification:** Ensure `npm test` and `npm run typecheck` pass cleanly before pushing.
5. **Open Pull Request:** Target the **`staging`** branch. Our CI workflow will automatically test and build your changes.

For full guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/ONBOARDING.md](docs/ONBOARDING.md).

---

## 📄 License & Maintainers

This project is open-source under the [MIT License](LICENSE).

| Role | Person / Team | Contact |
| :--- | :--- | :--- |
| **Maintainer** | [@jkose002](https://github.com/jkose002) | Core Architecture & Engine Design |
| **Mentors** | [@Swahilipot-Hub-Engineering/mentors](https://github.com/orgs/Swahilipot-Hub-Engineering/teams/mentors) | Community Onboarding & Code Review |
| **Community** | **Swahilipot Hub Foundation** | [swahilipothub.co.ke](https://swahilipothub.co.ke) • Mombasa, Kenya |
