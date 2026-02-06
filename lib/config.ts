/**
 * Environment config: use local server in dev, live AWS server in production.
 * Same backend as mrenglish app (mrenglishserverside).
 */

// Set to true for local development, false for live AWS server
export const DEV = false;

// Local server
const LOCAL_BACKEND_URL = "http://localhost:5000";

// Production server (AWS) - same as mrenglish PRODUCTION_URL
const AWS_BACKEND_URL = "http://3.110.94.208:5000";

/** Backend base URL (no /api). */
export const BACKEND_URL = DEV ? LOCAL_BACKEND_URL : AWS_BACKEND_URL;

/** Backend API base (with /api). Use for axios baseURL. */
export const BACKEND_API_URL = `${BACKEND_URL.replace(/\/+$/, "")}/api`;
