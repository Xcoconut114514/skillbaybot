import crypto from 'crypto';

export interface DecodedCode {
  skillId: string;
  userId: string;
  timestamp: number;
}

function deriveKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret).digest();
}

export async function decodeCode(code: string, secret: string): Promise<DecodedCode | null> {
  try {
    const key = deriveKey(secret);
    const raw = Buffer.from(code, 'base64url');
    const hex = raw.toString('hex');
    const iv = Buffer.from(hex.substring(0, 32), 'hex');
    const encryptedHex = hex.substring(32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const [skillId, userId, ts] = decrypted.split(':');
    if (!skillId || !userId || !ts) return null;
    return { skillId, userId, timestamp: parseInt(ts) };
  } catch {
    return null;
  }
}
