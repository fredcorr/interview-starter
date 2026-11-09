import "server-only";

type Level = "info" | "warn" | "error";
type Context = Record<string, unknown>;

/** One JSON line per event, so logs can be searched by event or requestId. */
const write = (level: Level, event: string, context: Context) => {
  console[level](
    JSON.stringify({
      level,
      event,
      timestamp: new Date().toISOString(),
      ...context,
    }),
  );
};

export const logger = {
  info: (event: string, context: Context = {}) => write("info", event, context),
  warn: (event: string, context: Context = {}) => write("warn", event, context),
  error: (event: string, context: Context = {}) =>
    write("error", event, context),
};
