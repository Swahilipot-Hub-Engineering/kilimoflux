import { describe, it, expect } from 'vitest';
import { decodeSoilSensorBinary, parseLoraUplink } from '../src/iot/decoder.js';
import { encodeValveDownlink } from '../src/iot/downlink.js';
import { ValveActuationCommand } from '../src/models/types.js';

describe('LoRaWAN IoT Decoder & Downlink Suite', () => {
  it('should correctly decode binary sensor payload', () => {
    // Construct 12-byte binary payload:
    // VWC: 28.50% -> 2850 (0x0B22)
    // Temp: 23.4°C -> 234 (0x00EA)
    // EC: 420 µS/cm -> 420 (0x01A4)
    // Battery: 3650 mV -> 3650 (0x0E42)
    // pH: 6.8 -> 68 (0x44)
    // N: 55 mg/kg -> 55 (0x37)
    // P: 25 mg/kg -> 25 (0x19)
    // K: 70 mg/kg -> 70 (0x46)
    const buf = Buffer.alloc(12);
    buf.writeUInt16BE(2850, 0);
    buf.writeInt16BE(234, 2);
    buf.writeUInt16BE(420, 4);
    buf.writeUInt16BE(3650, 6);
    buf.writeUInt8(68, 8);
    buf.writeUInt8(55, 9);
    buf.writeUInt8(25, 10);
    buf.writeUInt8(70, 11);

    const decoded = decodeSoilSensorBinary(buf);
    expect(decoded.volumetricWaterContent).toBe(28.5);
    expect(decoded.soilTemperatureC).toBe(23.4);
    expect(decoded.soilEcMicroSiemensCm).toBe(420);
    expect(decoded.batteryMillivolts).toBe(3650);
    expect(decoded.phLevel).toBe(6.8);
    expect(decoded.nitrogenMgKg).toBe(55);
    expect(decoded.phosphorusMgKg).toBe(25);
    expect(decoded.potassiumMgKg).toBe(70);
  });

  it('should parse TTN webhook uplink format', () => {
    const ttnPayload = {
      end_device_ids: {
        device_id: 'kilifi-node-01',
        dev_eui: 'A84041000181A001'
      },
      uplink_message: {
        f_port: 2,
        f_cnt: 42,
        decoded_payload: {
          soil_moisture: 32.5,
          temperature: 26.1,
          ec: 390,
          battery: 3610
        },
        rx_metadata: [
          {
            rssi: -82,
            snr: 9.2,
            gateway_ids: { gateway_id: 'gw-swahilipot-01' }
          }
        ]
      }
    };

    const telemetry = parseLoraUplink(ttnPayload, 'farm-kilifi-01', 'parcel-kilifi-cassava');
    expect(telemetry.volumetricWaterContent).toBe(32.5);
    expect(telemetry.soilTemperatureC).toBe(26.1);
    expect(telemetry.metadata.devEUI).toBe('A84041000181A001');
    expect(telemetry.metadata.rssi).toBe(-82);
    expect(telemetry.metadata.gatewayId).toBe('gw-swahilipot-01');
  });

  it('should encode valve actuation command into LoRaWAN downlink buffer', () => {
    const command: ValveActuationCommand = {
      zoneId: 'zone-kilifi-z1',
      valveDevEUI: 'A84041000181A001',
      action: 'OPEN',
      durationMinutes: 45,
      triggeredBy: 'AUTONOMOUS_AI',
      timestamp: new Date().toISOString()
    };

    const downlink = encodeValveDownlink(command);
    expect(downlink.devEUI).toBe('A84041000181A001');
    expect(downlink.fPort).toBe(10);
    expect(downlink.confirmed).toBe(true);

    const buf = Buffer.from(downlink.dataHex, 'hex');
    expect(buf.readUInt8(0)).toBe(0x01); // OPEN
    expect(buf.readUInt16BE(1)).toBe(45); // 45 minutes
  });
});
