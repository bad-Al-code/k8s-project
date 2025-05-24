import express, { NextFunction, Request, Response } from "express";
import winston from "winston";
import client from "prom-client";
import LokiTransport from "winston-loki";

const app = express();
const PORT = process.env.PORT || 8000;
const LOKI_HOST = process.env.LOKI_HOST || "http://localhost:3100";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "product-catalog", appName: "product-catalog" },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),

    new LokiTransport({
      host: LOKI_HOST,
      json: true,
      format: winston.format.json(),
      labels: { appName: "product-catalog" },
    }),
  ],
});

const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();

collectDefaultMetrics({ register });

const totalRequests = new client.Counter({
  name: "product_catalog_total_requests",
  help: "Total number of request to the product-catalog services",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const requestDuration = new client.Histogram({
  name: "product_catalog_request_duration_seconds",
  help: "Histogram of request duration to the product-catalog service in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const end = requestDuration.startTimer();

  res.on("finish", () => {
    end({
      method: req.method,
      route: req.path,
      status_code: req.statusCode,
    }),
      totalRequests.inc({
        method: req.method,
        route: req.path,
        status_code: res.statusCode,
      });
  });

  next();
});

app.get("/", (req: Request, res: Response) => {
  logger.info("[product-catalog]: root endpoint accessed.");

  res.status(200).send("Hello from Product Catalog");
});

app.get("/slow", (req: Request, res: Response) => {
  const delay = Math.floor(Math.random() * 2000) + 500; // 0.5 to 2.5
  const shouldError = Math.random() < 0.5;

  setTimeout(() => {
    if (shouldError) {
      logger.error(
        `[product-catalog]: Simulated error occurred on /slow route!`,
        { error: "INTERNAL_SERVER_ERROR", path: "/slow" }
      );

      res.status(500).send(`Simulated internal server error`);
      return;
    }

    logger.info(`[product-catalog]: /slow route completed successfully.`);

    res.send(`Successfully processed slow request after ${delay}ms`);
  }, delay);
});

app.get("/metrics", async (req: Request, res: Response) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  logger.info(`Product Catalog service listening in port ${PORT}`);
  logger.info(`Loki host configurated to: ${LOKI_HOST}`);
});
