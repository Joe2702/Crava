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
