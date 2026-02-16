import sensorData from './sensors.json'
import { useEffect, useRef, useState } from 'react'

const GLOBAL_MIN = 0
const GLOBAL_MAX = 150

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

  const tempClamped = clamp(temperatura, GLOBAL_MIN, GLOBAL_MAX)
  const minClamped = clamp(punto_minimo, GLOBAL_MIN, GLOBAL_MAX)
  const maxClamped = clamp(punto_maximo, GLOBAL_MIN, GLOBAL_MAX)

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
        <span>Zona ideal: {punto_minimo} - {punto_maximo}</span>
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
  return (
    <main className="app">
      <header>
        <h1>Monitoreo de 5 Sensores</h1>
        <p>Marcadores con escala variable por sensor y rango configurable de 0 a 150.</p>
      </header>

      <section className="grid">
        {Object.entries(sensorData).map(([name, sensor]) => (
          <Gauge key={name} name={name} {...sensor} />
        ))}
      </section>
    </main>
  )
}
