import { decodeCode, type DecodedCode } from './activation-shared.js';

export async function decodeActivationCode(code: string): Promise<DecodedCode | null> {
  const secret = process.env.ACTIVATION_SECRET;
  if (!secret) {
    console.error('ACTIVATION_SECRET not set!');
    return null;
  }
  return decodeCode(code, secret);
}
