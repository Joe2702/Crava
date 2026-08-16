#!/usr/bin/env bash
# Deploys rules and indexes, then seeds the content.
#
# Run the console steps in README.md first (create project, enable
# Email/Password auth, create Firestore). Those cannot be scripted without
# extra API access.
#
# Cloud Functions are NOT deployed — the app runs entirely on the free Spark
# plan. Pass --with-functions once the project is on Blaze.
#
#   cd firebase && ./setup.sh
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v firebase >/dev/null 2>&1; then
  echo "firebase-tools missing. Install it with:  npm install -g firebase-tools"
  exit 1
fi

if [ ! -f .firebaserc ]; then
  echo "No project linked yet. Run:  firebase login && firebase use --add"
  exit 1
fi

if [ "${1:-}" = "--with-functions" ]; then
  echo "==> Installing function dependencies"
  npm --prefix functions install
  echo "==> Deploying rules, indexes and functions"
  firebase deploy --only firestore:rules,firestore:indexes,functions
else
  echo "==> Deploying rules and indexes (no functions — free plan)"
  firebase deploy --only firestore:rules,firestore:indexes
fi

if [ ! -f seed/serviceAccount.json ]; then
  cat <<'MSG'

Rules are deployed.

To seed the lesson content, download a service account key:
  Firebase console -> Project settings -> Service accounts -> Generate new private key
Save it as firebase/seed/serviceAccount.json, then re-run this script.
MSG
  exit 0
fi

echo "==> Seeding content"
npm --prefix seed install
GOOGLE_APPLICATION_CREDENTIALS="$PWD/seed/serviceAccount.json" npm --prefix seed run seed

echo
echo "Done. Fill mobile/.env with the web app config, then run the app."
