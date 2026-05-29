"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const metrics_service_1 = require("./metrics/metrics.service");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const helmet_1 = require("helmet");
const express_mongo_sanitize_1 = require("express-mongo-sanitize");
const hpp_1 = require("hpp");
const express_rate_limit_1 = require("express-rate-limit");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    const configService = app.get(config_1.ConfigService);
    const metricsService = app.get(metrics_service_1.MetricsService);
    try {
        const Sentry = require("@sentry/node");
        const dsn = configService.get("SENTRY_DSN");
        if (Sentry && dsn) {
            Sentry.init({
                dsn,
                tracesSampleRate: 1.0,
            });
            app.use(Sentry.Handlers.requestHandler());
            app.use(Sentry.Handlers.tracingHandler());
        }
    }
    catch (e) {
    }
    app.use((0, helmet_1.default)());
    app.use((0, express_mongo_sanitize_1.default)());
    app.use((0, hpp_1.default)());
    const apiLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use("/api/", apiLimiter);
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use("/auth/", authLimiter);
    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ limit: "10kb", extended: true }));
    app.use("/metrics", async (req, res) => {
        res.set("Content-Type", "text/plain");
        res.send(await metricsService.getMetrics());
    });
    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            const duration = Date.now() - start;
            metricsService.observeHttpRequestDuration(req.method, req.route?.path || req.path, res.statusCode, duration);
        });
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=main.js.map