export default function AlarmHistory({ events }) {
  return (
    <section className="history">
      <h2>Histórico de alarmas</h2>
      {events.length === 0 ? (
        <p className="history-empty">Sin eventos todavía.</p>
      ) : (
        <ul className="history-list">
          {events.map((event) => (
            <li key={event.id}>
              <strong>{event.sensor}</strong> activó alarma a las{' '}
              {new Date(event.activatedAt).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
