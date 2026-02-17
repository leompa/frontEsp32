import baseSensorData from '../sensors.json'

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function toPercent(value, min, max) {
  return ((value - min) / (max - min)) * 100
}

export function parseLimits(payload) {
  const parsed = {}

  for (const [sensorName, sensor] of Object.entries(payload || {})) {
    parsed[sensorName] = {
      punto_minimo: sensor.punto_minimo,
      punto_maximo: sensor.punto_maximo
    }
  }

  return parsed
}

export function mergeBaseWithLimits(limits) {
  const merged = {}

  for (const [sensorName, sensor] of Object.entries(baseSensorData)) {
    merged[sensorName] = {
      ...sensor,
      ...(limits?.[sensorName] || {})
    }
  }

  return merged
}

export function applyRealtimePayload(currentSensors, payload) {
  const next = { ...currentSensors }

  for (const [sensorName, update] of Object.entries(payload || {})) {
    if (!next[sensorName]) continue

    next[sensorName] = {
      ...next[sensorName],
      ...(typeof update.temperatura === 'number' ? { temperatura: update.temperatura } : {}),
      ...(typeof update.alarma === 'boolean' ? { alarma: update.alarma } : {})
    }
  }

  return next
}
