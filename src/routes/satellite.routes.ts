import { Router, Request, Response } from 'express';
import { satelliteProcessor } from '../satellite/processor.js';
import { farmManager } from '../engine/farm-manager.js';
import { SpectralBands } from '../satellite/indices.js';

export const satelliteRouter = Router();

/**
 * GET /api/v1/satellite/observations/:parcelId
 * Returns historical satellite observations (NDVI, NDWI, NDRE) for a parcel
 */
satelliteRouter.get('/observations/:parcelId', (req: Request, res: Response): void => {
  const parcelId = Array.isArray(req.params.parcelId) ? req.params.parcelId[0] : req.params.parcelId;
  const observations = satelliteProcessor.getObservationsForParcel(parcelId);
  res.json({
    success: true,
    count: observations.length,
    data: observations
  });
});

/**
 * POST /api/v1/satellite/analyze
 * Evaluates raw surface reflectance bands for a parcel
 */
satelliteRouter.post('/analyze', (req: Request, res: Response): void => {
  try {
    const { parcelId, bands, cloudCoveragePercent, overpassDate } = req.body;
    if (!parcelId || !bands) {
      res.status(400).json({ success: false, error: 'parcelId and bands are required' });
      return;
    }

    const parcel = farmManager.getParcelById(parcelId);
    if (!parcel) {
      res.status(404).json({ success: false, error: `Parcel ${parcelId} not found` });
      return;
    }

    const typedBands = bands as SpectralBands;
    const cloudCover = cloudCoveragePercent !== undefined ? Number(cloudCoveragePercent) : 10.0;

    const observation = satelliteProcessor.processParcelObservation(
      parcel,
      typedBands,
      cloudCover,
      overpassDate
    );

    res.status(201).json({
      success: true,
      message: 'Satellite spectral indices calculated successfully',
      data: observation
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});
