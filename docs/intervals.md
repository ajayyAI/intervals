# 🖤 PREMIUM INTERVAL TIMER — DESIGN SYSTEM

This system is designed for a **high-end interval alarm + focus + notes app**.
It is not a Pomodoro. Not a reminder. Not a clock.
It is a **time ritual for focused people**.

---

## 1. Brand Philosophy

This app should feel like:
• Starting a Swiss watch  
• Entering a meditation  
• Beginning a deep focus session  

No bright colors  
No distractions  
No gamification  

Only **time, sound, and intention**.

---

## 2. Color System (Ultra-Luxury Dark)

| Token | Value | Usage |
|------|------|------|
| bg.primary | #0B0C0F | Main background |
| bg.card | #15181D | Timer cards |
| bg.elevated | #1B1F26 | Modals |
| text.primary | #F2F3F5 | Numbers |
| text.secondary | #9CA0A8 | Labels |
| text.muted | #6F747D | Hints |
| accent | #B8A77D | Soft gold |
| danger | #D45757 | Stop |
| success | #4FAE8B | Running |

Rules:
• No gradients  
• No pure white  
• No neon  

Luxury = restraint.

---

## 3. Typography (`font.ts`)

Use a modern premium sans with tabular numerals.

export const fonts = {
  display: {
    family: "SF Pro Display",
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600
    }
  },
  numeric: {
    family: "SF Pro Rounded",
    featureSettings: ["tnum", "lnum"]
  }
}

| Usage             | Size    | Weight |
| ----------------- | ------- | ------ |
| Countdown numbers | 72–96px | 600    |
| Interval minutes  | 32px    | 500    |
| Labels            | 13–15px | 400    |
| Section titles    | 16px    | 500    |

Numbers must never jump width → use tabular numerals.

---

## 4. Core Concept

This app runs **continuous time loops**.

User selects:
• Interval (e.g. 15 minutes)
• Sound
• Session label

Then time flows automatically.

Every interval:
• Sound plays
• Screen wakes softly
• User is invited to write a note
• Next interval begins without tapping

This creates a **rhythm of focus**.

---

## 5. Main Screen Structure

Minimal, no buttons:

[ Current Time ]
[ Large Interval Countdown ]
[ Next Chime Time ]
[ Session Label ]

Gestures:
• Tap → Pause / Resume
• Swipe up → Notes
• Long press → End session

Luxury = invisible controls.

---

## 6. Sound System

Sounds must be:
• Soft
• Organic
• Short
• Non-alarming

Think:
• Glass
• Wood
• Soft metal
• Breath

Never:
• Beeps
• Alarm clocks
• Default OS sounds

Offer only 6–8 highly curated tones.

Sound is the soul of this app.

---

## 7. Notes Per Interval

After each chime, show:

“What did you do this interval?”

User can write:
• One short note
• Optional tag

This turns the app into:
**Focus tracker + memory engine**

---

## 8. Background Behavior (Critical)

The app must:
• Run in background
• Play sound when locked
• Trigger system notifications
• Continue timing without interruption

iOS:
• Audio background mode
• Notification triggers

Android:
• Foreground service
• Notification channel

This is the killer feature.

---

## 9. Why This App Wins

Most apps:
❌ Make users manage time
❌ Require constant interaction
❌ Feel stressful

This app:
✅ Time flows on its own
✅ Sound gently brings you back
✅ Notes capture real life

It becomes a **calm, powerful ritual** instead of a tool.

---

## 10. Product Positioning

This is:
• Not a Pomodoro
• Not an alarm
• Not a reminder

It is a **premium interval focus system** for people who take time seriously.

