import winston from "winston";

// Single shared logger. Writes structured JSON in production (so it can be
// tailed/ingested on the VPS), pretty-prints in development.
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format:
    process.env.NODE_ENV === "production"
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: "HH:mm:ss" }),
          winston.format.printf(
            ({ timestamp, level, message, ...meta }) =>
              `${timestamp} ${level}: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ""
              }`
          )
        ),
  transports: [new winston.transports.Console()],
});
