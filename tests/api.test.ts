import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server.js';

describe('KilimoFlux REST API Integration Suite', () => {
  const app = createApp();

  it('GET /api/v1/health should return system status and farm statistics', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.stats.managedFarms).toBeGreaterThanOrEqual(3);
    expect(res.body.stats.managedParcels).toBeGreaterThanOrEqual(4);
  });

  it('GET /api/v1/farms should list all registered farms', async () => {
    const res = await request(app).get('/api/v1/farms');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    expect(res.body.data[0].name).toContain('Kilifi');
  });

  it('POST /api/v1/telemetry/raw should accept soil sensor telemetry', async () => {
    const res = await request(app)
      .post('/api/v1/telemetry/raw')
      .send({
        farmId: 'farm-kilifi-01',
        parcelId: 'parcel-kilifi-cassava',
        vwc: 24.5,
        temperature: 27.2,
        ec: 380,
        battery: 3640
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.volumetricWaterContent).toBe(24.5);
  });

  it('GET /api/v1/irrigation/recommendations should calculate FAO-56 deficit', async () => {
    const res = await request(app).get('/api/v1/irrigation/recommendations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    const rec = res.body.data[0];
    expect(rec).toHaveProperty('faoEtcMmDay');
    expect(rec).toHaveProperty('cropCoefficientKc');
  });

  it('POST /api/v1/irrigation/zones/:id/actuate should queue LoRaWAN downlink', async () => {
    const res = await request(app)
      .post('/api/v1/irrigation/zones/zone-kilifi-z1/actuate')
      .send({
        action: 'OPEN',
        durationMinutes: 30,
        triggeredBy: 'MANUAL_OVERRIDE'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.downlinkHex).toBeDefined();
    expect(res.body.data.zone.valveStatus).toBe('OPEN');
  });

  it('POST /api/v1/pest-diagnosis/analyze should return IPM diagnosis', async () => {
    const res = await request(app)
      .post('/api/v1/pest-diagnosis/analyze')
      .send({
        cropType: 'TOMATO',
        affectedPart: 'LEAF',
        symptomNotes: 'Water soaked lesions and white mold on underside of leaves'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.detectedPathogen.commonName).toBe('Late Blight');
    expect(res.body.data.ipmAdvice.chemicalControls.length).toBeGreaterThan(0);
  });
});
