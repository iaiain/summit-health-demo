import { useState } from 'react'
import Header from './components/Header'
import MetricCard from './components/MetricCard'
import CallFeed from './components/CallFeed'
import CalendarPanel from './components/CalendarPanel'
import PatientLog from './components/PatientLog'
import VoiceWidget from './components/VoiceWidget'
import { metrics, callFeed, calendarSlots, waitlist, patientLog } from './data/mockData'

export default function App() {
  const [isCallActive, setIsCallActive] = useState(false)

  return (
    <div className="min-h-screen">
      <Header isCallActive={isCallActive} />

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-fog mb-1">Today at Summit Health</p>
            <h2 className="font-display text-2xl text-ink">Every reschedule is a slot worth saving.</h2>
          </div>
          <VoiceWidget
            onCallStart={() => setIsCallActive(true)}
            onCallEnd={() => setIsCallActive(false)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Slots Recovered This Week"
            value={`+${metrics.slotsRecovered.value}`}
            sparkline={metrics.slotsRecovered.trend}
            sub="Reschedules & cancellations backfilled from the waitlist"
            accent
          />
          <MetricCard
            label="Calls Handled"
            value={metrics.callsHandled.value}
            sub={metrics.callsHandled.delta}
          />
          <MetricCard
            label="No-Show Risk"
            value={`${metrics.noShowRisk.value}%`}
            sub={metrics.noShowRisk.label}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CallFeed calls={callFeed} />
          </div>
          <CalendarPanel slots={calendarSlots} waitlist={waitlist} />
        </div>

        <PatientLog rows={patientLog} />
      </main>

      <footer className="max-w-6xl mx-auto px-8 py-6 text-xs text-fog font-mono">
        Demo build — Sage voice agent (VAPI) · Google Sheets CRM · Google Calendar
      </footer>
    </div>
  )
}
