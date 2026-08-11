# Crava

Crava is a bilingual (English / Arabic) skills-training app: users pick a physical
skill (calisthenics, boxing, sprinting, parkour), work through a leveled skill tree
of drills, track XP and streaks, book real coaches for form reviews or live
sessions, and follow a community feed of milestones.

This is a React + TypeScript implementation of the `Crava App v2` design
(handed off from Claude Design), built as a mobile-first web app.

## Stack

- React 19 + TypeScript
- Vite
- No UI framework — styles are hand-ported inline to match the design pixel-for-pixel

## Development

```bash
npm install
npm run dev
```

Open the printed local URL. The app is mobile-first: resize your browser to a
phone-sized viewport (or use device emulation) for the intended layout. On
wider viewports it renders inside a centered phone-sized card.

## Build

```bash
npm run build
```

## Project structure

```
src/
  data/          static content (skills, coaches, slots, community posts) + shared types
  context/       AppContext — all app state (screen, language, progress, bookings, etc.)
  lib/           shared inline-style helpers (list rows, radios, tabs, chips)
  components/    Header, TabBar, LevelUpSheet, icon set
  screens/       one component per screen (Onboarding, Home, Tree, Lesson, Search,
                 Coaches, Booking, Paywall, Community, Profile)
  App.tsx        screen router + phone shell layout
```

## Notes

- Language toggle (EN / عربي) switches the whole UI, including layout direction
  (`dir="rtl"` for Arabic) — logical CSS properties (`insetInlineStart`, etc.) are
  used throughout so spacing/icons mirror correctly.
- All app state (onboarding answers, unlocked levels, XP, streak, bookings,
  likes, notification toggle) lives in memory only, matching the original
  prototype. Profile → "Reset prototype data" restores the initial state.
