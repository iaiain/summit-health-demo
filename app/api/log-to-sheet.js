// Vercel serverless function: POST /api/log-to-sheet
// Appends a row to the practice's Google Sheet acting as a lightweight CRM.
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

import { google } from 'googleapis'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id, patient_name, visit_type, provider, slot_datetime, outcome, notes } = req.body

    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    )

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

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('log-to-sheet error:', err)
    return res.status(500).json({ error: 'Failed to log to sheet', detail: err.message })
  }
}
