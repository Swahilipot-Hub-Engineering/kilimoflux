import {
  CropType,
  GrowthStage,
  SoilType,
  IrrigationRecommendation,
  IrrigationZone,
  Parcel,
  WeatherTelemetry,
  SoilTelemetry,
  SatelliteObservation
} from '../models/types.js';
import { config } from '../config.js';

/**
 * FAO-56 Crop Coefficients (Kc) for typical East African crops
 */
export const CROP_KC_TABLE: Record<CropType, Record<GrowthStage, number>> = {
  MAIZE: {
    INITIAL: 0.35,
    DEVELOPMENT: 0.75,
    MID_SEASON: 1.20,
    LATE_SEASON: 0.80,
    HARVEST: 0.50
  },
  TOMATO: {
    INITIAL: 0.60,
    DEVELOPMENT: 0.85,
    MID_SEASON: 1.15,
    LATE_SEASON: 0.80,
    HARVEST: 0.60
  },
  CASSAVA: {
    INITIAL: 0.30,
    DEVELOPMENT: 0.65,
    MID_SEASON: 1.05,
    LATE_SEASON: 0.70,
    HARVEST: 0.50
  },
  FRENCH_BEANS: {
    INITIAL: 0.40,
    DEVELOPMENT: 0.70,
    MID_SEASON: 1.10,
    LATE_SEASON: 0.85,
    HARVEST: 0.50
  },
  COFFEE: {
    INITIAL: 0.90,
    DEVELOPMENT: 0.95,
    MID_SEASON: 1.05,
    LATE_SEASON: 0.95,
    HARVEST: 0.90
  },
  KALE_SUKUMA: {
    INITIAL: 0.70,
    DEVELOPMENT: 0.85,
    MID_SEASON: 1.05,
    LATE_SEASON: 0.95,
    HARVEST: 0.70
  },
  ONION: {
    INITIAL: 0.50,
    DEVELOPMENT: 0.75,
    MID_SEASON: 1.05,
    LATE_SEASON: 0.75,
    HARVEST: 0.40
  },
  WATERMELON: {
    INITIAL: 0.40,
    DEVELOPMENT: 0.70,
    MID_SEASON: 1.00,
    LATE_SEASON: 0.75,
    HARVEST: 0.50
  }
};

/**
 * Standard Soil Available Water Capacity (Field Capacity - Wilting Point in mm/meter depth)
 */
export const SOIL_AVAILABLE_WATER: Record<SoilType, number> = {
  SANDY_LOAM: 110,
  CLAY_LOAM: 160,
  SILT_LOAM: 175,
  RED_VOLCANIC: 140,
  BLACK_COTTON: 190
};

/**
 * Computes Reference Evapotranspiration (ET0 in mm/day)
 * Uses standard Hargreaves-Samani / FAO-56 radiation-temperature formulation
 */
export function calculateReferenceEt0(weather: WeatherTelemetry): number {
  const temp = weather.ambientTemperatureC;
  const humidity = weather.relativeHumidityPercent;
  const solarRad = weather.solarRadiationWm2; // W/m²
  const wind = weather.windSpeedMs;

  // Radiation energy term calibrated for equatorial Kenya day-length:
  // 700 W/m² peak corresponds to ~4.5 - 5.5 mm/day radiative equivalent
  const radiationTerm = (solarRad * 0.0068);

  // Aerodynamic vapor pressure deficit drive factor
  const vpdFactor = Math.max(0.1, (100 - humidity) / 100);
  const aerodynamicTerm = (0.012 * (temp + 5) * wind * vpdFactor);

  // FAO-56 Penman-Monteith composite (mm/day)
  const et0 = radiationTerm + aerodynamicTerm;

  return parseFloat(Math.max(1.5, Math.min(8.5, et0)).toFixed(2));
}

/**
 * Multimodal AI Precision Irrigation Engine:
 * Fuses ground LoRaWAN soil moisture, microclimate weather, and satellite NDWI
 */
export function generateIrrigationRecommendation(
  zone: IrrigationZone,
  parcel: Parcel,
  soil: SoilTelemetry,
  weather: WeatherTelemetry,
  latestSatellite?: SatelliteObservation
): IrrigationRecommendation {
  const kc = CROP_KC_TABLE[parcel.cropType][parcel.growthStage] || 1.0;
  const et0 = calculateReferenceEt0(weather);
  const etc = parseFloat((kc * et0).toFixed(2));

  const currentVwc = soil.volumetricWaterContent;
  const targetVwc = zone.targetMoistureMax;

  // Soil moisture deficit (mm) across root zone depth
  // Deficit mm = root depth (m) * (target% - current%) * 10
  let moistureDeficitMm = 0;
  if (currentVwc < zone.targetMoistureMin) {
    const rawDeficit = parcel.rootDepthMeters * (targetVwc - currentVwc) * 10;
    moistureDeficitMm = parseFloat(Math.max(0, rawDeficit).toFixed(2));
  }

  // Satellite NDWI fusion adjustment
  let satelliteNdwi = 0.0;
  if (latestSatellite) {
    satelliteNdwi = latestSatellite.meanNdwi;
    // If satellite detects severe canopy water stress (NDWI < -0.15), add 10% safety buffer
    if (satelliteNdwi < config.satellite.ndwiWaterStressThreshold && moistureDeficitMm > 0) {
      moistureDeficitMm = parseFloat((moistureDeficitMm * 1.10).toFixed(2));
    }
  }

  // Check 24h Rain Gating: if forecast rainfall exceeds threshold, pause automated irrigation
  const rainGated = weather.forecastRainfallMmNext24h >= config.irrigation.rainGatingThresholdMm;
  let gatingReason: string | undefined;

  if (rainGated) {
    gatingReason = `Rain forecast of ${weather.forecastRainfallMmNext24h}mm exceeds threshold of ${config.irrigation.rainGatingThresholdMm}mm. Cycles postponed.`;
  }

  // Calculate required water volume in Liters:
  // 1 mm depth on 1 hectare (10,000 m²) = 10,000 Liters
  // Adjust for parcel area and drip efficiency factor (90%)
  const rawLiters = (moistureDeficitMm * 10000 * parcel.areaHectares) / config.irrigation.dripEfficiencyFactor;
  const estimatedWaterLiters = Math.round(rawLiters);

  // Runtime (minutes) = Liters / flow rate (Liters per minute)
  let recommendedRuntimeMinutes = 0;
  if (zone.flowRateLpm > 0 && estimatedWaterLiters > 0 && !rainGated) {
    recommendedRuntimeMinutes = Math.min(
      Math.round(estimatedWaterLiters / zone.flowRateLpm),
      config.lorawan.maxActuationDurationMinutes
    );
  }

  // Determine recommendation status
  let status: 'IDLE' | 'RECOMMENDED' | 'ACTIVE' | 'SKIPPED' = 'IDLE';
  if (zone.valveStatus === 'OPEN') {
    status = 'ACTIVE';
  } else if (rainGated) {
    status = 'SKIPPED';
  } else if (moistureDeficitMm >= config.irrigation.minDeficitToTriggerMm && recommendedRuntimeMinutes > 0) {
    status = 'RECOMMENDED';
  }

  return {
    zoneId: zone.id,
    parcelId: parcel.id,
    farmId: parcel.farmId,
    cropType: parcel.cropType,
    growthStage: parcel.growthStage,
    currentVwc,
    targetVwc,
    soilMoistureDeficitMm: moistureDeficitMm,
    faoEt0MmDay: et0,
    faoEtcMmDay: etc,
    cropCoefficientKc: kc,
    satelliteNdwiSupport: satelliteNdwi,
    recommendedRuntimeMinutes,
    estimatedWaterLiters,
    weatherGated: rainGated,
    gatingReason,
    status,
    generatedAt: new Date().toISOString()
  };
}
