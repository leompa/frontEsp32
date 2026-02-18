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

export function buildSensorsFromConfig(configPayload = {}, options = {}) {
  const nextSensors = {}
  const hasPayload = configPayload && Object.keys(configPayload).length > 0
  const useOnlyPayloadKeys = options.useOnlyPayloadKeys === true && hasPayload

  const sensorNames = useOnlyPayloadKeys
    ? Object.keys(configPayload)
    : [...new Set([...Object.keys(baseSensorData), ...Object.keys(configPayload || {})])]

  for (const sensorName of sensorNames) {
    const baseSensor = baseSensorData[sensorName] || {}
    const incomingSensor = configPayload[sensorName] || {}
    nextSensors[sensorName] = normalizeSensor(incomingSensor, baseSensor)
  }

  return nextSensors
}
