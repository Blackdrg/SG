import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MetricsService } from "./metrics/metrics.service";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const metricsService = app.get(MetricsService);
  
  // Initialize Sentry if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/node");
    const dsn = configService.get<string>("SENTRY_DSN");
    if (Sentry && dsn) {
      Sentry.init({
        dsn,
        tracesSampleRate: 1.0,
      });
      app.use(Sentry.Handlers.requestHandler());
      app.use(Sentry.Handlers.tracingHandler());
    }
  } catch (e) {
    // Sentry not installed - continue without error tracking
  }

  // Prometheus metrics endpoint
  app.use("/metrics", async (req, res) => {
    res.set("Content-Type", "text/plain");
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

  await app.listen(3001);
}

bootstrap();