// Vercel serverless function: POST /api/log-to-sheet
// Appends a row to the practice's Google Sheet acting as a lightweight CRM.
// Kept as a standalone endpoint for manual testing (curl/Postman); the webhook calls
// logToSheet() from _lib/google.js directly instead of hitting this over HTTP.
//
// SETUP (do this once, at home):
// 1. In Google Cloud Console, create a project and enable the "Google Sheets API".
// 2. Create a Service Account, generate a JSON key.
// 3. Create a Google Sheet ("Summit Health - Patient Log"), add header row:
//    id | patient_name | visit_type | provider | slot_datetime | outcome | notes | logged_at
// 4. Share that Sheet with the service account's email (found in the JSON key) as an Editor.
// 5. Set these env vars in Vercel (Project Settings → Environment Variables):
//    GOOGLE_SERVICE_ACCOUNT_EMAIL
//    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY   (paste the key, keep \n escaped)
//    GOOGLE_SHEET_ID                      (from the sheet's URL)

import { logToSheet } from './_lib/google.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await logToSheet(req.body)
    return res.status(200).json(result)
  } catch (err) {
    console.error('log-to-sheet error:', err)
    return res.status(500).json({ error: 'Failed to log to sheet', detail: err.message })
  }
}
