import { ValveActuationCommand } from '../models/types.js';
import { config } from '../config.js';

export interface LoraDownlinkQueueItem {
  devEUI: string;
  confirmed: boolean;
  fPort: number;
  dataBase64: string;
  dataHex: string;
  command: ValveActuationCommand;
}

/**
 * Encodes valve actuation command into binary buffer:
 * Byte 0: Command (0x01 = OPEN, 0x00 = CLOSE, 0x02 = EMERGENCY STOP)
 * Byte 1: Duration in minutes (MSB)
 * Byte 2: Duration in minutes (LSB)
 * Byte 3: Checksum XOR byte
 */
export function encodeValveDownlink(command: ValveActuationCommand): LoraDownlinkQueueItem {
  const buf = Buffer.alloc(4);

  // Command opcode
  let opCode = 0x00;
  if (command.action === 'OPEN') {
    opCode = 0x01;
  }

  // Duration in minutes (capped at max hardware safety cutoff)
  const duration = Math.min(
    Math.max(command.durationMinutes, 0),
    config.lorawan.maxActuationDurationMinutes
  );

  buf.writeUInt8(opCode, 0);
  buf.writeUInt16BE(duration, 1);

  // Checksum XOR
  const checksum = buf[0] ^ buf[1] ^ buf[2];
  buf.writeUInt8(checksum, 3);

  return {
    devEUI: command.valveDevEUI,
    confirmed: true,
    fPort: config.lorawan.downlinkFPort,
    dataBase64: buf.toString('base64'),
    dataHex: buf.toString('hex').toUpperCase(),
    command
  };
}
