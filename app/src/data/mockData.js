// Mock data used until live VAPI calls / Google Sheets / Google Calendar are wired in.
// Shapes here match what the real integrations return — see src/lib/*.js

export const metrics = {
  slotsRecovered: { value: 12, trend: [2, 3, 4, 5, 7, 9, 12] },
  callsHandled: { value: 47, delta: '+8 vs last week' },
  noShowRisk: { value: -18, label: 'No-show risk this week' },
}

export const callFeed = [
  {
    id: 'c1',
    patient: 'Maria Alvarez',
    time: '9:42 AM',
    outcome: 'rescheduled',
    transcript: [
      { role: 'patient', text: "Hi, I need to move my Thursday appointment, something came up." },
      { role: 'agent', text: "I can help with that. You're scheduled for a routine prenatal visit at 32 weeks — that's a window we want to keep close, so let's find the nearest option." },
      { role: 'agent', text: "I have Friday at 10:15 AM or Monday at 2:30 PM with Dr. Patel. Either work?" },
      { role: 'patient', text: 'Friday works great.' },
      { role: 'agent', text: "Done — Friday 10:15 AM with Dr. Patel. I'm also releasing your old Thursday slot to a patient on our waitlist." },
    ],
  },
  {
    id: 'c2',
    patient: 'Jordan Kim',
    time: '10:03 AM',
    outcome: 'waitlisted',
    transcript: [
      { role: 'patient', text: "I need an annual exam but you're booked out three weeks." },
      { role: 'agent', text: "I can add you to our waitlist for anything sooner — if a slot opens from a cancellation, we'll text you first." },
      { role: 'patient', text: 'Yes please.' },
    ],
  },
  {
    id: 'c3',
    patient: 'Priya Desai',
    time: '10:21 AM',
    outcome: 'booked',
    transcript: [
      { role: 'patient', text: "I just found out I'm pregnant, I need to get in." },
      { role: 'agent', text: "Congratulations! Let's get your new OB intake scheduled — I have Tuesday at 9 AM or Wednesday at 1 PM." },
      { role: 'patient', text: 'Wednesday.' },
      { role: 'agent', text: "You're confirmed for Wednesday 1 PM, new OB intake with Dr. Nunez. I'll text a confirmation now." },
    ],
  },
  {
    id: 'c4',
    patient: 'Devon Marsh',
    time: '11:15 AM',
    outcome: 'rescheduled',
    transcript: [
      { role: 'patient', text: 'I keep missing my appointments, sorry, can we redo this one more time?' },
      { role: 'agent', text: "No problem — since your schedule's been tight, let's grab something close instead of a few weeks out. I have tomorrow at 3 PM." },
      { role: 'agent', text: "I'll set up both a text and a call reminder for this one." },
      { role: 'patient', text: 'That would help, thank you.' },
    ],
  },
]

export const calendarSlots = [
  { time: '9:00 AM', patient: 'Priya Desai', visitType: 'New OB Intake', provider: 'Dr. Nunez', status: 'confirmed' },
  { time: '9:30 AM', patient: null, visitType: 'Open', provider: 'Dr. Patel', status: 'open' },
  { time: '10:00 AM', patient: 'Elena Ruiz', visitType: 'Annual Wellness', provider: 'Dr. Whitfield', status: 'confirmed' },
  { time: '10:15 AM', patient: 'Maria Alvarez', visitType: 'Routine Prenatal', provider: 'Dr. Patel', status: 'confirmed' },
  { time: '11:00 AM', patient: null, visitType: 'Reserved — Waitlist Match Pending', provider: 'Dr. Nunez', status: 'pending' },
  { time: '1:00 PM', patient: 'Priya Desai', visitType: 'New OB Intake', provider: 'Dr. Nunez', status: 'confirmed' },
]

export const waitlist = [
  { patient: 'Jordan Kim', visitType: 'Annual Wellness', window: 'Next 2 weeks' },
  { patient: 'Sam Okafor', visitType: 'Problem Visit', window: 'This week' },
]

export const patientLog = [
  { id: 'APT-1042', patient: 'Maria Alvarez', visitType: 'Routine Prenatal', provider: 'Dr. Patel', datetime: 'Fri 10:15 AM', outcome: 'Rescheduled', syncedTo: 'Sheet + Calendar' },
  { id: 'APT-1043', patient: 'Jordan Kim', visitType: 'Annual Wellness', provider: 'Unassigned', datetime: 'Waitlisted', outcome: 'Waitlisted', syncedTo: 'Sheet' },
  { id: 'APT-1044', patient: 'Priya Desai', visitType: 'New OB Intake', provider: 'Dr. Nunez', datetime: 'Wed 1:00 PM', outcome: 'Booked', syncedTo: 'Sheet + Calendar' },
  { id: 'APT-1045', patient: 'Devon Marsh', visitType: 'Problem Visit', provider: 'Dr. Whitfield', datetime: 'Tomorrow 3:00 PM', outcome: 'Rescheduled', syncedTo: 'Sheet + Calendar' },
]
