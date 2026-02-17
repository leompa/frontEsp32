import GaugeList from './components/GaugeList'
import { useSensorRealtime } from './hooks/useSensorRealtime'

export default function App() {
  const { sensors, connectionStatus } = useSensorRealtime()
  const totalSensores = Object.keys(sensors).length

  return (
    <main className="app">
      <header>
        <h1>Monitoreo Dinámico de Sensores</h1>
        <p>Se carga configuración inicial de sensores y luego se actualiza temperatura/alarma en tiempo real por WebSocket.</p>
        <p>Sensores detectados: {totalSensores}</p>
        <p className="connection-status">Estado WS: {connectionStatus}</p>
      </header>

      <GaugeList sensors={sensors} />
    </main>
  )
}
