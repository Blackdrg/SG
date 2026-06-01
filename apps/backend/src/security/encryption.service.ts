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
    const CryptoJS = require('crypto-js');
    return CryptoJS.AES.encrypt(text, this.secretKey).toString();
  }

  decrypt(ciphertext: string): string {
    try {
      const CryptoJS = require('crypto-js');
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  encryptPiiFields(obj: any, fields: string[]): any {
    const encryptedObj = { ...obj };
    for (const field of fields) {
      if (encryptedObj[field] && typeof encryptedObj[field] === 'string') {
        encryptedObj[field] = this.encrypt(encryptedObj[field]);
      }
    }
    return encryptedObj;
  }

  decryptPiiFields(obj: any, fields: string[]): any {
    const decryptedObj = { ...obj };
    for (const field of fields) {
      if (decryptedObj[field] && typeof decryptedObj[field] === 'string') {
        try {
          decryptedObj[field] = this.decrypt(decryptedObj[field]);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : 'unknown';
          throw new Error(`Failed to decrypt field ${field}: ${errMsg}`);
        }
      }
    }
    return decryptedObj;
  }
}

