import { getFirestore } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret, defineString } from 'firebase-functions/params'
import jwt from 'jsonwebtoken'

const db = getFirestore()

// Cloudflare Stream signing key. Create at
// Cloudflare dashboard → Stream → Settings → Signing keys.
//   firebase functions:secrets:set STREAM_SIGNING_KEY_PEM
const STREAM_KEY_PEM = defineSecret('STREAM_SIGNING_KEY_PEM')
const STREAM_KEY_ID = defineString('STREAM_SIGNING_KEY_ID')
const STREAM_CUSTOMER_CODE = defineString('STREAM_CUSTOMER_CODE')

// Level 1 streams without a subscription so the value is visible before paying.
const FREE_LEVEL_IDX = 1

const TOKEN_TTL_SECONDS = 60 * 60 * 2

function hasActiveEntitlement(entitlement: unknown): boolean {
  if (!entitlement || typeof entitlement !== 'object') return false
  const e = entitlement as { status?: string; expiresAt?: number | null }
  if (e.status !== 'active' && e.status !== 'trialing' && e.status !== 'grace') return false
  // a missing expiry means a non-expiring grant (e.g. promo)
  return e.expiresAt == null || e.expiresAt > Date.now()
}

/**
 * Returns a short-lived signed HLS URL for a level's video.
 *
 * Playback IDs are never handed to the client directly and the URL expires, so
 * nobody can lift a permanent link and pass it around. Access is checked here
 * rather than in the app, because a client-side check is only a suggestion —
 * this is the real gate.
 */
export const getPlaybackUrl = onCall<{ levelId?: string }>(
  { secrets: [STREAM_KEY_PEM] },
  async (request) => {
    const uid = request.auth?.uid
    if (!uid) throw new HttpsError('unauthenticated', 'Sign in first.')

    const levelId = request.data?.levelId
    if (!levelId || typeof levelId !== 'string') {
      throw new HttpsError('invalid-argument', 'levelId is required.')
    }

    const levelSnap = await db.collection('levels').doc(levelId).get()
    if (!levelSnap.exists || levelSnap.get('isPublished') !== true) {
      throw new HttpsError('not-found', 'Level not available.')
    }

    // kept out of levels/ because Firestore rules cannot hide a single field:
    // any client that can read the level could read the id off it
    const videoSnap = await db.collection('levelVideos').doc(levelId).get()
    const playbackId: string | null = videoSnap.get('playbackId') ?? null
    if (!playbackId) {
      throw new HttpsError('failed-precondition', 'This lesson has no video yet.')
    }

    const idx: number = levelSnap.get('idx') ?? 0
    if (idx !== FREE_LEVEL_IDX) {
      // Courses are bought one at a time, so owning this one is the usual way
      // in; the all-access subscription is the second. Checking only the
      // subscription would lock out everyone who actually paid for the course.
      const courseId: string = levelSnap.get('skillId') ?? ''
      const [purchaseSnap, userSnap] = await Promise.all([
        db.collection('users').doc(uid).collection('purchases').doc(courseId).get(),
        db.collection('users').doc(uid).get(),
      ])
      const owned = purchaseSnap.exists
      if (!owned && !hasActiveEntitlement(userSnap.get('entitlement'))) {
        throw new HttpsError('permission-denied', 'Buy this course to watch the lesson.')
      }
    }

    const pem = STREAM_KEY_PEM.value()
    const keyId = STREAM_KEY_ID.value()
    const customer = STREAM_CUSTOMER_CODE.value()
    if (!pem || !keyId || !customer) {
      throw new HttpsError('failed-precondition', 'Video signing is not configured.')
    }

    const now = Math.floor(Date.now() / 1000)
    const token = jwt.sign(
      { sub: playbackId, kid: keyId, exp: now + TOKEN_TTL_SECONDS, nbf: now - 30 },
      // the key is stored base64 to survive being pasted into a secret
      Buffer.from(pem, 'base64').toString('utf8'),
      { algorithm: 'RS256', header: { alg: 'RS256', kid: keyId } },
    )

    return {
      url: `https://customer-${customer}.cloudflarestream.com/${token}/manifest/video.m3u8`,
      expiresAt: (now + TOKEN_TTL_SECONDS) * 1000,
    }
  },
)
