# Walkthrough Video Script (3–5 min)

Structure it like a sales demo, not a code review — the technical decisions should always
answer "so what does this mean for the practice."

## 1. The problem (30–40 sec)
"Every OB/GYN practice loses revenue to two things: no-shows, and the chaos of manually
handling reschedules. But in OB/GYN specifically, a missed or mis-timed visit isn't just an
empty slot — it can mean falling outside a clinically or financially required window. I built
Sage to catch that, not just fill a calendar."

## 2. Prompt design choices (75–90 sec)
This is the section to slow down on — pick 2 of these 3 to walk through live, since they show
you actually read Assort's own materials rather than building a generic scheduling bot:

- **Depo-Provera window enforcement**: If a patient reschedules a birth control injection past
  their allowed window, Sage flags that a pregnancy test is required before the injection can
  happen — and offers to book both. Call out explicitly: "This came directly from Assort's own
  knowledge base on what makes OB/GYN scheduling hard — I turned a documented pain point into an
  actual conversational rule."
- **Double-resource sequencing**: Many visits require an ultrasound immediately followed by a
  provider visit. Show how Sage books these as a linked pair and re-sequences both if one leg
  needs to move, instead of leaving a follow-up orphaned without its ultrasound.
- **Real red-flag transfer list**: decreased fetal movement, bleeding, contractions — show the
  agent immediately breaking the scheduling flow and transferring to a nurse the moment one of
  these comes up, rather than trying to schedule around it.

Be upfront about scope: Assort's source material named these as open problems without a
published solution — you're demonstrating a plausible way to solve them, not claiming to have
replicated their production logic.

## 3. App walkthrough (45–60 sec)
- Open the dashboard. Point at "Slots Recovered This Week" first — this is the number a
  practice owner actually cares about.
- Trigger (or narrate) a live call, show the transcript landing in the Live Call Feed with an
  outcome tag.
- Show the freed slot getting flagged for waitlist backfill in the Calendar panel.

## 4. Integration explanation (30–45 sec)
- Show a row landing in the Google Sheet and an event appearing on Google Calendar in real time.
- Explain why these two: "The CRM log gives the practice a record for billing and follow-up;
  the calendar sync means the front desk never has to double-enter anything Sage booked."

## 5. Close (15–20 sec)
"This is a demo build — Assort's production architecture handles the real thing — but it's
meant to show how grounding a voice agent in the specific operational realities of OB/GYN
scheduling, not just generic booking logic, is what actually reduces the chaos that costs
practices revenue every week."

## Delivery notes
- Keep energy up like you're pitching a prospect, not narrating your code.
- Don't apologize for using AI tools to build this — the assignment explicitly invites it.
- Do explicitly credit Assort's own knowledge-base doc as the source of the Depo/double-resource/
  red-flag specifics — it signals you did the reading, not just the build.
- If something in the live demo hiccups, don't panic-explain the code; redirect to the story
  ("in production this would call the real calendar — here's what that flow looks like").
