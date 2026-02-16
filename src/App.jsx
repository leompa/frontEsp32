import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import baseSensorData from './sensors.json'

const GLOBAL_MIN = 0
const GLOBAL_MAX = 150
const LIMITS_STORAGE_KEY = 'sensor_limits_v1'
const LIMITS_URL = import.meta.env.VITE_SENSOR_LIMITS_URL || '/sensors-limits.json'
const WS_URL = import.meta.env.VITE_SENSORS_WS_URL || 'ws://localhost:8080'


const initialStore = {
  sensors: mergeBaseWithLimits(),
  connectionStatus: 'conectando'
}

function sensorReducer(state, action) {
  switch (action.type) {
    case 'SET_LIMITS':
      return {
        ...state,
        sensors: mergeBaseWithLimits(action.payload)
      }
    case 'SET_STATUS':
      return {
        ...state,
        connectionStatus: action.payload
      }
    case 'APPLY_REALTIME':
      return {
        ...state,
        sensors: applyRealtimePayload(state.sensors, action.payload)
      }
    default:
      return state
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function toPercent(value, min, max) {
  return ((value - min) / (max - min)) * 100
}

function playAlertTone() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.type = 'square'
  oscillator.frequency.value = 880
  gainNode.gain.value = 0.0001

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  const now = audioContext.currentTime
  gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.02)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

  oscillator.start(now)
  oscillator.stop(now + 0.5)

  oscillator.onended = () => {
    audioContext.close()
  }
}

function parseLimits(payload) {
  const parsed = {}

  for (const [sensorName, sensor] of Object.entries(payload || {})) {
    parsed[sensorName] = {
      punto_minimo: sensor.punto_minimo,
      punto_maximo: sensor.punto_maximo
    }
  }

  return parsed
}

function mergeBaseWithLimits(limits) {
  const merged = {}

  for (const [sensorName, sensor] of Object.entries(baseSensorData)) {
    merged[sensorName] = {
      ...sensor,
      ...(limits?.[sensorName] || {})
    }
  }

  return merged
}

function applyRealtimePayload(currentSensors, payload) {
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

function useSensorRealtime() {
  const [store, dispatch] = useReducer(sensorReducer, initialStore)

  useEffect(() => {
    let isCancelled = false

    async function loadLimits() {
      const cached = localStorage.getItem(LIMITS_STORAGE_KEY)

      if (cached) {
        try {
          const cachedLimits = JSON.parse(cached)
          if (!isCancelled) {
            dispatch({ type: 'SET_LIMITS', payload: cachedLimits })
          }
          return
        } catch (error) {
          console.warn('Cache de límites inválida, se recargará desde API:', error)
        }
      }

      const response = await fetch(LIMITS_URL)
      const payload = await response.json()
      const fetchedLimits = parseLimits(payload)
      localStorage.setItem(LIMITS_STORAGE_KEY, JSON.stringify(fetchedLimits))

      if (!isCancelled) {
        dispatch({ type: 'SET_LIMITS', payload: fetchedLimits })
      }
    }

    loadLimits().catch((error) => {
      console.error('No se pudieron cargar límites iniciales:', error)
    })

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    let socket
    let reconnectTimer
    let unmounted = false

    const connectSocket = () => {
      dispatch({ type: 'SET_STATUS', payload: 'conectando' })
      socket = new WebSocket(WS_URL)

      socket.onopen = () => {
        if (!unmounted) {
          dispatch({ type: 'SET_STATUS', payload: 'en línea' })
        }
      }

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          dispatch({ type: 'APPLY_REALTIME', payload })
        } catch (error) {
          console.error('Mensaje WS inválido:', error)
        }
      }

      socket.onerror = () => {
        if (!unmounted) {
          dispatch({ type: 'SET_STATUS', payload: 'error' })
        }
      }

      socket.onclose = () => {
        if (!unmounted) {
          dispatch({ type: 'SET_STATUS', payload: 'reconectando...' })
          reconnectTimer = setTimeout(connectSocket, 2000)
        }
      }
    }

    connectSocket()

    return () => {
      unmounted = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
    }
  }, [])

  return store
}

function Gauge({ name, temperatura, punto_minimo, punto_maximo, alarma }) {
  const [isTestingAlarm, setIsTestingAlarm] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const minLimit = typeof punto_minimo === 'number' ? punto_minimo : GLOBAL_MIN
  const maxLimit = typeof punto_maximo === 'number' ? punto_maximo : GLOBAL_MAX

  const tempClamped = clamp(temperatura, GLOBAL_MIN, GLOBAL_MAX)
  const minClamped = clamp(minLimit, GLOBAL_MIN, GLOBAL_MAX)
  const maxClamped = clamp(maxLimit, GLOBAL_MIN, GLOBAL_MAX)

  const gaugeStyle = {
    '--temp-position': `${toPercent(tempClamped, GLOBAL_MIN, GLOBAL_MAX)}%`,
    '--safe-start': `${toPercent(minClamped, GLOBAL_MIN, GLOBAL_MAX)}%`,
    '--safe-end': `${toPercent(maxClamped, GLOBAL_MIN, GLOBAL_MAX)}%`
  }

  const triggerAlarmTest = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setIsTestingAlarm(true)
    playAlertTone()

    timeoutRef.current = setTimeout(() => {
      setIsTestingAlarm(false)
      timeoutRef.current = null
    }, 2000)
  }

  return (
    <article className={`card ${alarma ? 'alarm' : ''} ${isTestingAlarm ? 'alarm-test' : ''}`}>
      <h2>{name.replace('_', ' ').toUpperCase()}</h2>
      <p className="value">{temperatura.toFixed(1)} °C</p>

      <div className="gauge" style={gaugeStyle}>
        <div className="gauge-line" />
        <div className="temp-marker" />
        <div className="safe-zone" />
      </div>

      <div className="labels">
        <span>Escala global: {GLOBAL_MIN} - {GLOBAL_MAX}</span>
        <span>Zona ideal: {minLimit} - {maxLimit}</span>
      </div>

      <p className={`alarm-status ${alarma ? 'active' : ''}`}>
        {alarma ? '⚠️ Alarma activa' : '✅ Normal'}
      </p>

      <button type="button" className="test-button" onClick={triggerAlarmTest}>
        Test alarma
      </button>
    </article>
  )
}

export default function App() {
  const { sensors, connectionStatus } = useSensorRealtime()
  const sensorEntries = useMemo(() => Object.entries(sensors), [sensors])

  return (
    <main className="app">
      <header>
        <h1>Monitoreo de 5 Sensores</h1>
        <p>Se cargan límites al inicio y luego se actualiza temperatura/alarma en tiempo real por WebSocket.</p>
        <p className="connection-status">Estado WS: {connectionStatus}</p>
      </header>

      <section className="grid">
        {sensorEntries.map(([name, sensor]) => (
          <Gauge key={name} name={name} {...sensor} />
        ))}
      </section>
    </main>
  )
}
