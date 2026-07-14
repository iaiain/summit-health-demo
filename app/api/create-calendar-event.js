// Vercel serverless function: POST /api/create-calendar-event
// Creates a Google Calendar event for a confirmed/rescheduled appointment.
// Kept as a standalone endpoint for manual testing (curl/Postman); the webhook calls
// createCalendarEvent() from _lib/google.js directly instead of hitting this over HTTP.
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

import { createCalendarEvent } from './lib/google.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await createCalendarEvent(req.body)
    return res.status(200).json(result)
  } catch (err) {
    console.error('create-calendar-event error:', err)
    return res.status(500).json({ error: 'Failed to create calendar event', detail: err.message })
  }
}
