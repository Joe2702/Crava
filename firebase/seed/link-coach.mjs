/**
 * Links a coach profile to a real user account, which is what turns an account
 * into a coach. This is deliberately an admin script rather than something the
 * app can do: "verified coach" has to mean a person checked, and the security
 * rules do not let anyone write ownerUid from a client.
 *
 *   cd firebase/seed
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *     node link-coach.mjs <coachId> <email>
 *
 * Pass an empty email to unlink.
 */
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync, existsSync } from 'node:fs'

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
initializeApp({
  credential: keyPath && existsSync(keyPath)
    ? cert(JSON.parse(readFileSync(keyPath, 'utf8')))
    : applicationDefault(),
})

const [coachId, email] = process.argv.slice(2)
if (!coachId) {
  console.error('Usage: node link-coach.mjs <coachId> <email>   (empty email unlinks)')
  process.exit(1)
}

const db = getFirestore()
const coachRef = db.collection('coaches').doc(coachId)
const coach = await coachRef.get()
if (!coach.exists) {
  console.error(`No coach "${coachId}". Run seed.mjs first, or check the id.`)
  process.exit(1)
}

if (!email) {
  await coachRef.update({ ownerUid: null })
  console.log(`Unlinked ${coachId}.`)
  process.exit(0)
}

const user = await getAuth()
  .getUserByEmail(email)
  .catch(() => null)
if (!user) {
  console.error(`No account for ${email}. They need to sign up in the app first.`)
  process.exit(1)
}

await coachRef.update({ ownerUid: user.uid })
console.log(`${coachId} is now coached by ${email} (${user.uid}).`)
process.exit(0)
