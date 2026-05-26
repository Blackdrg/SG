"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const encryption_service_1 = require("./encryption.service");
const typeorm_1 = require("@nestjs/typeorm");
const audit_log_entity_1 = require("../db/entities/audit-log.entity");
const session_entity_1 = require("../db/entities/session.entity");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
            typeorm_1.TypeOrmModule.forFeature([audit_log_entity_1.AuditLogEntity, session_entity_1.SessionEntity]),
        ],
        providers: [encryption_service_1.EncryptionService],
        exports: [encryption_service_1.EncryptionService, throttler_1.ThrottlerModule],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map