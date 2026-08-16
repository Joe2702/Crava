/**
 * Attaches an already-uploaded Cloudflare Stream video to a level.
 *
 *   node attach-video.mjs muscleup-1 <stream-video-uid> [durationSeconds]
 *
 * Upload the file to Cloudflare Stream first (dashboard or API), turn on
 * "Require signed URLs" for it, then run this with the video's UID.
 *
 * The UID is written to levelVideos/, which no client can read — the level
 * document only gets a hasVideo flag.
 */
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'node:fs'

const [levelId, playbackId, durationS] = process.argv.slice(2)
if (!levelId || !playbackId) {
  console.error('usage: node attach-video.mjs <levelId> <streamVideoUid> [durationSeconds]')
  process.exit(1)
}

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
initializeApp({
  credential: keyPath && existsSync(keyPath)
    ? cert(JSON.parse(readFileSync(keyPath, 'utf8')))
    : applicationDefault(),
})

const db = getFirestore()

const levelRef = db.collection('levels').doc(levelId)
if (!(await levelRef.get()).exists) {
  console.error(`No level "${levelId}". Run the seed first.`)
  process.exit(1)
}

await db.collection('levelVideos').doc(levelId).set({ playbackId })
await levelRef.update({
  hasVideo: true,
  ...(durationS ? { durationS: Number(durationS) } : {}),
})

console.log(`Attached video to ${levelId}.`)
process.exit(0)
