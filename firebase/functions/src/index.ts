import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'
import * as logger from 'firebase-functions/logger'

initializeApp()
const db = getFirestore()

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 })

const XP_PER_LEVEL = 120

function utcDate(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000)
}

/**
 * Awards a level completion. This runs with Admin privileges — security rules
 * block clients from writing xp, streakCount or levelCompletions directly — so
 * every guard that keeps progress honest lives here:
 *
 *  - the level must exist and be published
 *  - every required drill must already be ticked
 *  - replaying a finished level awards nothing
 *
 * The whole thing runs in a transaction so two rapid taps can't double-award.
 */
export const completeLevel = onCall<{ levelId?: string }>(async (request) => {
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

  const requiredSnap = await db
    .collection('drills')
    .where('levelId', '==', levelId)
    .where('isRequired', '==', true)
    .get()

  const doneSnap = await db.collection('users').doc(uid).collection('drillCompletions').get()
  const done = new Set(doneSnap.docs.map((d) => d.id))
  const missing = requiredSnap.docs.filter((d) => !done.has(d.id))
  if (missing.length > 0) {
    throw new HttpsError('failed-precondition', 'Finish the required drills first.')
  }

  return db.runTransaction(async (tx) => {
    const userRef = db.collection('users').doc(uid)
    const completionRef = userRef.collection('levelCompletions').doc(levelId)

    const [userSnap, completionSnap] = await Promise.all([tx.get(userRef), tx.get(completionRef)])
    if (!userSnap.exists) throw new HttpsError('not-found', 'User document missing.')

    const xp: number = userSnap.get('xp') ?? 0
    const streak: number = userSnap.get('streakCount') ?? 0

    if (completionSnap.exists) {
      return { xp, streakCount: streak, alreadyCompleted: true }
    }

    const today = utcDate()
    const last: string | null = userSnap.get('lastSessionDate') ?? null
    let nextStreak: number
    if (last === today) nextStreak = streak || 1
    else if (last && daysBetween(last, today) === 1) nextStreak = streak + 1
    else nextStreak = 1

    const nextXp = xp + XP_PER_LEVEL

    tx.set(completionRef, { completedAt: FieldValue.serverTimestamp() })
    tx.update(userRef, { xp: nextXp, streakCount: nextStreak, lastSessionDate: today })

    logger.info('level completed', { uid, levelId, xp: nextXp, streak: nextStreak })
    return { xp: nextXp, streakCount: nextStreak, alreadyCompleted: false }
  })
})

/**
 * Deletes the caller's account. Client-side deleteUser() would remove the auth
 * record but leave the Firestore data orphaned, so both are cleared here in one
 * place — App Store guideline 5.1.1(v) requires in-app account deletion.
 */
export const deleteAccount = onCall<{ confirm?: boolean }>(async (request) => {
  const uid = request.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in first.')
  if (request.data?.confirm !== true) {
    throw new HttpsError('invalid-argument', 'confirm must be true.')
  }

  const userRef = db.collection('users').doc(uid)
  // Deleting a document does not delete its subcollections, so they are cleared
  // first — otherwise the completions would outlive the account.
  await db.recursiveDelete(userRef)
  await getAuth().deleteUser(uid)

  logger.info('account deleted', { uid })
  return { deleted: true }
})

export { getPlaybackUrl } from './playback'
