import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, addDoc, where } from 'firebase/firestore'
import { db } from './firebase'

export interface Coach {
  id: string
  name_en: string
  name_ar: string
  skillId: string
  city_en: string
  city_ar: string
  bio_en?: string
  bio_ar?: string
  rating: number
  rateEgp: number
  sortOrder: number
  isPublished: boolean
  /** The account that owns this profile, or null while unclaimed. */
  ownerUid: string | null
}

export interface Slot {
  id: string
  idx: number
  day_en: string
  day_ar: string
  time: string
}

export type SessionType = 'form' | 'live'

/** A form review is a flat rate; a live session is the coach's own rate. */
export const FORM_REVIEW_EGP = 250

export async function fetchCoaches(): Promise<Coach[]> {
  // isPublished is constrained because the rule tests it — see firebase/README.md.
  const snap = await getDocs(
    query(collection(db(), 'coaches'), where('isPublished', '==', true), orderBy('sortOrder')),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Coach)
}

export async function fetchCoach(coachId: string): Promise<{ coach: Coach; slots: Slot[] }> {
  const [coachSnap, slotSnap] = await Promise.all([
    getDoc(doc(db(), 'coaches', coachId)),
    getDocs(query(collection(db(), 'coaches', coachId, 'slots'), orderBy('idx'))),
  ])
  if (!coachSnap.exists()) throw new Error('Coach not found')
  return {
    coach: { id: coachSnap.id, ...coachSnap.data() } as Coach,
    slots: slotSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Slot),
  }
}

/**
 * Creates a request, not a confirmation. The coach accepts or declines, which
 * is why two people asking for the same slot is not a conflict to resolve in
 * the client, and why no price is written: the rate lives on the coach
 * document, where a client cannot change it.
 */
export async function requestBooking(input: {
  uid: string
  userName: string | null
  coachId: string
  coachOwnerUid: string | null
  slotId: string
  sessionType: SessionType
}) {
  await addDoc(collection(db(), 'bookings'), {
    userUid: input.uid,
    // Carried on the booking so the coach can see who is asking. Without it
    // their inbox is a list of time slots with no people attached, which is not
    // enough to decide on. The uid is still there as the authoritative id.
    userName: input.userName,
    coachId: input.coachId,
    // Denormalised so the coach can query the requests sent to them with a
    // filter the rules can prove. Create is checked against the coach document,
    // so this cannot be pointed at someone else.
    coachOwnerUid: input.coachOwnerUid,
    slotId: input.slotId,
    sessionType: input.sessionType,
    status: 'requested',
    createdAt: serverTimestamp(),
  })
}
