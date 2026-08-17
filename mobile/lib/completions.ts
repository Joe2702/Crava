import { collection, getDocs, query, where, type Timestamp } from 'firebase/firestore'
import { db, isDemo } from './firebase'
import { demo } from './demo'

export interface CompletionSet {
  levelIds: string[]
  dates: Date[]
}

/**
 * Every cleared level across every skill, which is what achievements are
 * measured against — unlike the path screens, which are scoped to one skill.
 */
export async function fetchAllCompletions(uid: string): Promise<CompletionSet> {
  if (isDemo) {
    const map = demo.levelCompletions()
    return { levelIds: [...map.keys()], dates: [...map.values()] }
  }
  const snap = await getDocs(collection(db(), 'users', uid, 'levelCompletions'))
  const levelIds: string[] = []
  const dates: Date[] = []
  for (const d of snap.docs) {
    levelIds.push(d.id)
    const at = (d.data().completedAt as Timestamp | null)?.toDate()
    if (at) dates.push(at)
  }
  return { levelIds, dates }
}

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
