import { useState } from 'react'
import { startCall, stopCall } from '../lib/vapiClient'

export default function VoiceWidget({ onCallStart, onCallEnd }) {
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)

  const handleStart = () => {
    setError(null)
    try {
      startCall({
        onCallStart: () => {
          setActive(true)
          onCallStart?.()
        },
        onCallEnd: () => {
          setActive(false)
          onCallEnd?.()
        },
        onError: (e) => setError(e?.message || 'Call failed to start'),
      })
    } catch (e) {
      setError(e.message)
    }
  }

  const handleStop = () => {
    stopCall()
    setActive(false)
    onCallEnd?.()
  }

  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-xs text-sunrise">{error}</span>}
      {!active ? (
        <button
          onClick={handleStart}
          className="px-4 py-2 rounded-full bg-pine text-mist text-sm font-medium hover:bg-pine-dark transition-colors"
        >
          Call Sage — try the agent
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="px-4 py-2 rounded-full bg-sunrise text-mist text-sm font-medium hover:opacity-90 transition-opacity"
        >
          End call
        </button>
      )}
    </div>
  )
}
