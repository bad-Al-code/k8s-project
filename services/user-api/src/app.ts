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
  defaultMeta: { service: "user-api", appName: "user-api" },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),

    new LokiTransport({
      host: LOKI_HOST,
      json: true,
      format: winston.format.json(),
      labels: { appName: "user-api" },
    }),
  ],
});

const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();

collectDefaultMetrics({ register });

const totalRequests = new client.Counter({
  name: "user_api_total_requests",
  help: "Total number of request to the user-api services",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    totalRequests.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
    });
  });

  next();
});

app.get("/", (req: Request, res: Response) => {
  logger.info("[user-api]: root endpoint accessed.");

  res.status(200).send("Hello from User API");
});

app.get("/metrics", async (req: Request, res: Response) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  logger.info(`User API service listening in port ${PORT}`);
  logger.info(`Loki host configurated to run at: ${LOKI_HOST}`);
});
