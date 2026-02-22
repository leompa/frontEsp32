import AlarmHistory from './components/AlarmHistory'
import GaugeList from './components/GaugeList'
import { useSensorRealtime } from './hooks/useSensorRealtime'

export default function App() {
  const {
    sensors,
    connectionStatus,
    reloadSensors,
    mutedSensors,
    toggleSensorMute,
    alarmHistory,
    triggerGeneralAlarmTest
  } = useSensorRealtime()

  const totalSensores = Object.keys(sensors).length

  return (
    <main className="app">
      <header>
        <h1>Monitoreo Dinámico de Sensores</h1>
        <p>Los sensores se actualizan cada 2 segundos desde una URL JSON.</p>
        <p>Sensores detectados: {totalSensores}</p>
        <p className="connection-status">Estado polling: {connectionStatus}</p>
        <div className="header-actions">
          <button type="button" className="reload-button" onClick={reloadSensors}>
            Reload
          </button>
          <button type="button" className="general-test-button" onClick={triggerGeneralAlarmTest}>
            Test alarma general
          </button>
        </div>
      </header>

      <GaugeList sensors={sensors} mutedSensors={mutedSensors} onToggleMute={toggleSensorMute} />
      <AlarmHistory events={alarmHistory} />
    </main>
  )
}
