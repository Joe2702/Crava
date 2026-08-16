# Crava — mobile app

## Run it on your phone

```bash
git clone https://github.com/Joe2702/Crava.git
cd Crava/mobile
npm install
npx expo start
```

1. Install **Expo Go** from the App Store / Play Store.
2. Scan the QR code in your terminal (iOS: Camera app. Android: scan from inside Expo Go).
3. Your phone and computer must be on the same Wi-Fi. If they aren't, or the
   connection hangs, run `npx expo start --tunnel` instead.

### Demo mode — no setup needed

With no `mobile/.env`, the app runs against an in-memory store so it can be
opened immediately. Sign in with any email and password. Everything works —
levels, drills, XP, streak, Arabic — but nothing is saved, so progress resets
when the app restarts. A banner on the sign-in screen says so.

To use the real backend, follow `firebase/README.md` and fill in `mobile/.env`;
the app switches over automatically.

### Sign in

Demo mode: anything works. With Firebase configured, create an account from the
sign-up screen — email confirmation is off by default, so you are signed
straight in.

### What to try

- Toggle **EN / عربي** — the whole UI should flip to right-to-left with proper
  Arabic type.
- Open level 1, tick the three required drills, then **Mark level complete**.
  You should get +120 XP, a 1-day streak, and level 2 should unlock.
- Force-quit and reopen — you should stay signed in with progress intact.
- Tap ☰ for the profile screen (stats, language, notifications, delete account).

The lesson video is deliberately a placeholder reading "Video not uploaded
yet" — no lessons have been filmed.

### If something breaks

- Version mismatch warnings from Expo Go → `npx expo install --fix`
- Stale cache after pulling → `npx expo start -c`
- Anything else: capture the red error screen text, it names the file and line.

## Build an installable APK

The build runs on Expo's servers, so no Android SDK is needed locally.

```bash
cd mobile
npm install -g eas-cli
eas login          # free Expo account
eas init           # links the project, writes extra.eas.projectId into app.json
eas build --platform android --profile preview
```

The `preview` profile is configured to emit an **APK** (not an AAB), which is
what installs directly on a phone. When the build finishes, EAS prints a
download URL and also shows a QR code — open it on the phone and install.
Android will warn about installing outside the Play Store; allow it.

No Google Play account is needed for this. `production` emits an AAB instead,
which is only for Play Store submission.

There is also a **Build Android APK** GitHub Action (manual trigger) that does
the same thing from CI. It needs an `EXPO_TOKEN` repository secret, generated
at <https://expo.dev/settings/access-tokens>.

## Environment

`.env` is git-ignored; copy `.env.example` and fill it from the Firebase console
(Project settings → General → Your apps → Web app).

Those `EXPO_PUBLIC_*` values are compiled into the app bundle and are not
secrets — Firebase web config is public by design, and access is controlled by
Firestore security rules. **A service-account key is a real secret and must
never go in this file.**
