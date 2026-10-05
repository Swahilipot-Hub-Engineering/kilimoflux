import { Router, Request, Response } from 'express';
import { farmManager } from '../engine/farm-manager.js';

export const farmRouter = Router();

/**
 * GET /api/v1/farms
 */
farmRouter.get('/', (_req: Request, res: Response): void => {
  const farms = farmManager.getFarms();
  res.json({
    success: true,
    count: farms.length,
    data: farms
  });
});

/**
 * GET /api/v1/farms/:id
 */
farmRouter.get('/:id', (req: Request, res: Response): void => {
  const farmId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const farm = farmManager.getFarmById(farmId);
  if (!farm) {
    res.status(404).json({ success: false, error: 'Farm not found' });
    return;
  }
  const weather = farmManager.getWeather(farm.id);
  res.json({
    success: true,
    data: {
      ...farm,
      weather
    }
  });
});

/**
 * GET /api/v1/farms/stream
 * Server-Sent Events (SSE) for real-time live map & telemetry streaming
 */
farmRouter.get('/stream', (req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial snapshot
  const initialData = {
    farms: farmManager.getFarms(),
    recommendations: farmManager.getIrrigationRecommendations()
  };
  res.write(`data: ${JSON.stringify({ type: 'SNAPSHOT', payload: initialData })}\n\n`);

  // Event handlers
  const onTelemetry = (telemetry: unknown) => {
    res.write(`data: ${JSON.stringify({ type: 'SOIL_TELEMETRY', payload: telemetry })}\n\n`);
  };

  const onWeather = (weather: unknown) => {
    res.write(`data: ${JSON.stringify({ type: 'WEATHER_UPDATE', payload: weather })}\n\n`);
  };

  const onActuation = (actuation: unknown) => {
    res.write(`data: ${JSON.stringify({ type: 'VALVE_ACTUATION', payload: actuation })}\n\n`);
  };

  farmManager.on('telemetry', onTelemetry);
  farmManager.on('weather', onWeather);
  farmManager.on('actuation', onActuation);

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    farmManager.removeListener('telemetry', onTelemetry);
    farmManager.removeListener('weather', onWeather);
    farmManager.removeListener('actuation', onActuation);
    res.end();
  });
});
