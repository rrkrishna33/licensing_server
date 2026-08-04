type LogLevel = "INFO" | "WARN" | "ERROR";

function writeLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const payload = meta ? ` ${JSON.stringify(meta)}` : "";
  const line = `[${timestamp}] [${level}] ${message}${payload}`;

  if (level === "ERROR") {
    console.error(line);
    return;
  }

  if (level === "WARN") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => writeLog("INFO", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => writeLog("WARN", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => writeLog("ERROR", message, meta)
};
