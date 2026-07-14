// Vercel serverless function: POST /api/create-calendar-event
// Creates a Google Calendar event for a confirmed/rescheduled appointment.
//
// SETUP (do this once, at home):
// 1. In the same Google Cloud project, enable the "Google Calendar API".
// 2. Reuse the same service account from log-to-sheet.js.
// 3. In Google Calendar, create (or use) a calendar for the practice, and share it with the
//    service account email as "Make changes to events".
// 4. Set these env vars in Vercel:
//    GOOGLE_SERVICE_ACCOUNT_EMAIL          (same as sheets)
//    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY    (same as sheets)
//    GOOGLE_CALENDAR_ID                    (the calendar's ID, found in Calendar settings)

import { google } from 'googleapis'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { patient_name, visit_type, provider, slot_datetime, duration_minutes } = req.body
    const durationMin = duration_minutes || 30

    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/calendar']
    )

    const calendar = google.calendar({ version: 'v3', auth })

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

    return res.status(200).json({ success: true, eventId: event.data.id, htmlLink: event.data.htmlLink })
  } catch (err) {
    console.error('create-calendar-event error:', err)
    return res.status(500).json({ error: 'Failed to create calendar event', detail: err.message })
  }
}
