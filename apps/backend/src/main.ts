import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MetricsService } from "./metrics/metrics.service";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import * as express from "express";

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

  // Security middleware
  app.use(helmet());
  
  // Prevent NoSQL injection
  app.use(mongoSanitize());
  
  // Prevent HTTP parameter pollution
  app.use(hpp());
  
  // Rate limiting to prevent abuse
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use("/api/", apiLimiter);
  
  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/auth/", authLimiter);

  // Body size limiting to prevent DoS
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ limit: "10kb", extended: true }));

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

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(3001);
}

bootstrap();