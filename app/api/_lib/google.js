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
