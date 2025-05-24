import express, { Request, Response } from "express";
import winston from "winston";

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

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Hello");
});

app.listen(PORT, () => {
  logger.info(`User API service listening in port ${PORT}`);
});
