export default function Header({ isCallActive }) {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-pine-light">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-pine flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 13L6 6L9 10L14 3" stroke="#F5F6F2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-xl leading-tight text-ink">Summit Health OB/GYN</h1>
          <p className="font-mono text-xs text-fog tracking-wide">Scheduling Desk</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pine-light">
        <span className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-sunrise animate-pulse' : 'bg-pine'}`} />
        <span className="font-mono text-xs text-pine-dark">
          {isCallActive ? 'Sage is on a call' : 'Sage is listening'}
        </span>
      </div>
    </header>
  )
}
