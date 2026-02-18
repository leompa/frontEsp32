import Gauge from './Gauge'

export default function GaugeList({ sensors }) {
  return (
    <section className="grid">
      {Object.entries(sensors).map(([name, sensor]) => (
        <Gauge key={name} name={name} {...sensor} />
      ))}
    </section>
  )
}
