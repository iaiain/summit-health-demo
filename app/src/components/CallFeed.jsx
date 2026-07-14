const outcomeStyles = {
  booked: 'bg-pine-light text-pine-dark',
  rescheduled: 'bg-sunrise-light text-sunrise',
  waitlisted: 'bg-fog/15 text-fog',
}

export default function CallFeed({ calls }) {
  return (
    <div className="bg-surface rounded-2xl border border-pine-light p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-ink">Live Call Feed</h2>
        <span className="font-mono text-xs text-fog">{calls.length} calls today</span>
      </div>

      <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
        {calls.map((call) => (
          <div key={call.id} className="border border-pine-light/70 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-ink">{call.patient}</p>
                <p className="font-mono text-xs text-fog">{call.time}</p>
              </div>
              <span className={`text-xs font-mono px-2 py-1 rounded-full capitalize ${outcomeStyles[call.outcome]}`}>
                {call.outcome}
              </span>
            </div>
            <div className="space-y-1.5 mt-3">
              {call.transcript.map((line, i) => (
                <p key={i} className={`text-sm ${line.role === 'agent' ? 'text-pine-dark' : 'text-ink/80'}`}>
                  <span className="font-mono text-[10px] uppercase text-fog mr-1.5">
                    {line.role === 'agent' ? 'Sage' : 'Patient'}
                  </span>
                  {line.text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
