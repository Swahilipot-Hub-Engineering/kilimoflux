# Runbook — KilimoFlux

Operating **KilimoFlux** in production.

## Service Health Check

Verify status:
```bash
curl -f http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "KilimoFlux Core Engine",
  "stats": {
    "managedFarms": 3,
    "managedParcels": 4,
    "irrigationZones": 4
  }
}
```

## Production Docker Deployment

```bash
docker compose up --build -d
```

View logs:
```bash
docker compose logs -f kilimoflux
```

## Connecting a ChirpStack LoRaWAN Gateway
1. Set up your ChirpStack Application under Region `EU868`.
2. Configure HTTP Integration with endpoint:
   `http://your-server-ip:3000/api/v1/telemetry/lorawan?farmId=farm-kilifi-01&parcelId=parcel-kilifi-cassava`
3. Uplinks will automatically update live farm soil moisture and recalculate irrigation schedules.
