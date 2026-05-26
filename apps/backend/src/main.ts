import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as promClient from "prom-client";
import { MetricsService } from "./metrics/metrics.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  
  const metricsService = app.get(MetricsService);
  
  // Prometheus metrics endpoint
  app.use("/metrics", async (req, res) => {
    res.set("Content-Type", promClient.register.contentType);
    res.send(await metricsService.getMetrics());
  });

  // Metrics middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      metricsService.observeHttpRequestDuration(
        req.method,
        req.route?.path || req.path,
        res.statusCode,
        duration
      );
    });
    next();
  });

  // Sentry integration (optional - requires @sentry/node)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/node");
    if (Sentry) {
      app.use(Sentry.Handlers.requestHandler());
      app.use(Sentry.Handlers.tracingHandler());
      // Sentry error handler must be after all routes
      app.use(Sentry.Handlers.errorHandler());
    }
  } catch (e) {
    // Sentry not installed - continue without error tracking
  }

  await app.listen(3001);
}

bootstrap();