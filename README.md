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

Firebase — Firestore, Auth, and Cloud Functions. See `firebase/README.md` for
setup and deployment.

Security rules let a user edit only their own profile fields. Writes touching
`xp`, `streakCount`, `lastSessionDate` or `entitlement` are rejected, and level
completions are not client-writable at all — those come only from the
`completeLevel` Cloud Function, which re-checks server-side that the level is
published and every required drill is done, and awards nothing on replay.

## Running the mobile app

```bash
cd mobile
cp .env.example .env      # fill in from the Firebase console
npm install
npx expo start
```

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
