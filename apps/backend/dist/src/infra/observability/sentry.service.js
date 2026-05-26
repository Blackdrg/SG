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
var SentryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryService = void 0;
const common_1 = require("@nestjs/common");
const Sentry = require("@sentry/node");
const config_1 = require("@nestjs/config");
let SentryService = SentryService_1 = class SentryService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SentryService_1.name);
        const dsn = this.configService.get('SENTRY_DSN');
        if (dsn) {
            Sentry.init({
                dsn,
                environment: this.configService.get('NODE_ENV', 'development'),
                release: this.configService.get('GIT_COMMIT', 'unknown'),
                integrations: [
                    new Sentry.Integrations.Http({ tracing: true }),
                    new Sentry.Integrations.Express({}),
                ],
                tracesSampleRate: this.configService.get('SENTRY_TRACES_RATE', 1.0),
            });
            this.logger.log('Sentry initialized');
        }
        else {
            this.logger.warn('Sentry DSN not configured - error tracking disabled');
        }
    }
    captureException(error, context) {
        Sentry.captureException(error, { contexts: { app: context } });
    }
    captureMessage(message, level, context) {
        Sentry.captureMessage(message, { level, contexts: { app: context } });
    }
    startTransaction(name, op = 'http.server') {
        return Sentry.startTransaction({ name, op });
    }
};
exports.SentryService = SentryService;
exports.SentryService = SentryService = SentryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SentryService);
//# sourceMappingURL=sentry.service.js.map