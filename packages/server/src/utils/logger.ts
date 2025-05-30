import winston from "winston"

const { combine, timestamp, errors, json, printf, colorize } = winston.format

// Custom format for development (console)
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ""
  return `${timestamp} [${level}]: ${message}${metaStr}`
})

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    // Console transport with pretty formatting for development
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), consoleFormat),
    }),
  ],
})

// In production, we might want to add file or cloud logging
if (process.env.NODE_ENV === "production") {
  // Add file transport for production
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
  )

  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
  )
}

// Export logger methods
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
}

// For backward compatibility with existing logDebug function
export const logDebug = (message: string, data?: any) => {
  if (data) {
    logger.debug(message, data)
  } else {
    logger.debug(message)
  }
}

// Export the winston logger instance for advanced usage
export { logger }
