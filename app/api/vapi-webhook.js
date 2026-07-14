// Vercel serverless function: POST /api/vapi-webhook
// Set this URL as the assistant's "serverUrl" in VAPI (see vapi/assistant-config.json).
// VAPI calls this endpoint whenever the assistant invokes one of the functions defined
// in assistant-config.json. This handler dispatches to the scheduling logic and, where
// relevant, forwards to the Sheets/Calendar functions.
//
// This starter uses a simple in-memory store for availability/waitlist so the demo works
// out of the box. Swap `schedulingStore` for a real DB (Postgres, Airtable, etc.) if you
// want state to persist across serverless invocations — right now it will reset on cold start,
// which is fine for a live demo but not for production.

import { logToSheet, createCalendarEvent } from './lib/google.js'

const schedulingStore = {
  appointments: {},
  waitlist: [],
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const message = req.body?.message
  const toolCallList = message?.toolCallList || message?.toolCalls

  // Current Vapi server-message format: message.type === 'tool-calls', with an array of
  // { id, function: { name, arguments } } at message.toolCallList. The response must be
  // { results: [{ toolCallId, result }] } with `result` as a STRING (stringify objects).
  if (!message || message.type !== 'tool-calls' || !Array.isArray(toolCallList)) {
    return res.status(200).json({ received: true })
  }

  const results = []
  for (const toolCall of toolCallList) {
    const toolCallId = toolCall.id
    const name = toolCall.function?.name
    const parameters = toolCall.function?.arguments || {}
    let result
    try {
      result = await dispatch(name, parameters)
    } catch (err) {
      result = { error: err.message || 'Unhandled error' }
    }
    results.push({ toolCallId, result: JSON.stringify(result) })
  }

  return res.status(200).json({ results })
}

async function dispatch(name, parameters) {
  let result

  switch (name) {
    case 'check_availability':
      // Demo logic: return a couple of plausible open slots. Replace with a real
      // calendar-availability query (e.g., FreeBusy via Google Calendar API) for production.
      result = {
        slots: [
          { datetime: nextWeekday(1, 10), provider: parameters.provider || 'Dr. Patel' },
          { datetime: nextWeekday(3, 14), provider: parameters.provider || 'Dr. Nunez' },
        ],
      }
      break

    case 'check_patient_history':
      // Demo logic: flag a no-show pattern for a specific test name so you can showcase
      // Scenario 4 live. Replace with a real patient-history lookup.
      result = {
        no_show_count_last_year: parameters.patient_name?.toLowerCase().includes('devon') ? 3 : 0,
        pattern: parameters.patient_name?.toLowerCase().includes('devon') ? 'habitual_no_show' : 'none',
      }
      break

    case 'book_appointment': {
      const id = `APT-${Date.now()}`
      schedulingStore.appointments[id] = parameters
      await logToSheet({
        id,
        patient_name: parameters.patient_name,
        visit_type: parameters.visit_type,
        provider: parameters.provider,
        slot_datetime: parameters.slot_datetime,
        outcome: 'booked',
        notes: parameters.notes || '',
      })
      await createCalendarEvent(parameters)
      result = { success: true, appointment_id: id }
      break
    }

    case 'book_linked_appointment': {
      // Demo logic: books both legs of a double-resource visit (ultrasound → MD follow-up),
      // enforcing that the ultrasound leg is sequenced first. Replace with a real transactional
      // booking against your scheduling system so both legs succeed or fail together.
      if (new Date(parameters.ultrasound_slot) >= new Date(parameters.followup_slot)) {
        result = { success: false, error: 'ultrasound_slot must be before followup_slot' }
        break
      }
      const ultrasoundId = `APT-${Date.now()}-US`
      const followupId = `APT-${Date.now()}-FU`
      schedulingStore.appointments[ultrasoundId] = { ...parameters, visit_type: 'ultrasound', slot_datetime: parameters.ultrasound_slot }
      schedulingStore.appointments[followupId] = { ...parameters, visit_type: 'md_followup', slot_datetime: parameters.followup_slot }
      await logToSheet({
        id: ultrasoundId,
        patient_name: parameters.patient_name,
        visit_type: 'Ultrasound (linked)',
        provider: parameters.provider,
        slot_datetime: parameters.ultrasound_slot,
        outcome: 'booked',
        notes: `Linked to follow-up ${followupId}`,
      })
      await logToSheet({
        id: followupId,
        patient_name: parameters.patient_name,
        visit_type: 'MD Follow-Up (linked)',
        provider: parameters.provider,
        slot_datetime: parameters.followup_slot,
        outcome: 'booked',
        notes: `Linked to ultrasound ${ultrasoundId}`,
      })
      await createCalendarEvent({ ...parameters, visit_type: 'Ultrasound', slot_datetime: parameters.ultrasound_slot })
      await createCalendarEvent({ ...parameters, visit_type: 'MD Follow-Up', slot_datetime: parameters.followup_slot })
      result = { success: true, ultrasound_appointment_id: ultrasoundId, followup_appointment_id: followupId }
      break
    }

    case 'transfer_to_nurse':
      // Demo logic: logs the escalation. Wire this to your real warm-transfer mechanism
      // (VAPI supports call transfer natively — see VAPI docs for `transferCall`).
      result = { success: true, transferred: true, reason: parameters.reason }
      break

    case 'reschedule_appointment': {
      const existing = schedulingStore.appointments[parameters.appointment_id] || {}
      schedulingStore.appointments[parameters.appointment_id] = {
        ...existing,
        slot_datetime: parameters.new_slot_datetime,
      }
      await logToSheet({
        id: parameters.appointment_id,
        patient_name: existing.patient_name || 'Unknown',
        visit_type: existing.visit_type || '',
        provider: existing.provider || '',
        slot_datetime: parameters.new_slot_datetime,
        outcome: 'rescheduled',
        notes: parameters.reason || '',
      })
      result = { success: true, freed_slot: existing.slot_datetime || null }
      break
    }

    case 'check_waitlist':
      result = { matches: schedulingStore.waitlist.filter(w => w.visit_type === parameters.visit_type) }
      break

    case 'add_to_waitlist':
      schedulingStore.waitlist.push(parameters)
      result = { success: true }
      break

    case 'create_calendar_event':
      result = await createCalendarEvent(parameters)
      break

    case 'log_call_summary':
      result = await logToSheet({
        id: `CALL-${Date.now()}`,
        patient_name: parameters.patient_name,
        outcome: parameters.outcome,
        notes: parameters.notes || '',
      })
      break

    default:
      result = { error: `Unknown function: ${name}` }
  }

  return result
}

function nextWeekday(daysFromNow, hour) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}
