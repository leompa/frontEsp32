import GaugeList from './components/GaugeList'
import { useSensorRealtime } from './hooks/useSensorRealtime'

export default function App() {
  const { sensors, connectionStatus, reloadSensors } = useSensorRealtime()
  const totalSensores = Object.keys(sensors).length

  return (
    <main className="app">
      <header>
        <h1>Monitoreo Dinámico de Sensores</h1>
        <p>Los sensores se actualizan cada 2 segundos desde una URL JSON.</p>
        <p>Sensores detectados: {totalSensores}</p>
        <p className="connection-status">Estado polling: {connectionStatus}</p>
        <button type="button" className="reload-button" onClick={reloadSensors}>
          Reload
        </button>
      </header>

      <GaugeList sensors={sensors} />
    </main>
  )
}
