#!/usr/bin/env bash
# Deploys rules, indexes and functions, then seeds the content.
#
# Run the console steps in README.md first (create project, enable
# Email/Password auth, create Firestore, upgrade to Blaze). Those cannot be
# scripted without extra API access.
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

echo "==> Installing function dependencies"
npm --prefix functions install

echo "==> Deploying rules, indexes and functions"
firebase deploy --only firestore:rules,firestore:indexes,functions

if [ ! -f seed/serviceAccount.json ]; then
  cat <<'MSG'

Rules and functions are deployed.

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
