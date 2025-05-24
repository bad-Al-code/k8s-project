import express, { NextFunction, Request, Response } from "express";
import winston from "winston";
import client from "prom-client";

const app = express();
const PORT = process.env.PORT || 8000;

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-api", appName: "user-api" },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
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
  res.status(200).send("Hello");
});

app.get("/metrics", async (req: Request, res: Response) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  logger.info(`User API service listening in port ${PORT}`);
});
