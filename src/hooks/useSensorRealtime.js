import { useCallback, useEffect, useReducer } from 'react'
import { SENSOR_POLL_INTERVAL_MS, SENSOR_POLL_URL } from '../config/sensorsConfig'
import { initialSensorStore, sensorReducer, SENSOR_ACTIONS } from '../redux/sensorReducer'

function buildNoCacheUrl(url) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}t=${Date.now()}`
}

export function useSensorRealtime() {
  const [store, dispatch] = useReducer(sensorReducer, initialSensorStore)

  const fetchSensors = useCallback(async () => {
    try {
      dispatch({ type: SENSOR_ACTIONS.SET_STATUS, payload: 'actualizando...' })

      const response = await fetch(buildNoCacheUrl(SENSOR_POLL_URL), { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const payload = await response.json()
      dispatch({ type: SENSOR_ACTIONS.SET_SENSORS, payload })
      dispatch({ type: SENSOR_ACTIONS.SET_STATUS, payload: 'en línea (polling)' })
    } catch (error) {
      dispatch({ type: SENSOR_ACTIONS.SET_STATUS, payload: 'error de carga' })
      console.error('No se pudo actualizar sensores desde JSON:', error)
    }
  }, [])

  useEffect(() => {
    fetchSensors()

    const timer = setInterval(() => {
      fetchSensors()
    }, SENSOR_POLL_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [fetchSensors])

  const reloadSensors = useCallback(async () => {
    dispatch({ type: SENSOR_ACTIONS.RESET_SENSORS })
    await fetchSensors()
  }, [fetchSensors])

  return {
    ...store,
    reloadSensors
  }
}
