# Summit Health OB/GYN — Voice Agent Demo

Everything needed to wire this up live is in this folder. Rough time to a working demo once
you're at your computer: **60–90 minutes**, mostly waiting on Google Cloud/VAPI dashboards.



## What's here

```
vapi/
  system-prompt.md        → paste into VAPI assistant's system prompt
  assistant-config.json   → full assistant config (voice, functions, first message)
app/
  src/                    → React dashboard (Vite + Tailwind)
  api/                    → Vercel serverless functions (Sheets, Calendar, VAPI webhook)
  .env.example            → copy to .env.local and fill in
```

## Setup order (do these in sequence)

### 1. Google Cloud (10 min)
1. Create a project at console.cloud.google.com.
2. Enable **Google Sheets API** and **Google Calendar API**.
3. Create a **Service Account** → generate a JSON key → download it.
4. Create a Google Sheet named "Summit Health – Patient Log" with header row:
   `id | patient_name | visit_type | provider | slot_datetime | outcome | notes | logged_at`
   Share it with the service account's email (Editor access).
5. Create/use a Google Calendar for the practice, share it with the service account
   ("Make changes to events").

### 2. VAPI (15 min)
1. Sign up at vapi.ai (free tier is enough for a demo).
2. Create a new Assistant. Paste `vapi/system-prompt.md` as the system prompt.
3. Add the functions/tools from `vapi/assistant-config.json` (either via the UI's function
   builder, or via VAPI's API/CLI using the JSON directly).
4. Pick a voice (ElevenLabs voice recommended for warmth — swap the placeholder `voiceId`).
5. Grab your **Public Key** and this **Assistant ID** — you'll need both for the app.

6. Leave `serverUrl` blank for now; you'll set it after deploying (step 4).

### 3. The app (20 min)
```bash
cd app
npm install
cp .env.example .env.local
# fill in VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID now
npm run dev
```
The dashboard will load with mock data immediately — you can iterate on design/copy before
wiring anything live.

### 4. Deploy + connect the webhook (15 min)
1. Push this to a GitHub repo, import into Vercel.
2. In Vercel → Environment Variables, add all vars from `.env.example` (the Google ones go
   in as server-only, no `VITE_` prefix — that's already handled).
3. For `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, paste the full key from the JSON file including
   `-----BEGIN PRIVATE KEY-----` / `-----END PRIVATE KEY-----`, keeping the `\n` line breaks.
4. Set `PUBLIC_BASE_URL` to your deployed Vercel URL (e.g. `https://summit-health-demo.vercel.app`).
5. Back in VAPI, set the assistant's `serverUrl` to `https://YOUR_DEPLOY_URL/api/vapi-webhook`.
6. Also `npm install googleapis @vapi-ai/web` in `/app` if you haven't already (they're in
   package.json, this just confirms they're installed).

### 5. Test end to end
- Click "Call Sage" on the dashboard, or call your VAPI phone number if you provisioned one.
- Try a reschedule scenario ("I need to move my Thursday appointment") and confirm a row
  lands in your Google Sheet and an event appears on the Calendar.
- Swap the mock data in `src/data/mockData.js` for live data once you're ready (or leave the
  dashboard on mock data for a controlled, repeatable sales demo — many teams do this
  deliberately so the walkthrough never has a live-call surprise).

## For the walkthrough video / onsite demo
See `video-script.md` for a sales-narrative script structure, and the disclaimer in the
assignment: Assort won't use this code — the point is showing you can tell the story and
ship a believable, working system under time pressure.
