"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const metrics_service_1 = require("./metrics/metrics.service");
const config_1 = require("@nestjs/config");
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
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=main.js.map