import { describe, it, expect } from 'vitest';
import {
  calculateNdvi,
  calculateNdwi,
  calculateNdre,
  classifyVegetationHealth,
  classifyWaterStress
} from '../src/satellite/indices.js';
import { satelliteProcessor } from '../src/satellite/processor.js';
import { Parcel } from '../src/models/types.js';

describe('Satellite Remote Sensing Suite', () => {
  it('should accurately calculate NDVI and classify health', () => {
    // Dense green canopy: High NIR (0.50), Low Red (0.05)
    const ndvi = calculateNdvi(0.50, 0.05);
    expect(ndvi).toBe(0.818);
    expect(classifyVegetationHealth(ndvi)).toBe('VIGOROUS');

    // Sparse / stressed vegetation: NIR (0.25), Red (0.18)
    const stressedNdvi = calculateNdvi(0.25, 0.18);
    expect(stressedNdvi).toBe(0.163);
    expect(classifyVegetationHealth(stressedNdvi)).toBe('SEVERELY_STRESSED');
  });

  it('should accurately calculate NDWI and classify water stress', () => {
    // Moist canopy: High NIR (0.45), Moderate SWIR (0.15)
    const ndwi = calculateNdwi(0.45, 0.15);
    expect(ndwi).toBe(0.5);
    expect(classifyWaterStress(ndwi)).toBe('OPTIMAL');

    // Dry / water-stressed canopy: Low NIR (0.20), High SWIR (0.35)
    const stressedNdwi = calculateNdwi(0.20, 0.35);
    expect(stressedNdwi).toBe(-0.273);
    expect(classifyWaterStress(stressedNdwi)).toBe('SEVERE_DEFICIT');
  });

  it('should calculate NDRE index', () => {
    const ndre = calculateNdre(0.45, 0.25);
    expect(ndre).toBe(0.286);
  });

  it('should reject observation if cloud coverage exceeds threshold', () => {
    const mockParcel: Parcel = {
      id: 'parcel-test',
      farmId: 'farm-01',
      name: 'Test Block',
      cropType: 'MAIZE',
      plantingDate: '2026-06-01',
      growthStage: 'MID_SEASON',
      areaHectares: 1.0,
      soilType: 'SANDY_LOAM',
      rootDepthMeters: 0.8,
      polygon: { type: 'Polygon', coordinates: [] }
    };

    expect(() => {
      satelliteProcessor.processParcelObservation(
        mockParcel,
        { b02_blue: 0.1, b03_green: 0.1, b04_red: 0.1, b08_nir: 0.4, b8a_narrow_nir: 0.3, b11_swir: 0.2 },
        55.0 // 55% cloud cover (threshold is 35%)
      );
    }).toThrow(/exceeds threshold/);
  });
});
