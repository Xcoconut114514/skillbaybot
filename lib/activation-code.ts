/**
 * 激活码加密/解密 - AES-256-CBC
 * 前端（生成码）和 Bot（解密码）共用
 */

const isNode = typeof process !== 'undefined' && process.versions?.node;

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** 将密钥字符串转为固定 32 字节（SHA-256 哈希） */
async function deriveKey(secret: string): Promise<Uint8Array> {
  if (isNode) {
    const crypto = await import('crypto');
    return new Uint8Array(crypto.createHash('sha256').update(secret).digest());
  }
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
  return new Uint8Array(hash);
}

// ---------- 加密（前端调用） ----------

export async function generateCode(
  skillId: string,
  userId: string,
  secret: string
): Promise<string> {
  const timestamp = Date.now();
  const plaintext = `${skillId}:${userId}:${timestamp}`;
  const key = await deriveKey(secret);

  if (isNode) {
    const crypto = await import('crypto');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return Buffer.from(bytesToHex(iv) + encrypted, 'hex').toString('base64url');
  }

  // 浏览器环境
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key.buffer as ArrayBuffer, { name: 'AES-CBC' }, false, ['encrypt']
  );
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv }, cryptoKey, encoder.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ---------- 解密（Bot 调用） ----------

export interface DecodedCode {
  skillId: string;
  userId: string;
  timestamp: number;
}

export async function decodeCode(
  code: string,
  secret: string
): Promise<DecodedCode | null> {
  try {
    const key = await deriveKey(secret);

    if (isNode) {
      const crypto = await import('crypto');
      const raw = Buffer.from(code, 'base64url');
      const hex = raw.toString('hex');
      const iv = hexToBytes(hex.substring(0, 32));
      const encryptedHex = hex.substring(32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      const [skillId, userId, ts] = decrypted.split(':');
      if (!skillId || !userId || !ts) return null;
      return { skillId, userId, timestamp: parseInt(ts) };
    }

    // 浏览器环境
    const binaryStr = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    const iv = bytes.slice(0, 16);
    const ciphertext = bytes.slice(16);
    const cryptoKey = await crypto.subtle.importKey(
      'raw', key.buffer as ArrayBuffer, { name: 'AES-CBC' }, false, ['decrypt']
    );
    const decryptedBuf = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv }, cryptoKey, ciphertext
    );
    const decrypted = new TextDecoder().decode(decryptedBuf);
    const [skillId, userId, ts] = decrypted.split(':');
    if (!skillId || !userId || !ts) return null;
    return { skillId, userId, timestamp: parseInt(ts) };
  } catch {
    return null;
  }
}
