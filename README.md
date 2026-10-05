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

Built with ❤️ by the engineering community at **[Swahilipot Hub Foundation](https://swahilipothub.co.ke)** in Mombasa, Kenya.

---

## 🎯 Challenges in Kenyan Agriculture

Agriculture generates over 33% of Kenya's GDP and employs over 70% of the rural workforce. Yet farmers face severe systemic obstacles:

* **Irrigation Inefficiency & Drought Stress:** Over 80% of smallholders rely on rainfed farming or manual flood/bucket watering, leading to severe crop water stress or wasteful over-watering.
* **Delayed Pest & Pathogen Diagnosis:** Invasive pests like **Fall Armyworm (*Spodoptera frugiperda*)** and fungal blights destroy up to 40% of seasonal yields before extension officers or agronomists can visit the farm.
* **Connectivity Dead Zones:** Cellular networks (3G/4G) are patchy in rural shambas, making cellular-only IoT solutions cost-prohibitive and unreliable.
* **Isolated Data Silos:** Soil sensors, weather stations, and satellite indices are rarely fused into an actionable, automated decision loop for the farmer.

---

## 💡 What KilimoFlux Does

```mermaid
flowchart TD
    subgraph Ground Truth - LoRaWAN IoT Layer
        S1[Soil Moisture VWC & Temp Node] -->|Uplink EU868| GW[ChirpStack / TTN Gateway]
        S2[NPK & Soil EC Sensor] -->|Uplink EU868| GW
        GW -->|Webhook / MQTT| Core[KilimoFlux Core Engine]
        V1[Latching Solenoid Valve] <--|Downlink Class C| GW
    end

    subgraph Macro Scale - Earth Observation
        SAT[Copernicus Sentinel-2 / Landsat] -->|Multispectral B04/B08/B11| SatProc[Satellite Indices Pipeline]
        SatProc -->|NDVI / NDWI / NDRE| Core
    end

    subgraph AI Decision Intelligence
        Core --> FAO[FAO-56 Penman-Monteith ETc Engine]
        Weather[Hyperlocal Weather & 24h Rain Forecast] --> Gating[Rain Gating Controller]
        Photo[Farmer Mobile Leaf Photo] --> Vision[AI Plant Pathology Classifier]
        Vision --> IPM[Integrated Pest Management & PCPB Advisory]
    end

    subgraph Distribution & Action
        FAO --> Gating
        Gating -->|Auto Trigger| V1
        Core --> WebUI[Interactive Web GIS Dashboard]
        IPM --> WebUI
        IPM --> SMS[WhatsApp / USSD / SMS Alerts]
    end
```

### 1. Ground IoT & Actuation (LoRaWAN)
* **Long-Range, Low-Power:** 10–15km radius per gateway operating under Communications Authority of Kenya (CAK) EU868 regulations.
* **Multi-Parametric Soil Sensing:** Continuous telemetry for Volumetric Water Content (VWC %), temperature, electrical conductivity (EC), and NPK macronutrients.
* **Automated Valve Actuation:** Class A/C downlinks control DC latching solenoid valves per irrigation zone with hardware safety cutoffs.

### 2. Macro-Scale Remote Sensing (Sentinel-2)
* **Automated Spectral Indices:**
  * **NDVI** (Normalized Difference Vegetation Index): Chlorophyll vigor and biomass density.
  * **NDWI** (Normalized Difference Water Index): Canopy water stress and leaf moisture deficit.
  * **NDRE** (Normalized Difference Red Edge): Nitrogen status in dense canopies.
* **Cloud Masking & Parcel Profiling:** Automated filtering of clouds and shadows to maintain valid agricultural time series.

### 3. AI Precision Irrigation & Pest Management
* **FAO-56 Penman-Monteith Evapotranspiration:** Computes reference $ET_0$ and dynamic crop water demand ($ET_c = K_c \times ET_0$) fused with ground soil moisture and satellite NDWI.
* **Hyperlocal Rain Gating:** Prevents unnecessary watering if precipitation $\ge 5\text{mm}$ is forecast within 24 hours.
* **Computer Vision Pathology:** Automated diagnosis of Fall Armyworm, Maize Lethal Necrosis (MLND), Tomato Late Blight, Tuta Absoluta, and Cassava Mosaic Disease with organic remedies and Pest Control Products Board (PCPB) registered treatments.

---

## 🗺️ Seed Farms & Locations

| Farm | County | Dominant Crops | Soil Type | System Setup |
| :--- | :--- | :--- | :--- | :--- |
| **Kilifi Coastal Shamba** | Kilifi (Pwani) | Tajirika Cassava, Kilele Tomato | Sandy Loam | LoRaWAN Soil Node + Drip Solenoid Valves |
| **Naivasha Precision Greens** | Nakuru (Rift Valley) | Export French Beans, Tomatoes | Clay Loam | Greenhouse Multi-Zone Drip System |
| **Eldoret Highland Shamba** | Uasin Gishu (North Rift) | H614D Hybrid Maize | Red Volcanic | Center Pivot + Rain Gauges |

---

## 🚀 Quick Start

### Prerequisites
* **Node.js 20+** (`node -v`)
* **npm** (`npm -v`)
* **Git**

### 1. Clone & Install

```bash
git clone https://github.com/Swahilipot-Hub-Engineering/kilimoflux.git
cd kilimoflux
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

### 3. Start Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser to explore the interactive dashboard!

### 4. Run the Farm Telemetry Simulator

In another terminal window:

```bash
npm run simulate
```

Simulates real-time LoRaWAN uplink packets, soil moisture evaporation, and automated valve actuations across Kenyan shambas.

---

## 🐳 Docker Deployment

Run with Docker Compose:

```bash
docker compose up --build -d
```

Verify service health:
```bash
curl http://localhost:3000/api/v1/health
```

---

## 📡 API Reference

### 1. IoT & Telemetry Ingestion

#### `POST /api/v1/telemetry/lorawan`
Ingests ChirpStack or The Things Network (TTN) webhook uplinks:

```json
{
  "farmId": "farm-kilifi-01",
  "parcelId": "parcel-kilifi-cassava",
  "end_device_ids": { "dev_eui": "A84041000181A001" },
  "uplink_message": {
    "f_port": 2,
    "decoded_payload": { "soil_moisture": 26.5, "temperature": 27.2, "ec": 380, "battery": 3620 }
  }
}
```

#### `POST /api/v1/telemetry/raw`
Direct JSON ingestion from custom gateways or microcontrollers.

---

### 2. Precision Irrigation & Actuation

#### `GET /api/v1/irrigation/recommendations`
Returns AI-calculated crop water deficits, FAO-56 $ET_c$, runtime minutes, and weather gating status.

#### `POST /api/v1/irrigation/zones/:id/actuate`
Commands a valve to open or close and generates a LoRaWAN downlink payload:

```json
{
  "action": "OPEN",
  "durationMinutes": 30,
  "triggeredBy": "AUTONOMOUS_AI"
}
```

---

### 3. Satellite Remote Sensing

#### `GET /api/v1/satellite/observations/:parcelId`
Returns historical Sentinel-2 observations (NDVI, NDWI, NDRE, canopy status).

#### `POST /api/v1/satellite/analyze`
Computes surface reflectance indices for raw multi-spectral bands.

---

### 4. AI Plant Pathology & Pest Diagnosis

#### `POST /api/v1/pest-diagnosis/analyze`
Evaluates leaf symptoms or photos and returns actionable Integrated Pest Management (IPM) guidelines:

```json
{
  "cropType": "MAIZE",
  "affectedPart": "LEAF",
  "symptomNotes": "Ragged holes in leaf whorls with sawdust frass"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "detectedPathogen": {
      "commonName": "Fall Armyworm",
      "scientificName": "Spodoptera frugiperda",
      "type": "PEST"
    },
    "confidenceScore": 0.88,
    "urgency": "CRITICAL",
    "ipmAdvice": {
      "culturalAndOrganic": [
        "Apply neem seed extract (50g/L water) into whorls early morning",
        "Apply fine sand or wood ash into funnel to suffocate larvae"
      ],
      "chemicalControls": [
        "Emamectin benzoate (50g/ha) targeting young instars"
      ],
      "pcpbRecommendedProducts": ["PCPB(CR)1542"],
      "preHarvestIntervalDays": 7
    }
  }
}
```

---

## 🧪 Testing & Validation

Run the test suite:

```bash
# Run all unit and integration tests
npm test

# Typecheck TypeScript
npm run typecheck

# Build production bundle
npm run build
```

---

## 🤝 Contributing

We warmly welcome contributions from developers, agronomists, IoT hardware makers, and GIS specialists across Kenya and worldwide!

* Read [CONTRIBUTING.md](CONTRIBUTING.md) for our pull request process and branching strategy (`feat/*` → `staging` → `main`).
* Read [docs/ONBOARDING.md](docs/ONBOARDING.md) for quick setup.
* Read [AGENTS.md](AGENTS.md) if working with AI coding agents.

---

## 👥 Maintainers

| Role | Person | Focus |
| :--- | :--- | :--- |
| **Maintainer** | [@jkose002](https://github.com/jkose002) | Core Architecture, IoT Ingestion & AI Engines |
| **Mentors** | [@Swahilipot-Hub-Engineering/mentors](https://github.com/orgs/Swahilipot-Hub-Engineering/teams/mentors) | Community Onboarding & Good First Issues |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Built with ❤️ by the **Swahilipot Hub Engineering Community** in Mombasa, Kenya.
