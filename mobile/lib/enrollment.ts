import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore'
import { db, isDemo } from './firebase'
import { demo } from './demo'

/**
 * Enrolment is what "My learning" is built from — the courses someone has
 * actually started, rather than one "active skill" remembered on the device.
 * Keeping it on the account means the list follows the user to a new phone,
 * which a device preference never did.
 */
export interface Enrollment {
  courseId: string
  enrolledAt: Date | null
}

export async function fetchEnrollments(uid: string): Promise<Enrollment[]> {
  if (isDemo) return demo.enrollments()
  const snap = await getDocs(collection(db(), 'users', uid, 'enrollments'))
  return snap.docs
    .map((d) => ({
      courseId: d.id,
      enrolledAt: (d.data().enrolledAt as Timestamp | null)?.toDate() ?? null,
    }))
    .sort((a, b) => (b.enrolledAt?.getTime() ?? 0) - (a.enrolledAt?.getTime() ?? 0))
}

export async function enroll(uid: string, courseId: string) {
  if (isDemo) return demo.enroll(courseId)
  await setDoc(doc(db(), 'users', uid, 'enrollments', courseId), { enrolledAt: serverTimestamp() })
}

export async function unenroll(uid: string, courseId: string) {
  if (isDemo) return demo.unenroll(courseId)
  await deleteDoc(doc(db(), 'users', uid, 'enrollments', courseId))
}
