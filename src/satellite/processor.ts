import { SatelliteObservation, Parcel } from '../models/types.js';
import {
  calculateNdvi,
  calculateNdwi,
  calculateNdre,
  classifyVegetationHealth,
  classifyWaterStress,
  SpectralBands
} from './indices.js';
import { config } from '../config.js';

export class SatelliteProcessor {
  private observations: Map<string, SatelliteObservation[]> = new Map();

  /**
   * Processes Sentinel-2 surface reflectance bands for a given farm parcel
   */
  public processParcelObservation(
    parcel: Parcel,
    bands: SpectralBands,
    cloudCoveragePercent: number,
    overpassDate: string = new Date().toISOString()
  ): SatelliteObservation {
    // Cloud cover validation
    if (cloudCoveragePercent > config.satellite.maxCloudCoverPercent) {
      throw new Error(
        `Cloud cover (${cloudCoveragePercent}%) exceeds threshold of ${config.satellite.maxCloudCoverPercent}%. Observation discarded.`
      );
    }

    const meanNdvi = calculateNdvi(bands.b08_nir, bands.b04_red);
    const meanNdwi = calculateNdwi(bands.b08_nir, bands.b11_swir);
    const meanNdre = calculateNdre(bands.b08_nir, bands.b8a_narrow_nir);

    const observation: SatelliteObservation = {
      id: `sat-${parcel.id}-${Date.now()}`,
      parcelId: parcel.id,
      platform: 'SENTINEL_2A',
      overpassDate,
      cloudCoveragePercent,
      meanNdvi,
      meanNdwi,
      meanNdre,
      vegetationHealth: classifyVegetationHealth(meanNdvi),
      waterStressLevel: classifyWaterStress(meanNdwi),
      bands
    };

    const list = this.observations.get(parcel.id) || [];
    list.push(observation);
    // Keep last 30 observations per parcel
    if (list.length > 30) list.shift();
    this.observations.set(parcel.id, list);

    return observation;
  }

  public getObservationsForParcel(parcelId: string): SatelliteObservation[] {
    return this.observations.get(parcelId) || [];
  }

  public getLatestObservation(parcelId: string): SatelliteObservation | undefined {
    const list = this.observations.get(parcelId);
    if (!list || list.length === 0) return undefined;
    return list[list.length - 1];
  }
}

export const satelliteProcessor = new SatelliteProcessor();
