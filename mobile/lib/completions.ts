import { collection, getDocs, query, where, type Timestamp } from 'firebase/firestore'
import { db } from './firebase'

export interface BookingRow {
  id: string
  coachId: string
  slotId: string
  sessionType: 'form' | 'live'
  status: string
  createdAt: Date | null
}

export async function fetchMyBookings(uid: string): Promise<BookingRow[]> {
  // The rule on bookings only lets you read your own, so the query has to say
  // so — a query that does not constrain what the rule tests is rejected.
  const snap = await getDocs(query(collection(db(), 'bookings'), where('userUid', '==', uid)))
  return snap.docs
    .map((d) => {
      const data = d.data()
      return {
        id: d.id,
        coachId: data.coachId as string,
        slotId: data.slotId as string,
        sessionType: data.sessionType as 'form' | 'live',
        status: data.status as string,
        createdAt: (data.createdAt as Timestamp | null)?.toDate() ?? null,
      }
    })
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
}
