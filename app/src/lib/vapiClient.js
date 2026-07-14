// Wraps the VAPI Web SDK so the dashboard can start/stop a real voice call in-browser.
//
// SETUP (do this once, at home):
// 1. Create a VAPI account at vapi.ai, create the assistant using vapi/assistant-config.json
//    (either paste the system prompt + functions in the dashboard UI, or use the VAPI CLI/API
//    to create it from the JSON directly).
// 2. Grab your VAPI "Public Key" from Dashboard → API Keys, and your Assistant ID.
// 3. Create a .env.local file in /app with:
//      VITE_VAPI_PUBLIC_KEY=your_public_key
//      VITE_VAPI_ASSISTANT_ID=your_assistant_id

import Vapi from '@vapi-ai/web'

let vapiInstance = null

export function getVapi() {
  if (!vapiInstance) {
    vapiInstance = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY)
  }
  return vapiInstance
}

export function startCall(onEvents = {}) {
  const vapi = getVapi()
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID

  if (onEvents.onCallStart) vapi.on('call-start', onEvents.onCallStart)
  if (onEvents.onCallEnd) vapi.on('call-end', onEvents.onCallEnd)
  if (onEvents.onMessage) vapi.on('message', onEvents.onMessage)
  if (onEvents.onError) vapi.on('error', onEvents.onError)

  vapi.start(assistantId)
  return vapi
}

export function stopCall() {
  if (vapiInstance) vapiInstance.stop()
}
