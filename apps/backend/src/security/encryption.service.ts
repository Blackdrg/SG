import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('ENCRYPTION_SECRET');
    if (!this.secretKey || this.secretKey.includes('CHANGE_ME')) {
      throw new Error('ENCRYPTION_SECRET not configured. Set secure random secret before starting.');
    }
  }

  encrypt(text: string): string {
    // @ts-ignore
    const CryptoJS = require('crypto-js');
    return CryptoJS.AES.encrypt(text, this.secretKey).toString();
  }

  decrypt(ciphertext: string): string {
    // @ts-ignore
    const CryptoJS = require('crypto-js');
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Encrypt PII fields
  encryptPiiFields(obj: any, fields: string[]): any {
    const encryptedObj = { ...obj };
    for (const field of fields) {
      if (encryptedObj[field] && typeof encryptedObj[field] === 'string') {
        encryptedObj[field] = this.encrypt(encryptedObj[field]);
      }
    }
    return encryptedObj;
  }

  // Decrypt PII fields
  decryptPiiFields(obj: any, fields: string[]): any {
    const decryptedObj = { ...obj };
    for (const field of fields) {
      if (decryptedObj[field] && typeof decryptedObj[field] === 'string') {
        try {
          decryptedObj[field] = this.decrypt(decryptedObj[field]);
        } catch (error) {
          // If decryption fails, return original value (might not be encrypted)
          console.warn(`Failed to decrypt field ${field}:`, (error as Error).message);
        }
      }
    }
    return decryptedObj;
  }
}

