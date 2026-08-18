import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore'
import { db, isDemo } from './firebase'
import { useAuth } from './auth'
import type { Coach } from './coaches'

interface CoachRoleValue {
  /** The coach profile this account owns, if any. Null means learner-only. */
  coach: Coach | null
  ready: boolean
  reload: () => void
}

const CoachRoleCtx = createContext<CoachRoleValue>({ coach: null, ready: false, reload: () => {} })

/**
 * One account can both learn and coach, the way an instructor on a course
 * platform uses the same login for both. Coaching is not a flag the user sets:
 * it exists only if an admin has linked a coach profile to this uid, which is
 * what "verified" has to mean. The rules refuse to let any client write
 * ownerUid, so this cannot be self-granted.
 */
export function CoachRoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [coach, setCoach] = useState<Coach | null>(null)
  const [ready, setReady] = useState(false)

  const load = useCallback(async () => {
    if (!user || isDemo) {
      setCoach(null)
      setReady(true)
      return
    }
    try {
      const snap = await getDocs(
        query(collection(db(), 'coaches'), where('ownerUid', '==', user.uid), limit(1)),
      )
      const d = snap.docs[0]
      setCoach(d ? ({ id: d.id, ...d.data() } as Coach) : null)
    } catch {
      // Not being able to tell means treating the account as a learner, which
      // is the safe direction to fail in.
      setCoach(null)
    } finally {
      setReady(true)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const value = useMemo(() => ({ coach, ready, reload: () => void load() }), [coach, ready, load])
  return <CoachRoleCtx.Provider value={value}>{children}</CoachRoleCtx.Provider>
}

export function useCoachRole() {
  return useContext(CoachRoleCtx)
}

export interface CoachBooking {
  id: string
  userUid: string
  userName: string | null
  coachId: string
  slotId: string
  sessionType: 'form' | 'live'
  status: 'requested' | 'confirmed' | 'declined'
  createdAt: Date | null
}

/** Requests sent to this coach. Filtered on coachOwnerUid because that is the
 *  field the read rule tests, and a query that does not constrain it is
 *  rejected outright. */
export async function fetchCoachBookings(ownerUid: string): Promise<CoachBooking[]> {
  const snap = await getDocs(query(collection(db(), 'bookings'), where('coachOwnerUid', '==', ownerUid)))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        userUid: data.userUid as string,
        userName: (data.userName as string | null) ?? null,
        coachId: data.coachId as string,
        slotId: data.slotId as string,
        sessionType: data.sessionType as 'form' | 'live',
        status: data.status as CoachBooking['status'],
        createdAt: (data.createdAt as Timestamp | null)?.toDate() ?? null,
      }
    })
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
}

export async function decideBooking(bookingId: string, status: 'confirmed' | 'declined') {
  await updateDoc(doc(db(), 'bookings', bookingId), { status })
}

export async function updateCoachProfile(
  coachId: string,
  patch: { bio_en?: string; bio_ar?: string; city_en?: string; city_ar?: string; rateEgp?: number },
) {
  await updateDoc(doc(db(), 'coaches', coachId), patch)
}

/** Whether this account has already applied, so the form is not offered twice. */
export async function hasApplied(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db(), 'coachApplications', uid))
  return snap.exists()
}

export async function applyToCoach(uid: string, note: string) {
  await setDoc(doc(db(), 'coachApplications', uid), {
    note: note.trim(),
    createdAt: serverTimestamp(),
  })
}
