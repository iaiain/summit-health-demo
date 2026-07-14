// Shared Google Sheets / Calendar helpers.
//
// Used directly by vapi-webhook.js (in-process, no HTTP hop) and also exposed as thin
// standalone endpoints (log-to-sheet.js, create-calendar-event.js) for manual testing via curl.
//
// Requires these env vars in Vercel:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY   (keep \n escaped)
//   GOOGLE_SHEET_ID
//   GOOGLE_CALENDAR_ID

import { google } from 'googleapis'

function getAuth(scopes) {
  return new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes
  )
}

export async function logToSheet({ id, patient_name, visit_type, provider, slot_datetime, outcome, notes }) {
  const auth = getAuth(['https://www.googleapis.com/auth/spreadsheets'])
  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Sheet1!A:H',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        id || `APT-${Date.now()}`,
        patient_name || '',
        visit_type || '',
        provider || '',
        slot_datetime || '',
        outcome || '',
        notes || '',
        new Date().toISOString(),
      ]],
    },
  })

  return { success: true }
}

// Demo simplification: the practice runs on a single shared Google Calendar, and business
// hours/timezone are hardcoded below rather than read from a real provider-schedule system.
// PRACTICE_UTC_OFFSET assumes US Eastern *daylight* time (UTC-4) — correct for summer 2026,
// but will be off by an hour across the DST boundary. For production, swap in a real timezone
// library (e.g. `date-fns-tz` or `luxon`) and per-provider calendars/working hours.
const PRACTICE_UTC_OFFSET = '-04:00'
const BUSINESS_START_HOUR = 9
const BUSINESS_END_HOUR = 17
const SLOT_STEP_MINUTES = 30

const VISIT_DURATION_MINUTES = {
  new_ob_intake: 45,
  routine_prenatal: 20,
  high_risk_prenatal: 30,
  annual_wellness: 30,
  problem_visit: 20,
  procedure: 45,
}

function localSlot(dateStr, hour, minute) {
  // dateStr is 'YYYY-MM-DD'; builds an ISO datetime string at the given local hour/minute
  // in the practice's fixed UTC offset.
  const hh = String(hour).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  return new Date(`${dateStr}T${hh}:${mm}:00${PRACTICE_UTC_OFFSET}`)
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00${PRACTICE_UTC_OFFSET}`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// Per the practice's real scheduling rules: physicians don't take same-day or next-day
// appointments — they require two full days' notice. The nurse practitioner is the one who
// covers same-day/urgent slots instead. We don't have real per-provider calendars in this demo
// (single shared calendar), so we approximate: if the caller asks for the NP by name, allow
// same-day; otherwise (physician or unspecified/"any") enforce the two-day lead time.
const PHYSICIAN_LEAD_DAYS = 2

function isNursePractitionerRequest(provider) {
  const p = (provider || '').toLowerCase()
  return p.includes('nurse') || p.includes('np') || p.includes('practitioner')
}

export async function checkAvailability({ visit_type, provider, date_range_start, date_range_end }) {
  const durationMin = VISIT_DURATION_MINUTES[visit_type] || 30
  const auth = getAuth(['https://www.googleapis.com/auth/calendar.readonly'])
  const calendar = google.calendar({ version: 'v3', auth })

  const rangeStart = localSlot(date_range_start, 0, 0)
  const rangeEndExclusive = new Date(localSlot(date_range_end, 0, 0).getTime() + 24 * 60 * 60000)

  const freebusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: rangeStart.toISOString(),
      timeMax: rangeEndExclusive.toISOString(),
      items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
    },
  })

  const busyBlocks = (freebusy.data.calendars?.[process.env.GOOGLE_CALENDAR_ID]?.busy || [])
    .map(b => ({ start: new Date(b.start), end: new Date(b.end) }))

  const overlaps = (start, end) =>
    busyBlocks.some(b => start < b.end && end > b.start)

  // Never suggest a slot that's already in the past, and enforce the two-day physician
  // lead time (same-day only allowed if the NP was specifically requested).
  const now = new Date()
  const earliestAllowed = isNursePractitionerRequest(provider)
    ? now
    : new Date(now.getTime() + PHYSICIAN_LEAD_DAYS * 24 * 60 * 60000)

  const slots = []
  let cursorDate = date_range_start
  while (cursorDate <= date_range_end && slots.length < 5) {
    const dayOfWeek = new Date(`${cursorDate}T12:00:00${PRACTICE_UTC_OFFSET}`).getUTCDay()
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
    if (isWeekday) {
      for (let minutesFromOpen = 0; ; minutesFromOpen += SLOT_STEP_MINUTES) {
        const startHour = BUSINESS_START_HOUR + Math.floor(minutesFromOpen / 60)
        const startMinute = minutesFromOpen % 60
        if (startHour >= BUSINESS_END_HOUR) break
        const slotStart = localSlot(cursorDate, startHour, startMinute)
        const slotEnd = new Date(slotStart.getTime() + durationMin * 60000)
        if (slotEnd > localSlot(cursorDate, BUSINESS_END_HOUR, 0)) break
        if (slotStart >= earliestAllowed && !overlaps(slotStart, slotEnd)) {
          slots.push({ datetime: slotStart.toISOString(), provider: provider && provider !== 'any' ? provider : 'any available provider' })
          if (slots.length >= 5) break
        }
      }
    }
    cursorDate = addDays(cursorDate, 1)
  }

  return { slots, duration_minutes: durationMin }
}

export async function createCalendarEvent({ patient_name, visit_type, provider, slot_datetime, duration_minutes }) {
  const auth = getAuth(['https://www.googleapis.com/auth/calendar'])
  const calendar = google.calendar({ version: 'v3', auth })

  const durationMin = duration_minutes || 30
  const start = new Date(slot_datetime)
  const end = new Date(start.getTime() + durationMin * 60000)

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: `${visit_type} — ${patient_name}`,
      description: `Provider: ${provider}\nBooked via Sage (Summit Health voice agent)`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    },
  })

  return { success: true, eventId: event.data.id, htmlLink: event.data.htmlLink }
}
