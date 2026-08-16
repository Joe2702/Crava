# Crava — Firebase backend

Firestore for data, Firebase Auth for accounts, and one Cloud Function that owns
all progress writes.

## Why the function exists

Security rules let a signed-in user edit only their profile fields
(`displayName`, `locale`, `city`, `notifEnabled`, `onboardedAt`). Writes that
touch `xp`, `streakCount`, `lastSessionDate` or `entitlement` are rejected, and
`levelCompletions` is not client-writable at all.

That means XP and streaks can only come from `completeLevel`, which runs with
Admin privileges and re-checks everything server-side:

- the level exists and is published
- every required drill is already ticked
- replaying a finished level awards nothing

It runs in a transaction, so two fast taps can't double-award.

Ticking a drill *is* client-writable, because on its own it grants nothing — the
function re-reads completions before awarding.

## Data model

```
skills/{skillId}                     content, read-only to clients
levels/{levelId}                     { skillId, idx, ... }
drills/{drillId}                     { levelId, idx, isRequired, ... }
users/{uid}                          profile + xp + streak + entitlement
users/{uid}/drillCompletions/{id}    client-writable
users/{uid}/levelCompletions/{id}    function-only
```

Bilingual content is stored as `name_en` / `name_ar` pairs on the same document,
and the client picks the column matching the active locale.

## First-time setup

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method → Email/Password → Enable.**
3. **Firestore Database → Create database → Production mode**, location
   `eur3` or `europe-west1`.
4. **Upgrade to the Blaze plan.** Cloud Functions require it. Blaze still
   includes a free monthly allowance (2M invocations) that this app will not
   come close to, but a billing account must exist.
5. Project settings → General → Your apps → **Add app → Web**. Copy the config
   values into `mobile/.env` (see `mobile/.env.example`).

## Deploy

```bash
cd firebase
npm install -g firebase-tools
firebase login
firebase use --add            # select the project

cd functions && npm install && cd ..
firebase deploy --only firestore:rules,firestore:indexes,functions
```

## Seed the content

Project settings → Service accounts → **Generate new private key**, save it as
`firebase/seed/serviceAccount.json` (git-ignored — it is a real secret, unlike
the web config).

```bash
cd firebase/seed
npm install
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json npm run seed
```

Writes 1 skill, 6 levels and 24 drills. Safe to re-run — ids are deterministic,
so it updates in place rather than duplicating.

## Video

Videos are **streamed from Cloudflare Stream**, not bundled into the app. Six
4-minute lessons is roughly 500 MB–1 GB; Play caps an APK base around 150 MB and
iOS warns past 200 MB, so bundling is not an option — this is also how Udemy,
Coursera and MasterClass work. Stream transcodes to HLS with several bitrates,
which matters on Egyptian mobile connections: a single fixed-bitrate MP4 stalls
where adaptive playback drops a rung and keeps going.

### Setup

1. Cloudflare dashboard → **Stream** → upload a lesson.
2. On the video, turn on **Require signed URLs**. Without this the video is
   publicly playable by anyone with the id.
3. **Stream → Settings → Signing keys → Create**. Keep the key ID and the PEM.
4. Configure the function:

```bash
# PEM is base64-encoded so newlines survive being pasted
base64 -w0 signing-key.pem | firebase functions:secrets:set STREAM_SIGNING_KEY_PEM

firebase functions:config:set    # not needed; the two below are params
# set these when prompted on deploy, or add to .env for functions:
#   STREAM_SIGNING_KEY_ID=<key id>
#   STREAM_CUSTOMER_CODE=<from your Stream embed URL>
```

5. Attach the uploaded video to a level:

```bash
cd firebase/seed
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
  node attach-video.mjs muscleup-1 <stream-video-uid> 252
```

### How access is enforced

`getPlaybackUrl` mints a signed HLS URL that expires after two hours. The
playback id lives in `levelVideos/`, which **no client can read** — Firestore
rules cannot hide a single field, so it is kept out of the level document
entirely. Level 1 streams free; levels 2–6 require an active entitlement, which
is checked in the function rather than the app, because a client-side check is
only a suggestion.

A subscriber can still screen-record, as they can on any platform. Signed
expiring URLs stop the cheaper attack: lifting a permanent link and sharing it.
