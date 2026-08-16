# Crava

Bilingual (English / Arabic) skills-training app. Users work through a leveled
skill path of video drills, tracking XP and streaks, gated behind a Pro
subscription.

## Repository layout

```
mobile/     Expo (React Native) app — the product
web/        Vite React app — the original design port; becomes the
            marketing site and full-margin web checkout
firebase/   Firestore rules, Cloud Functions, and the content seed script
```

## v1 scope

Deliberately narrow: **Full Muscle-Up only, six levels, subscription only.**
No coach marketplace, no community feed — those are deferred until the core
loop is proven.

## Backend

Firebase — Firestore and Auth, running entirely on the **free Spark plan**. No
Cloud Functions and no billing account. See `firebase/README.md`.

XP and streak are not stored; they are derived from level completions. Security
rules make a completion create-only, require the level to be published and its
required drills ticked, and force `completedAt` to the server clock — so there
is no counter to tamper with and no way to backdate a streak.

Signed video playback is the one piece that needs the paid plan, and it is not
needed until there are videos.

## Running the mobile app

```bash
cd mobile
npm install
npx expo start
```

Runs in demo mode against an in-memory store when `mobile/.env` is absent, so
no backend setup is needed to try it. Copy `.env.example` to `.env` and fill it
in from the Firebase console to switch to the real backend.

To get an installable APK, see `mobile/README.md`.

## Running the web app

```bash
cd web
npm install
npm run dev
```

## Still to do before launch

- Film and upload the six lesson videos; wire a video host (Mux / Cloudflare Stream)
- RevenueCat + App Store / Play subscription products
- Arabic typography (bundle IBM Plex Sans Arabic) and native RTL
- Port remaining screens: onboarding, profile, paywall
- Privacy policy, terms, account deletion (Apple requires it)
- Push notifications for session reminders and streaks
