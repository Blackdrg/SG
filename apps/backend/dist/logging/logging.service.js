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
exports.LoggingService = void 0;
const common_1 = require("@nestjs/common");
let LoggingService = class LoggingService {
    constructor(context = 'Application') {
        this.context = context;
    }
    log(message, context) {
        const timestamp = new Date().toISOString();
        const logContext = context || this.context;
        console.log(`[${timestamp}] [LOG] [${logContext}] ${message}`);
    }
    error(message, trace, context) {
        const timestamp = new Date().toISOString();
        const logContext = context || this.context;
        console.error(`[${timestamp}] [ERROR] [${logContext}] ${message}`, trace || '');
    }
    warn(message, context) {
        const timestamp = new Date().toISOString();
        const logContext = context || this.context;
        console.warn(`[${timestamp}] [WARN] [${logContext}] ${message}`);
    }
    debug(message, context) {
        const timestamp = new Date().toISOString();
        const logContext = context || this.context;
        console.debug(`[${timestamp}] [DEBUG] [${logContext}] ${message}`);
    }
    verbose(message, context) {
        const timestamp = new Date().toISOString();
        const logContext = context || this.context;
        console.log(`[${timestamp}] [VERBOSE] [${logContext}] ${message}`);
    }
};
exports.LoggingService = LoggingService;
exports.LoggingService = LoggingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String])
], LoggingService);
//# sourceMappingURL=logging.service.js.map