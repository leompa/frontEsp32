import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { playAlertTone } from '../utils/audioUtils'
import { SENSOR_POLL_INTERVAL_MS, SENSOR_POLL_URL } from '../config/sensorsConfig'
import { initialSensorStore, sensorReducer, SENSOR_ACTIONS } from '../redux/sensorReducer'

const REPEATING_ALARM_INTERVAL_MS = 900

function buildNoCacheUrl(url) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}t=${Date.now()}`
}

export function useSensorRealtime() {
  const [store, dispatch] = useReducer(sensorReducer, initialSensorStore)
  const [mutedSensors, setMutedSensors] = useState({})
  const [alarmHistory, setAlarmHistory] = useState([])
  const previousSensorsRef = useRef({})
  const repeatingAlarmRef = useRef(null)

  const registerAlarmEvents = useCallback((payload) => {
    const previousSensors = previousSensorsRef.current
    const nextEvents = []

    for (const [sensorName, sensorData] of Object.entries(payload || {})) {
      const hadAlarm = Boolean(previousSensors[sensorName]?.alarma)
      const hasAlarmNow = Boolean(sensorData?.alarma)

      if (!hadAlarm && hasAlarmNow) {
        nextEvents.push({
          id: `${sensorName}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sensor: sensorName,
          activatedAt: new Date().toISOString()
        })
      }
    }

    if (nextEvents.length > 0) {
      setAlarmHistory((current) => [...nextEvents, ...current].slice(0, 100))
    }

    previousSensorsRef.current = payload || {}
  }, [])

  const fetchSensors = useCallback(async () => {
    try {
      dispatch({ type: SENSOR_ACTIONS.SET_STATUS, payload: 'actualizando...' })

      const response = await fetch(buildNoCacheUrl(SENSOR_POLL_URL), { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const payload = await response.json()
      registerAlarmEvents(payload)
      dispatch({ type: SENSOR_ACTIONS.SET_SENSORS, payload })
      dispatch({ type: SENSOR_ACTIONS.SET_STATUS, payload: 'en línea (polling)' })
    } catch (error) {
      dispatch({ type: SENSOR_ACTIONS.SET_STATUS, payload: 'error de carga' })
      console.error('No se pudo actualizar sensores desde JSON:', error)
    }
  }, [registerAlarmEvents])

  useEffect(() => {
    fetchSensors()

    const timer = setInterval(() => {
      fetchSensors()
    }, SENSOR_POLL_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [fetchSensors])

  useEffect(() => {
    const hasActiveUnmutedAlarm = Object.entries(store.sensors).some(
      ([sensorName, sensor]) => Boolean(sensor?.alarma) && !mutedSensors[sensorName]
    )

    if (hasActiveUnmutedAlarm && !repeatingAlarmRef.current) {
      playAlertTone()
      repeatingAlarmRef.current = setInterval(playAlertTone, REPEATING_ALARM_INTERVAL_MS)
      return
    }

    if (!hasActiveUnmutedAlarm && repeatingAlarmRef.current) {
      clearInterval(repeatingAlarmRef.current)
      repeatingAlarmRef.current = null
    }
  }, [store.sensors, mutedSensors])

  useEffect(() => {
    return () => {
      if (repeatingAlarmRef.current) {
        clearInterval(repeatingAlarmRef.current)
        repeatingAlarmRef.current = null
      }
    }
  }, [])

  const reloadSensors = useCallback(async () => {
    dispatch({ type: SENSOR_ACTIONS.RESET_SENSORS })
    previousSensorsRef.current = {}
    await fetchSensors()
  }, [fetchSensors])

  const toggleSensorMute = useCallback((sensorName) => {
    setMutedSensors((current) => ({
      ...current,
      [sensorName]: !current[sensorName]
    }))
  }, [])

  return {
    ...store,
    reloadSensors,
    mutedSensors,
    toggleSensorMute,
    alarmHistory,
    triggerGeneralAlarmTest: playAlertTone
  }
}
