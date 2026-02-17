import GaugeList from './components/GaugeList'
import { useSensorRealtime } from './hooks/useSensorRealtime'

export default function App() {
  const { sensors, connectionStatus } = useSensorRealtime()

  return (
    <main className="app">
      <header>
        <h1>Monitoreo de 5 Sensores</h1>
        <p>Se cargan límites al inicio y luego se actualiza temperatura/alarma en tiempo real por WebSocket.</p>
        <p className="connection-status">Estado WS: {connectionStatus}</p>
      </header>

      <GaugeList sensors={sensors} />
    </main>
  )
}
