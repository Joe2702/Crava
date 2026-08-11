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

### Sign in

A pre-confirmed dev account exists so you can skip the email round-trip:

```
test@crava.app
cravatest123
```

Creating a fresh account works too, but Supabase's built-in mailer is
rate-limited to a few messages an hour. To remove that friction during
development, turn off **Authentication → Providers → Email → Confirm email**
in the Supabase dashboard.

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

`.env` is committed on purpose: it holds only `EXPO_PUBLIC_*` values, which are
compiled into the app bundle and are therefore not secrets. The Supabase
publishable key is protected by row-level security, not by being hidden. **Never
put a service-role key in this file.**
