import pino from "pino";
import pinoPretty from "pino-pretty";

const isDev = process.env.NODE_ENV === "development";

const transport = isDev
  ? pinoPretty({ colorize: true, translateTime: "SYS:standard" })
  : undefined;

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);

export default logger;
