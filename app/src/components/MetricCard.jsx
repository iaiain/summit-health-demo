function Sparkline({ points }) {
  const w = 88
  const h = 32
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w
    const y = h - ((p - min) / range) * h
    return `${x},${y}`
  })
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke="#E8734F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coords[coords.length - 1].split(',')[0]}
        cy={coords[coords.length - 1].split(',')[1]}
        r="3"
        fill="#E8734F"
      />
    </svg>
  )
}

export default function MetricCard({ label, value, suffix, sparkline, sub, accent }) {
  return (
    <div className="bg-surface rounded-2xl border border-pine-light p-5 flex items-center justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-fog mb-1">{label}</p>
        <p className={`font-display text-3xl ${accent ? 'text-sunrise' : 'text-ink'}`}>
          {value}
          {suffix && <span className="text-lg text-fog ml-1">{suffix}</span>}
        </p>
        {sub && <p className="text-xs text-fog mt-1">{sub}</p>}
      </div>
      {sparkline && <Sparkline points={sparkline} />}
    </div>
  )
}
