import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const rawKey =
      process.env.ENCRYPTION_KEY ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
      this.key = Buffer.from(rawKey, 'hex');
    } else if (Buffer.byteLength(rawKey, 'utf8') === 32) {
      this.key = Buffer.from(rawKey, 'utf8');
    } else {
      this.key = crypto.createHash('sha256').update(rawKey).digest();
    }
  }

  /**
   * Criptografa uma string em texto plano utilizando AES-256-GCM.
   * Formato de saída: ivHex:authTagHex:cipherTextHex
   */
  encrypt(plainText: string | null | undefined): string | null {
    if (plainText === null || plainText === undefined || plainText === '') {
      return null;
    }

    // Evita dupla criptografia caso já esteja no formato iv:authTag:ciphertext
    if (this.isEncryptedFormat(plainText)) {
      return plainText;
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(String(plainText), 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Descriptografa um valor no formato ivHex:authTagHex:cipherTextHex.
   */
  decrypt(cipherPayload: string | null | undefined): string | null {
    if (
      cipherPayload === null ||
      cipherPayload === undefined ||
      cipherPayload === ''
    ) {
      return null;
    }

    if (!this.isEncryptedFormat(cipherPayload)) {
      return cipherPayload;
    }

    try {
      const [ivHex, authTagHex, encryptedHex] = cipherPayload.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encryptedText = Buffer.from(encryptedHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      return '[DADO_PROTEGIDO_INDISPONIVEL]';
    }
  }

  private isEncryptedFormat(value: string): boolean {
    const parts = value.split(':');
    if (parts.length !== 3) return false;
    const [ivHex, authTagHex, cipherHex] = parts;
    return (
      /^[0-9a-fA-F]{24}$/.test(ivHex) &&
      /^[0-9a-fA-F]{32}$/.test(authTagHex) &&
      /^[0-9a-fA-F]+$/.test(cipherHex)
    );
  }
}

