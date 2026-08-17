# Crava — Firebase backend

Firestore for data and Firebase Auth for accounts. **Everything runs on the free
Spark plan** — no Cloud Functions and no billing account required.

## Vocabulary

The product says **Course**, **Lesson** and **Step**. Firestore still stores them
in `skills`, `levels` and `drills`. Renaming the collections would orphan every
completion already recorded against a level id, which is not worth it for a
vocabulary change — so the mapping lives in `mobile/lib/types.ts` and nowhere
else.

## How progress stays honest without a server

Progress is **not stored**. It is computed from `levelCompletions`: a course is
`completed / total` lessons.

A stored counter would have to be client-writable on the free tier, which means
it could be set to any value. A completion cannot be forged the same way,
because security rules make creating one conditional:

- create-only — no update, no delete, so a level is awarded exactly once
- the level must exist and be published
- the level's three required drills must already be ticked
- `completedAt` must equal `request.time`, the server's clock, so completions
  cannot be backdated

There is no number left to tamper with.

Ticking a step *is* client-writable, since on its own it grants nothing — it is
only an input to the rule above. Note this was equally true of the Cloud
Function version: it also trusted client-written drill ticks.

The one real weakening versus a server: the rules check drill ids directly
(`<levelId>-0`, `-1`, `-2`), so they are coupled to the seed's id scheme. Change
the ids or which drills are required, and `firestore.rules` must change too.

## Rules are not filters

A rule that tests a document field constrains what the *client must ask for*, not
what Firestore quietly hides. `levels` is readable only when
`isPublished == true`, so any query over that collection has to include
`where('isPublished', '==', true)` — otherwise Firestore rejects the whole read
with `Missing or insufficient permissions`, even when every stored level is
published. Single-document `getDoc` calls are exempt, because the rule is
evaluated against the one document being returned.

That means each such rule needs a matching clause in the query *and* a composite
index covering it. Adding a field test to a collection rule without doing both
breaks the app at runtime while looking correct in review.

Only *composite* indexes belong in `firestore.indexes.json`. Firestore creates a
single-field index for every field automatically, and declaring one is rejected
at deploy with `this index is not necessary, configure using single field index
controls` — so a query filtering on one field alone, like
`where('ownerUid', '==', uid)`, needs no entry at all.

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
users/{uid}/enrollments/{courseId}   the My learning list
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

## Coaches

A coach is a normal user account with a coach profile linked to it, so the same
login both learns and coaches — the arrangement an instructor on a course
platform has.

Linking is deliberately an admin step, not something the app can do. The rules
never let a client write `ownerUid`, because "verified coach" has to mean a
person checked. Someone applies from **You → Coach on Crava**, which writes to
`coachApplications/{uid}` (write-only from the client — an applicant cannot read
the queue or change a decision). You read that collection in the console, and
then link them:

```bash
cd firebase/seed
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
  node link-coach.mjs omar someone@example.com
```

Pass an empty email to unlink. The account has to exist — they sign up in the
app first.

Once linked, **You** grows a Coaching section: incoming requests to accept or
decline, and their own listing (bio and rate). A coach cannot edit their own
name, skill or verified status, and cannot publish themselves.

`bookings` carries `coachOwnerUid` alongside `coachId`. That duplication is
deliberate: both sides need to list their own rows, and a rule that reached the
owner through the coach document with `get()` could not be evaluated for a list
query. Create checks the denormalised value against the coach document, so it
cannot be pointed at somebody else.

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
