"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredLogger = void 0;
const common_1 = require("@nestjs/common");
const logging_service_1 = require("../../logging/logging.service");
let StructuredLogger = class StructuredLogger {
    setContext(context) {
        this.context = context;
    }
    log(message, ...optionalParams) {
        console.log(JSON.stringify({
            level: 'info',
            message,
            context: this.context,
            timestamp: new Date().toISOString(),
            ...optionalParams,
        }));
    }
    error(message, ...optionalParams) {
        console.error(JSON.stringify({
            level: 'error',
            message: (0, logging_service_1.sanitizeForLog)(message),
            error: (0, logging_service_1.sanitizeForLog)(optionalParams[0]),
            context: this.context,
            timestamp: new Date().toISOString(),
        }));
    }
    warn(message, ...optionalParams) {
        console.warn(JSON.stringify({
            level: 'warn',
            message: (0, logging_service_1.sanitizeForLog)(message),
            context: this.context,
            timestamp: new Date().toISOString(),
            ...optionalParams,
        }));
    }
    debug(message, ...optionalParams) {
        console.debug(JSON.stringify({
            level: 'debug',
            message,
            context: this.context,
            timestamp: new Date().toISOString(),
            ...optionalParams,
        }));
    }
    verbose(message, ...optionalParams) {
        console.log(JSON.stringify({
            level: 'verbose',
            message,
            context: this.context,
            timestamp: new Date().toISOString(),
            ...optionalParams,
        }));
    }
};
exports.StructuredLogger = StructuredLogger;
exports.StructuredLogger = StructuredLogger = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT })
], StructuredLogger);
//# sourceMappingURL=logger.service.js.map