import baseSensorData from '../sensors.json'
import { GLOBAL_MAX, GLOBAL_MIN } from '../config/sensorsConfig'

function hasNumeric(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function normalizeSensor(sensor = {}, fallback = {}) {
  return {
    temperatura: hasNumeric(sensor.temperatura)
      ? sensor.temperatura
      : hasNumeric(fallback.temperatura)
        ? fallback.temperatura
        : 0,
    punto_minimo: hasNumeric(sensor.punto_minimo)
      ? sensor.punto_minimo
      : hasNumeric(fallback.punto_minimo)
        ? fallback.punto_minimo
        : GLOBAL_MIN,
    punto_maximo: hasNumeric(sensor.punto_maximo)
      ? sensor.punto_maximo
      : hasNumeric(fallback.punto_maximo)
        ? fallback.punto_maximo
        : GLOBAL_MAX,
    alarma: typeof sensor.alarma === 'boolean'
      ? sensor.alarma
      : typeof fallback.alarma === 'boolean'
        ? fallback.alarma
        : false
  }
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function toPercent(value, min, max) {
  return ((value - min) / (max - min)) * 100
}

export function buildSensorsFromConfig(configPayload = {}) {
  const nextSensors = {}
  const sensorNames = new Set([...Object.keys(baseSensorData), ...Object.keys(configPayload || {})])

  for (const sensorName of sensorNames) {
    const baseSensor = baseSensorData[sensorName] || {}
    const incomingSensor = configPayload[sensorName] || {}
    nextSensors[sensorName] = normalizeSensor(incomingSensor, baseSensor)
  }

  return nextSensors
}

export function applyRealtimePayload(currentSensors, payload) {
  const next = { ...currentSensors }

  for (const [sensorName, update] of Object.entries(payload || {})) {
    const current = next[sensorName] || {}
    next[sensorName] = normalizeSensor(
      {
        ...current,
        ...(hasNumeric(update.temperatura) ? { temperatura: update.temperatura } : {}),
        ...(typeof update.alarma === 'boolean' ? { alarma: update.alarma } : {})
      },
      current
    )
  }

  return next
}
