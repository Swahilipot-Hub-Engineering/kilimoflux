# Onboarding — KilimoFlux

Welcome to **KilimoFlux**! This guide will get you up and running in under 15 minutes.

## Prerequisites
- Node.js 20+ (`node -v`)
- npm 10+ (`npm -v`)
- Git

## Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Swahilipot-Hub-Engineering/kilimoflux.git
   cd kilimoflux
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Run the automated test suite:**
   ```bash
   npm test
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

6. **Start the multi-farm telemetry simulator:**
   ```bash
   npm run simulate
   ```

## Where to Start Contributing
- **IoT & Hardware:** Add decoders for new agricultural sensors in `src/iot/decoder.ts`.
- **Agronomy & Plant Pathology:** Expand the African crop disease knowledge base in `src/ai/pest-diagnosis.ts`.
- **Satellite Remote Sensing:** Improve cloud masking or parcel clipping in `src/satellite/`.
- **Frontend & GIS:** Enhance the Leaflet map layers in `src/public/app.js`.
