import { describe, it, expect } from 'vitest';
import {
  calculateReferenceEt0,
  generateIrrigationRecommendation,
  CROP_KC_TABLE
} from '../src/ai/fao-irrigation.js';
import {
  WeatherTelemetry,
  SoilTelemetry,
  Parcel,
  IrrigationZone
} from '../src/models/types.js';

describe('FAO-56 Precision Irrigation & Gating Engine', () => {
  const mockWeather: WeatherTelemetry = {
    stationId: 'wx-01',
    farmId: 'farm-01',
    ambientTemperatureC: 28.0,
    relativeHumidityPercent: 65,
    solarRadiationWm2: 700,
    windSpeedMs: 2.5,
    atmosphericPressureKpa: 101.3,
    rainfallMmPastHour: 0,
    forecastRainfallMmNext24h: 0.5,
    timestamp: new Date().toISOString()
  };

  const mockParcel: Parcel = {
    id: 'parcel-tomato-01',
    farmId: 'farm-01',
    name: 'Tomato Block',
    cropType: 'TOMATO',
    plantingDate: '2026-08-01',
    growthStage: 'MID_SEASON',
    areaHectares: 1.0,
    soilType: 'SANDY_LOAM',
    rootDepthMeters: 0.6,
    polygon: {
      type: 'Polygon',
      coordinates: [[[39.8, -3.6], [39.9, -3.6], [39.9, -3.7], [39.8, -3.6]]]
    }
  };

  const mockZone: IrrigationZone = {
    id: 'zone-01',
    farmId: 'farm-01',
    parcelId: 'parcel-tomato-01',
    name: 'Tomato Drip Zone',
    valveDevEUI: 'A84041000181A001',
    valveStatus: 'CLOSED',
    flowRateLpm: 50,
    targetMoistureMin: 28.0,
    targetMoistureMax: 40.0
  };

  it('should calculate realistic FAO-56 Reference ET0', () => {
    const et0 = calculateReferenceEt0(mockWeather);
    // Typical tropical Kenya ET0 ranges between 4.0 and 8.0 mm/day
    expect(et0).toBeGreaterThanOrEqual(3.5);
    expect(et0).toBeLessThanOrEqual(9.0);
  });

  it('should verify Crop Kc table values', () => {
    expect(CROP_KC_TABLE.TOMATO.MID_SEASON).toBe(1.15);
    expect(CROP_KC_TABLE.MAIZE.MID_SEASON).toBe(1.20);
    expect(CROP_KC_TABLE.CASSAVA.INITIAL).toBe(0.30);
  });

  it('should recommend irrigation when soil moisture is below minimum threshold', () => {
    const drySoil: SoilTelemetry = {
      nodeId: 'node-01',
      farmId: 'farm-01',
      parcelId: 'parcel-tomato-01',
      volumetricWaterContent: 18.0, // Well below 28.0 min
      soilTemperatureC: 25.0,
      soilEcMicroSiemensCm: 320,
      batteryMillivolts: 3600,
      metadata: {
        devEUI: 'A84041000181A001',
        fPort: 1,
        fCnt: 1,
        rssi: -80,
        snr: 9.0,
        receivedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    const rec = generateIrrigationRecommendation(mockZone, mockParcel, drySoil, mockWeather);
    expect(rec.status).toBe('RECOMMENDED');
    expect(rec.soilMoistureDeficitMm).toBeGreaterThan(5.0);
    expect(rec.recommendedRuntimeMinutes).toBeGreaterThan(0);
    expect(rec.weatherGated).toBe(false);
  });

  it('should trigger weather rain gating when 24h rain forecast exceeds 5mm', () => {
    const rainyWeather = {
      ...mockWeather,
      forecastRainfallMmNext24h: 12.0 // Exceeds 5mm
    };

    const drySoil: SoilTelemetry = {
      nodeId: 'node-01',
      farmId: 'farm-01',
      parcelId: 'parcel-tomato-01',
      volumetricWaterContent: 18.0,
      soilTemperatureC: 24.0,
      soilEcMicroSiemensCm: 320,
      batteryMillivolts: 3600,
      metadata: {
        devEUI: 'A84041000181A001',
        fPort: 1,
        fCnt: 1,
        rssi: -80,
        snr: 9.0,
        receivedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    const rec = generateIrrigationRecommendation(mockZone, mockParcel, drySoil, rainyWeather);
    expect(rec.weatherGated).toBe(true);
    expect(rec.status).toBe('SKIPPED');
    expect(rec.recommendedRuntimeMinutes).toBe(0);
    expect(rec.gatingReason).toContain('exceeds threshold');
  });
});
