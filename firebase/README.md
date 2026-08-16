# Crava — Firebase backend

Firestore for data and Firebase Auth for accounts. **Everything runs on the free
Spark plan** — no Cloud Functions and no billing account required.

## How progress stays honest without a server

XP and streak are **not stored**. They are computed from `levelCompletions`.

A stored counter would have to be client-writable on the free tier, which means
it could be set to any value. A completion cannot be forged the same way,
because security rules make creating one conditional:

- create-only — no update, no delete, so a level is awarded exactly once
- the level must exist and be published
- the level's three required drills must already be ticked
- `completedAt` must equal `request.time`, the server's clock, so completions
  cannot be backdated to manufacture a streak

XP is then `completions × 120` and the streak is derived from the completion
dates. There is no number left to tamper with.

Ticking a drill *is* client-writable, since on its own it grants nothing — it is
only an input to the rule above. Note this was equally true of the Cloud
Function version: it also trusted client-written drill ticks.

The one real weakening versus a server: the rules check drill ids directly
(`<levelId>-0`, `-1`, `-2`), so they are coupled to the seed's id scheme. Change
the ids or which drills are required, and `firestore.rules` must change too.

## Cloud Functions (optional, needs Blaze)

`functions/` holds `getPlaybackUrl`, which signs video URLs. It is **not needed
until you have videos**, and it requires the Blaze plan. Deploy it with
`./setup.sh --with-functions` once you upgrade. `completeLevel` and
`deleteAccount` in there are superseded by the rules above and by client-side
deletion — they are kept only for reference.

## Data model

```
skills/{skillId}                     content, read-only to clients
levels/{levelId}                     { skillId, idx, ... }
drills/{drillId}                     { levelId, idx, isRequired, ... }
levelVideos/{levelId}                playback ids, unreadable by any client
users/{uid}                          profile + entitlement (no stored progress)
users/{uid}/drillCompletions/{id}    client-writable; grants nothing alone
users/{uid}/levelCompletions/{id}    create-only, gated by the rules above
```

Bilingual content is stored as `name_en` / `name_ar` pairs on the same document,
and the client picks the column matching the active locale.

## First-time setup

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method → Email/Password → Enable.**
3. **Firestore Database → Create database → Production mode**, location
   `eur3` or `europe-west1`.
4. Project settings → General → Your apps → **Add app → Web**. Copy the config
   values into `mobile/.env` (see `mobile/.env.example`).

No billing account or plan upgrade is needed.

## Deploy

**From GitHub, no terminal:** add a `FIREBASE_SERVICE_ACCOUNT` repository
secret containing the whole JSON from Project settings → Service accounts →
Generate new private key, then run the **Deploy Firebase** workflow from the
Actions tab. It deploys rules and indexes and seeds the content.

Unlike the web config, that JSON *is* a real secret — it grants full admin
access to the project. Never commit it.

The service account needs two roles the default `firebase-adminsdk` account
does not have. Add both at once under
[IAM](https://console.cloud.google.com/iam-admin/iam) → the account's row → ✏️ →
Add another role:

- **Service Usage Consumer** — the CLI checks the Firestore API is enabled
  before deploying. Without it: `403, Permission denied to get service`.
- **Firebase Admin** — covers compiling/deploying rules and writing indexes.
  Without it: `403, The caller does not have permission` from
  `firebaserules.googleapis.com`.

**Locally**, if you prefer:

```bash
cd firebase
npm install -g firebase-tools
firebase login
firebase use --add            # select the project
./setup.sh
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

**This part needs the Blaze plan**, because signing has to happen somewhere the
key is secret. Until then lessons show "Video not uploaded yet". The alternative
if you want to stay free is a Cloudflare Worker doing the signing instead —
Workers have a generous free tier and you will already have a Cloudflare account
for Stream.

`getPlaybackUrl` mints a signed HLS URL that expires after two hours. The
playback id lives in `levelVideos/`, which **no client can read** — Firestore
rules cannot hide a single field, so it is kept out of the level document
entirely. Level 1 streams free; levels 2–6 require an active entitlement, which
is checked in the function rather than the app, because a client-side check is
only a suggestion.

A subscriber can still screen-record, as they can on any platform. Signed
expiring URLs stop the cheaper attack: lifting a permanent link and sharing it.
