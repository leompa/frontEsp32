import Gauge from './Gauge'

export default function GaugeList({ sensors, mutedSensors, onToggleMute }) {
  return (
    <section className="grid">
      {Object.entries(sensors).map(([name, sensor]) => (
        <Gauge
          key={name}
          name={name}
          {...sensor}
          isMuted={Boolean(mutedSensors[name])}
          onToggleMute={onToggleMute}
        />
      ))}
    </section>
  )
}
