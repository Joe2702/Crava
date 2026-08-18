/**
 * Attaches an already-uploaded Cloudflare Stream video to a level.
 *
 *   node attach-video.mjs calisthenics-beginner-1 <stream-video-uid> [durationSeconds]
 *
 * Lesson ids are "<courseId>-<n>", numbered from 1 in curriculum order, so the
 * third lesson of Boxing Basics is boxing-basics-3. Run with --list to print
 * every id and whether it already has a video.
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
const listing = levelId === '--list'
if (!listing && (!levelId || !playbackId)) {
  console.error('usage: node attach-video.mjs <lessonId> <streamVideoUid> [durationSeconds]')
  console.error('       node attach-video.mjs --list')
  process.exit(1)
}

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
initializeApp({
  credential: keyPath && existsSync(keyPath)
    ? cert(JSON.parse(readFileSync(keyPath, 'utf8')))
    : applicationDefault(),
})

const db = getFirestore()

if (listing) {
  const snap = await db.collection('levels').orderBy('skillId').orderBy('idx').get()
  for (const d of snap.docs) {
    const has = d.get('hasVideo') === true
    console.log(`${has ? '[video]' : '[     ]'} ${d.id}  ${d.get('name_en')}`)
  }
  process.exit(0)
}

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
