import { useCallback, useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where, type Timestamp } from 'firebase/firestore'
import { db, isDemo } from './firebase'
import { demo, DEMO_SKILLS, levelsForSkill } from './demo'
import { useAuth } from './auth'
import { progressOf, nextLessonIndex, type CourseProgress } from './progress'
import type { Course, Lesson } from './types'

export interface LessonWithState extends Lesson {
  completed: boolean
  /** The one Continue opens. Exactly one lesson in a course has this. */
  isNext: boolean
}

export interface CourseDetail {
  course: Course
  lessons: LessonWithState[]
  progress: CourseProgress
  /** Lesson id to open from Continue, or null for an empty course. */
  nextLessonId: string | null
}

function build(course: Course, lessons: Lesson[], completed: Set<string>): CourseDetail {
  const ordered = [...lessons].sort((a, b) => a.idx - b.idx)
  const ids = ordered.map((l) => l.id)
  const nextIdx = ordered.length === 0 ? -1 : nextLessonIndex(ids, completed)

  return {
    course,
    lessons: ordered.map((l, i) => ({
      ...l,
      completed: completed.has(l.id),
      isNext: i === nextIdx,
    })),
    progress: progressOf(ordered.filter((l) => completed.has(l.id)).length, ordered.length),
    nextLessonId: nextIdx === -1 ? null : ids[nextIdx],
  }
}

/**
 * One course and the viewer's place in it.
 *
 * Every lesson is unlocked. A course platform lets you skip around and come
 * back — the previous design locked lessons behind the one before, which is a
 * training-programme idea, not a curriculum one. What gates content is the
 * subscription, not the order you watch in.
 */
export function useCourse(courseId: string | null | undefined) {
  const { user } = useAuth()
  const [data, setData] = useState<CourseDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user || !courseId) return
    setError(null)

    if (isDemo) {
      const course = DEMO_SKILLS.find((s) => s.id === courseId)
      if (course) {
        setData(build(course, levelsForSkill(courseId), new Set(demo.levelCompletions().keys())))
      }
      setLoading(false)
      return
    }

    try {
      // isPublished is filtered because the rule on levels/ tests it — a query
      // that does not constrain what the rule tests is rejected outright.
      const [courseSnap, lessonSnap] = await Promise.all([
        getDoc(doc(db(), 'skills', courseId)),
        getDocs(
          query(
            collection(db(), 'levels'),
            where('skillId', '==', courseId),
            where('isPublished', '==', true),
            orderBy('idx'),
          ),
        ),
      ])
      if (!courseSnap.exists()) throw new Error('Course not found')
      setData(
        build(
          { id: courseSnap.id, ...courseSnap.data() } as Course,
          lessonSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lesson),
          new Set(),
        ),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the course')
    } finally {
      setLoading(false)
    }
  }, [courseId, user])

  useEffect(() => {
    void load()
  }, [load])

  // Completions are watched live so finishing a lesson updates the curriculum
  // and the progress bar without a manual refetch.
  useEffect(() => {
    if (!user) return

    if (isDemo) {
      return demo.subscribe(() => {
        setData((prev) =>
          prev ? build(prev.course, prev.lessons, new Set(demo.levelCompletions().keys())) : prev,
        )
      })
    }

    return onSnapshot(collection(db(), 'users', user.uid, 'levelCompletions'), (snap) => {
      const done = new Set(snap.docs.map((d) => d.id))
      setData((prev) => (prev ? build(prev.course, prev.lessons, done) : prev))
    })
  }, [user])

  return { data, error, loading, reload: load }
}

/** Completed lesson ids across every course, for the My learning list. */
export async function fetchCompletedLessonIds(uid: string): Promise<Set<string>> {
  if (isDemo) return new Set(demo.levelCompletions().keys())
  const snap = await getDocs(collection(db(), 'users', uid, 'levelCompletions'))
  return new Set(snap.docs.map((d) => d.id))
}

export type { Timestamp }
