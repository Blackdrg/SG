"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EncryptionService = class EncryptionService {
    constructor(configService) {
        this.configService = configService;
        this.secretKey = this.configService.get('ENCRYPTION_SECRET', 'spicegarden-super-secret');
    }
    encrypt(text) {
        const CryptoJS = require('crypto-js');
        return CryptoJS.AES.encrypt(text, this.secretKey).toString();
    }
    decrypt(ciphertext) {
        const CryptoJS = require('crypto-js');
        const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
    encryptPiiFields(obj, fields) {
        const encryptedObj = { ...obj };
        for (const field of fields) {
            if (encryptedObj[field] && typeof encryptedObj[field] === 'string') {
                encryptedObj[field] = this.encrypt(encryptedObj[field]);
            }
        }
        return encryptedObj;
    }
    decryptPiiFields(obj, fields) {
        const decryptedObj = { ...obj };
        for (const field of fields) {
            if (decryptedObj[field] && typeof decryptedObj[field] === 'string') {
                try {
                    decryptedObj[field] = this.decrypt(decryptedObj[field]);
                }
                catch (error) {
                    console.warn(`Failed to decrypt field ${field}:`, error.message);
                }
            }
        }
        return decryptedObj;
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map