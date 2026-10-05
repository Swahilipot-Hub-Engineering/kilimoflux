import { Router, Request, Response } from 'express';
import { farmManager } from '../engine/farm-manager.js';

export const healthRouter = Router();

const startTime = Date.now();

healthRouter.get('/', (_req: Request, res: Response): void => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const farms = farmManager.getFarms();

  let totalParcels = 0;
  let totalZones = 0;
  let activeValves = 0;

  for (const farm of farms) {
    totalParcels += farm.parcels.length;
    totalZones += farm.zones.length;
    activeValves += farm.zones.filter(z => z.valveStatus === 'OPEN').length;
  }

  res.json({
    status: 'healthy',
    service: 'KilimoFlux Core Engine',
    version: '0.1.0',
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    stats: {
      managedFarms: farms.length,
      managedParcels: totalParcels,
      irrigationZones: totalZones,
      currentlyOpenValves: activeValves,
      downlinksQueued: farmManager.getDownlinkQueue().length
    }
  });
});
