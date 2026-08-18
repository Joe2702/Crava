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
opened immediately. Sign in with any email and password. The catalogue, lessons
and Arabic all work, but nothing is saved, so progress resets when the app
restarts. A banner on the sign-in screen says so.

To use the real backend, follow `firebase/README.md` and fill in `mobile/.env`;
the app switches over automatically.

### Sign in

Demo mode: anything works. With Firebase configured, create an account from the
sign-up screen — email confirmation is off by default, so you are signed
straight in.

### What to try

- Toggle **EN / عربي** — the whole UI should flip to right-to-left with proper
  Arabic type.
- **Courses** lists the catalogue with prices. Open one for its summary and
  curriculum.
- Lesson 1 of every course is a free preview; the rest need the course bought.
  The buy button cannot charge yet and says so.
- Tick a lesson's steps and **Complete and continue** — it moves to the next
  lesson rather than interrupting you.
- Force-quit and reopen — you should stay signed in with progress intact.
- **Account → Book a coach** for the coaching side.

Every lesson video is a placeholder reading "Video not uploaded yet" — nothing
has been filmed.

### If something breaks

- Version mismatch warnings from Expo Go → `npx expo install --fix`
- Stale cache after pulling → `npx expo start -c`
- Anything else: capture the red error screen text, it names the file and line.

## Build an installable APK

Entirely in GitHub Actions — nothing to install, no accounts, no secrets.

**Actions** tab → **Build APK** → **Run workflow** → pick a backend → **Run**.

It takes about nine minutes. When it finishes, the APK is published as a GitHub
Release, so the newest build is always at:

    https://github.com/Joe2702/Crava/releases/latest/download/crava.apk

Open that on the phone itself and tap the download. Android warns about
installing outside the Play Store; allow it. Each build also gets its own
permanent release under **Releases**, titled with the backend and commit, so an
older build stays reachable after a newer one lands.

The run page also carries the same APK as a build **Artifact**, but that is a zip
and only downloadable by someone signed in to GitHub — the release link is the
one to send people. Untick **publish** if you want a build without a release.

The two backend options:

- **demo** — no Firebase needed. Sign in with anything; progress is in memory.
  Use this to hand the app to someone today.
- **firebase** — talks to the real backend. Deploy it first with the **Deploy
  Firebase** workflow, then set these repository secrets
  (Settings → Secrets and variables → Actions), taken from the Firebase web app
  config: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`,
  `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`.

The APK is built for **arm64-v8a only**. New Architecture compiles React
Native's C++ from source once per CPU architecture, and building all four does
not finish in reasonable time on a GitHub runner. Every Android phone worth
targeting is arm64. Tick **all_architectures** if you need to run it on an x86
emulator — expect roughly four times the build time.

The APK is signed with the debug keystore Expo generates, which is what makes a
zero-secret build possible. That is fine for testing and for sending to people
directly, but a real Play Store release needs your own keystore — otherwise you
cannot ship updates that install over it.

`eas build --platform android --profile preview` still works if you prefer
Expo's cloud builder; `eas.json` is configured for it. It needs a free Expo
account, and it is the route you will want for iOS/TestFlight later.

## Environment

`.env` is git-ignored; copy `.env.example` and fill it from the Firebase console
(Project settings → General → Your apps → Web app).

Those `EXPO_PUBLIC_*` values are compiled into the app bundle and are not
secrets — Firebase web config is public by design, and access is controlled by
Firestore security rules. **A service-account key is a real secret and must
never go in this file.**
