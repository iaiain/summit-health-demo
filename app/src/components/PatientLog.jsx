export default function PatientLog({ rows }) {
  return (
    <div className="bg-surface rounded-2xl border border-pine-light p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-ink">Patient Log</h2>
        <span className="font-mono text-xs text-fog">synced to Google Sheets + Calendar</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-xs uppercase text-fog border-b border-pine-light">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Patient</th>
              <th className="py-2 pr-4">Visit</th>
              <th className="py-2 pr-4">Provider</th>
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Outcome</th>
              <th className="py-2 pr-4">Synced</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-pine-light/50">
                <td className="py-2 pr-4 font-mono text-xs text-fog">{r.id}</td>
                <td className="py-2 pr-4 text-ink font-medium">{r.patient}</td>
                <td className="py-2 pr-4 text-ink/80">{r.visitType}</td>
                <td className="py-2 pr-4 text-ink/80">{r.provider}</td>
                <td className="py-2 pr-4 text-ink/80">{r.datetime}</td>
                <td className="py-2 pr-4">{r.outcome}</td>
                <td className="py-2 pr-4 text-xs text-pine-dark">{r.syncedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
