import { GLOBAL_MAX, GLOBAL_MIN } from '../config/sensorsConfig'
import { clamp, toPercent } from '../utils/sensorUtils'

export default function Gauge({
  name,
  temperatura,
  punto_minimo,
  punto_maximo,
  alarma,
  isMuted,
  onToggleMute
}) {
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
        <span>Zona ideal: {minLimit} - {maxLimit}</span>
      </div>

      <p className={`alarm-status ${alarma ? 'active' : ''}`}>
        {alarma ? `⚠️ Alarma activa ${isMuted ? '(silenciada)' : ''}` : '✅ Normal'}
      </p>

      <button type="button" className="test-button" onClick={() => onToggleMute(name)}>
        {isMuted ? 'Activar alarma sonora' : 'Silenciar alarma'}
      </button>
    </article>
  )
}
