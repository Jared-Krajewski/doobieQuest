/**
 * Logger utility for development and production builds
 * Automatically disables console logs in production
 */
const isDevelopment = import.meta.env.MODE === "development";

export const Logger = {
  log(...args) {
    if (isDevelopment) {
      console.log("[Game]", ...args);
    }
  },

  warn(...args) {
    if (isDevelopment) {
      console.warn("[Game]", ...args);
    }
  },

  error(...args) {
    // Always log errors
    console.error("[Game]", ...args);
  },

  debug(...args) {
    if (isDevelopment) {
      console.log("[Debug]", ...args);
    }
  },

  tilemap(...args) {
    if (isDevelopment) {
      console.log("[Tilemap]", ...args);
    }
  },
};
