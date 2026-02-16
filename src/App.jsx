import sensorData from './sensors.json'

const GLOBAL_MIN = 0
const GLOBAL_MAX = 150

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function toPercent(value, min, max) {
  return ((value - min) / (max - min)) * 100
}

function Gauge({ name, temperatura, punto_minimo, punto_maximo, alarma }) {
  const tempClamped = clamp(temperatura, GLOBAL_MIN, GLOBAL_MAX)
  const minClamped = clamp(punto_minimo, GLOBAL_MIN, GLOBAL_MAX)
  const maxClamped = clamp(punto_maximo, GLOBAL_MIN, GLOBAL_MAX)

  const gaugeStyle = {
    '--temp-position': `${toPercent(tempClamped, GLOBAL_MIN, GLOBAL_MAX)}%`,
    '--safe-start': `${toPercent(minClamped, GLOBAL_MIN, GLOBAL_MAX)}%`,
    '--safe-end': `${toPercent(maxClamped, GLOBAL_MIN, GLOBAL_MAX)}%`
  }

  return (
    <article className={`card ${alarma ? 'alarm' : ''}`}>
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
