/**
 * KilimoFlux Domain Models & Schemas
 * Core data contracts for LoRaWAN IoT telemetry, satellite remote sensing,
 * precision irrigation, and AI plant pathology.
 */

export type County =
  | 'Kilifi'
  | 'Mombasa'
  | 'Nakuru'
  | 'Uasin Gishu'
  | 'Machakos'
  | 'Embu'
  | 'Kisumu'
  | 'Kiambu'
  | 'Trans Nzoia'
  | 'Meru';

export type CropType =
  | 'MAIZE'
  | 'TOMATO'
  | 'CASSAVA'
  | 'FRENCH_BEANS'
  | 'COFFEE'
  | 'KALE_SUKUMA'
  | 'ONION'
  | 'WATERMELON';

export type GrowthStage =
  | 'INITIAL'       // Germination / planting
  | 'DEVELOPMENT'   // Vegetative canopy establishment
  | 'MID_SEASON'    // Flowering / fruit set
  | 'LATE_SEASON'   // Ripening / maturation
  | 'HARVEST';

export type SoilType =
  | 'SANDY_LOAM'
  | 'CLAY_LOAM'
  | 'SILT_LOAM'
  | 'RED_VOLCANIC'
  | 'BLACK_COTTON';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [lon, lat] format
}

export interface Parcel {
  id: string;
  farmId: string;
  name: string;
  cropType: CropType;
  variety?: string;
  plantingDate: string;
  growthStage: GrowthStage;
  areaHectares: number;
  soilType: SoilType;
  rootDepthMeters: number;
  polygon: GeoJsonPolygon;
}

export interface IrrigationZone {
  id: string;
  farmId: string;
  parcelId: string;
  name: string;
  valveDevEUI: string;
  valveStatus: 'OPEN' | 'CLOSED' | 'FAULT';
  flowRateLpm: number;
  lastActuatedAt?: string;
  lastActuationMinutes?: number;
  targetMoistureMin: number; // e.g. 25% VWC
  targetMoistureMax: number; // e.g. 45% VWC
}

export interface Farm {
  id: string;
  name: string;
  county: County;
  ownerName: string;
  phone: string;
  center: Coordinates;
  parcels: Parcel[];
  zones: IrrigationZone[];
}

export interface LoraUplinkMetadata {
  devEUI: string;
  appEUI?: string;
  fPort: number;
  fCnt: number;
  rssi: number;
  snr: number;
  frequencyHz?: number;
  gatewayId?: string;
  receivedAt: string;
}

export interface SoilTelemetry {
  nodeId: string;
  farmId: string;
  parcelId: string;
  zoneId?: string;
  volumetricWaterContent: number; // % (0 to 100)
  soilTemperatureC: number;       // °C
  soilEcMicroSiemensCm: number;   // Electrical Conductivity µS/cm
  nitrogenMgKg?: number;          // N
  phosphorusMgKg?: number;        // P
  potassiumMgKg?: number;         // K
  phLevel?: number;               // 0 - 14
  batteryMillivolts: number;      // e.g. 3600mV
  metadata: LoraUplinkMetadata;
  timestamp: string;
}

export interface WeatherTelemetry {
  stationId: string;
  farmId: string;
  ambientTemperatureC: number;
  relativeHumidityPercent: number;
  solarRadiationWm2: number;
  windSpeedMs: number;
  atmosphericPressureKpa: number;
  rainfallMmPastHour: number;
  forecastRainfallMmNext24h: number;
  timestamp: string;
}

export interface SatelliteObservation {
  id: string;
  parcelId: string;
  platform: 'SENTINEL_2A' | 'SENTINEL_2B' | 'LANDSAT_8' | 'LANDSAT_9';
  overpassDate: string;
  cloudCoveragePercent: number;
  meanNdvi: number;               // -1.0 to +1.0
  meanNdwi: number;               // -1.0 to +1.0
  meanNdre: number;               // -1.0 to +1.0
  vegetationHealth: 'VIGOROUS' | 'MODERATE' | 'STRESSED' | 'SEVERELY_STRESSED';
  waterStressLevel: 'OPTIMAL' | 'MILD_DEFICIT' | 'SEVERE_DEFICIT';
  bands: {
    b02_blue: number;
    b03_green: number;
    b04_red: number;
    b08_nir: number;
    b8a_narrow_nir: number;
    b11_swir: number;
  };
}

export interface IrrigationRecommendation {
  zoneId: string;
  parcelId: string;
  farmId: string;
  cropType: CropType;
  growthStage: GrowthStage;
  currentVwc: number;             // Current soil moisture %
  targetVwc: number;              // Target soil moisture %
  soilMoistureDeficitMm: number;  // mm of water required
  faoEt0MmDay: number;            // Reference Evapotranspiration
  faoEtcMmDay: number;            // Crop Evapotranspiration (ETc = Kc * ET0)
  cropCoefficientKc: number;
  satelliteNdwiSupport: number;   // Recent NDWI reading
  recommendedRuntimeMinutes: number;
  estimatedWaterLiters: number;
  weatherGated: boolean;          // True if paused due to rain forecast
  gatingReason?: string;
  status: 'IDLE' | 'RECOMMENDED' | 'ACTIVE' | 'SKIPPED';
  generatedAt: string;
}

export interface ValveActuationCommand {
  zoneId: string;
  valveDevEUI: string;
  action: 'OPEN' | 'CLOSE';
  durationMinutes: number;
  triggeredBy: 'AUTONOMOUS_AI' | 'MANUAL_OVERRIDE' | 'FAILSAFE_WATCHDOG';
  timestamp: string;
}

export type PathogenType = 'PEST' | 'FUNGAL' | 'BACTERIAL' | 'VIRAL' | 'NUTRIENT_DEFICIENCY';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CropPathogen {
  id: string;
  crop: CropType;
  commonName: string;
  scientificName: string;
  type: PathogenType;
  severity: SeverityLevel;
  symptoms: string[];
  organicRemedies: string[];
  chemicalTreatments: string[];
  pcpbRegistrationRefs: string[];
  preventativeMeasures: string[];
}

export interface DiagnosisRequest {
  farmId: string;
  parcelId?: string;
  cropType: CropType;
  affectedPart: 'LEAF' | 'STEM' | 'FRUIT' | 'ROOT' | 'WHOLE_PLANT';
  imageBase64?: string;
  imageFileName?: string;
  observedSymptoms?: string[];
  symptomNotes?: string;
}

export interface DiagnosisResult {
  diagnosisId: string;
  cropType: CropType;
  detectedPathogen: CropPathogen;
  confidenceScore: number; // 0.0 to 1.0
  affectedPart: string;
  urgency: SeverityLevel;
  ipmAdvice: {
    culturalAndOrganic: string[];
    chemicalControls: string[];
    pcpbRecommendedProducts: string[];
    preHarvestIntervalDays: number;
  };
  analyzedAt: string;
}
