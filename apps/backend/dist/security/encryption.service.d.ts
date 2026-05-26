import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private configService;
    private secretKey;
    constructor(configService: ConfigService);
    encrypt(text: string): string;
    decrypt(ciphertext: string): string;
    encryptPiiFields(obj: any, fields: string[]): any;
    decryptPiiFields(obj: any, fields: string[]): any;
}
