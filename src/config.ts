import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',

  // LoRaWAN Regional Parameters (Kenya uses EU868 standard under CAK guidelines)
  lorawan: {
    region: process.env.LORAWAN_REGION || 'EU868',
    defaultAppEUI: process.env.LORAWAN_APP_EUI || '70B3D57ED0000000',
    downlinkFPort: parseInt(process.env.LORAWAN_DOWNLINK_FPORT || '10', 10),
    maxActuationDurationMinutes: 120, // Hardware safety cutoff
    minBatteryMillivolts: 3300 // Low battery warning threshold
  },

  // Agricultural Irrigation & Physics Thresholds
  irrigation: {
    // Default volumetric water content thresholds (%)
    defaultMinVwc: 25.0,
    defaultMaxVwc: 45.0,
    // Rain gating: if forecasted rain in next 24h exceeds this amount, skip irrigation
    rainGatingThresholdMm: 5.0,
    // Minimum deficit required to trigger valve open (avoids micro-watering)
    minDeficitToTriggerMm: 2.5,
    // Standard drip irrigation efficiency (90% for drip systems)
    dripEfficiencyFactor: 0.90
  },

  // Satellite Remote Sensing Config
  satellite: {
    maxCloudCoverPercent: 35.0,
    defaultProvider: 'SENTINEL_2',
    ndviHealthyThreshold: 0.50,
    ndwiWaterStressThreshold: -0.15
  },

  // Geographic Bounding Box for Kenya (47 Counties)
  kenyaBoundingBox: {
    minLat: -4.8,
    maxLat: 5.5,
    minLon: 33.9,
    maxLon: 41.9
  }
};
