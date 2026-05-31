import { env } from "@/lib/config/env";

type LogLevel = "info" | "warn" | "error" | "debug";
type LogMeta = Record<string, unknown>;

const write = (
  level: LogLevel,
  context: string,
  message: string,
  meta?: LogMeta,
) => {
  if (level === "debug" && env.NODE_ENV === "production") {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${context}]`;

  if (meta) {
    console[level](prefix, message, meta);
    return;
  }

  console[level](prefix, message);
};

export const logger = {
  info: (context: string, message: string, meta?: LogMeta) =>
    write("info", context, message, meta),
  warn: (context: string, message: string, meta?: LogMeta) =>
    write("warn", context, message, meta),
  error: (context: string, message: string, meta?: LogMeta) =>
    write("error", context, message, meta),
  debug: (context: string, message: string, meta?: LogMeta) =>
    write("debug", context, message, meta),
};
