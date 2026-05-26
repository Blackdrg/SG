"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const promClient = require("prom-client");
const metrics_service_1 = require("./metrics/metrics.service");
const Sentry = require("@sentry/node");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    const metricsService = app.get(metrics_service_1.MetricsService);
    app.use("/metrics", async (req, res) => {
        res.set("Content-Type", promClient.register.contentType);
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
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    app.use(Sentry.Handlers.errorHandler());
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=main.js.map