import { useEffect, useRef, useState } from 'react'
import { playAlertTone } from '../utils/audioUtils'
import { GLOBAL_MAX, GLOBAL_MIN } from '../config/sensorsConfig'
import { clamp, toPercent } from '../utils/sensorUtils'

const TEST_ALARM_DURATION_MS = 2000
const TEST_ALARM_DURATION_SECONDS = TEST_ALARM_DURATION_MS / 1000

export default function Gauge({ name, temperatura, punto_minimo, punto_maximo, alarma }) {
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
    }, TEST_ALARM_DURATION_MS)
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
        Test alarma ({TEST_ALARM_DURATION_SECONDS} segundos)
      </button>
    </article>
  )
}
