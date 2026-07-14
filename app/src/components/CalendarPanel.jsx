const statusStyles = {
  confirmed: 'bg-pine-light text-pine-dark',
  open: 'bg-fog/10 text-fog border border-dashed border-fog/40',
  pending: 'bg-sunrise-light text-sunrise',
}

export default function CalendarPanel({ slots, waitlist }) {
  return (
    <div className="bg-surface rounded-2xl border border-pine-light p-5">
      <h2 className="font-display text-lg text-ink mb-4">Today's Calendar</h2>
      <div className="space-y-2 mb-6">
        {slots.map((slot, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-lg px-3 py-2 ${statusStyles[slot.status]}`}
          >
            <div>
              <p className="font-mono text-xs">{slot.time}</p>
              <p className="text-sm font-medium">{slot.patient || slot.visitType}</p>
              {slot.patient && <p className="text-xs opacity-70">{slot.visitType} · {slot.provider}</p>}
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-mono text-xs uppercase tracking-wide text-fog mb-2">Waitlist</h3>
      <div className="space-y-2">
        {waitlist.map((w, i) => (
          <div key={i} className="flex items-center justify-between text-sm border-b border-pine-light/70 pb-2">
            <span className="text-ink">{w.patient}</span>
            <span className="text-fog text-xs">{w.visitType} · {w.window}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
