export const GLOBAL_MIN = 0
export const GLOBAL_MAX = 150

export const SENSOR_POLL_URL = import.meta.env.VITE_SENSOR_POLL_URL || '/sensors-realtime.json'
export const SENSOR_POLL_INTERVAL_MS = Number(import.meta.env.VITE_SENSOR_POLL_INTERVAL_MS || 2000)
