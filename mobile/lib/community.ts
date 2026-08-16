import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export const MAX_POST_LENGTH = 500
const FEED_PAGE = 30

export interface Post {
  id: string
  authorUid: string
  authorName: string | null
  body: string
  skillId: string | null
  createdAt: Date | null
  likeCount: number
  likedByMe: boolean
  mine: boolean
}

/**
 * The like count comes from an aggregation query rather than a stored field.
 * Storing it would mean letting clients increment it, and a rule cannot tell an
 * increment that accompanies a like from one that does not — so the number
 * could be inflated at will. Aggregations are computed server-side and are
 * billed per 1000 documents read, which at feed sizes is negligible.
 */
export async function fetchFeed(uid: string): Promise<Post[]> {
  const [snap, blockedSnap] = await Promise.all([
    getDocs(query(collection(db(), 'posts'), orderBy('createdAt', 'desc'), limit(FEED_PAGE))),
    getDocs(collection(db(), 'users', uid, 'blocked')),
  ])
  const blocked = new Set(blockedSnap.docs.map((d) => d.id))

  const visible = snap.docs.filter((d) => !blocked.has((d.data().authorUid as string) ?? ''))

  return Promise.all(
    visible.map(async (d) => {
      const data = d.data()
      const likes = collection(db(), 'posts', d.id, 'likes')
      const [count, mine] = await Promise.all([
        getCountFromServer(likes),
        getDoc(doc(db(), 'posts', d.id, 'likes', uid)),
      ])
      return {
        id: d.id,
        authorUid: data.authorUid as string,
        authorName: (data.authorName as string | null) ?? null,
        body: data.body as string,
        skillId: (data.skillId as string | null) ?? null,
        createdAt: (data.createdAt as Timestamp | null)?.toDate() ?? null,
        likeCount: count.data().count,
        likedByMe: mine.exists(),
        mine: data.authorUid === uid,
      }
    }),
  )
}

export async function createPost(input: {
  uid: string
  authorName: string | null
  body: string
  skillId: string | null
}) {
  await addDoc(collection(db(), 'posts'), {
    authorUid: input.uid,
    authorName: input.authorName,
    body: input.body.trim(),
    skillId: input.skillId,
    createdAt: serverTimestamp(),
  })
}

export async function setLiked(postId: string, uid: string, liked: boolean) {
  const ref = doc(db(), 'posts', postId, 'likes', uid)
  if (liked) await setDoc(ref, { createdAt: serverTimestamp() })
  else await deleteDoc(ref)
}

export async function deletePost(postId: string) {
  await deleteDoc(doc(db(), 'posts', postId))
}

export async function reportPost(postId: string, reporterUid: string, reason: string) {
  await addDoc(collection(db(), 'reports'), {
    postId,
    reporterUid,
    reason,
    createdAt: serverTimestamp(),
  })
}

export async function blockAuthor(uid: string, authorUid: string) {
  await setDoc(doc(db(), 'users', uid, 'blocked', authorUid), { createdAt: serverTimestamp() })
}
