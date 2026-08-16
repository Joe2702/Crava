import { useCallback, useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where, type Timestamp } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './auth'
import type { Level, Skill, UserDoc } from './types'
import { streakFrom, xpFrom } from './progress'

export interface LevelWithState extends Level {
  state: 'done' | 'current' | 'locked'
}

export interface SkillPath {
  skill: Skill
  levels: LevelWithState[]
  user: UserDoc
  xp: number
  streak: number
  cleared: number
}

// Levels unlock strictly in order: everything up to the first incomplete level
// is done, that one is current, the rest are locked.
function deriveStates(levels: Level[], completed: Set<string>): LevelWithState[] {
  const sorted = [...levels].sort((a, b) => a.idx - b.idx)
  const firstIncomplete = sorted.findIndex((l) => !completed.has(l.id))
  const currentIdx = firstIncomplete === -1 ? sorted.length : firstIncomplete
  return sorted.map((l, i) => ({
    ...l,
    state: i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'locked',
  }))
}

export function useSkillPath(skillId = 'muscleup') {
  const { user } = useAuth()
  const [data, setData] = useState<SkillPath | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setError(null)
    try {
      const [skillSnap, levelSnap, userSnap] = await Promise.all([
        getDoc(doc(db, 'skills', skillId)),
        getDocs(query(collection(db, 'levels'), where('skillId', '==', skillId), orderBy('idx'))),
        getDoc(doc(db, 'users', user.uid)),
      ])

      if (!skillSnap.exists()) throw new Error(`Skill "${skillId}" not found — has the seed script been run?`)
      if (!userSnap.exists()) throw new Error('User document missing')

      setData({
        skill: { id: skillSnap.id, ...skillSnap.data() } as Skill,
        levels: deriveStates(levelSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Level), new Set()),
        user: userSnap.data() as UserDoc,
        xp: 0,
        streak: 0,
        cleared: 0,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load')
    } finally {
      setLoading(false)
    }
  }, [skillId, user])

  useEffect(() => {
    void load()
  }, [load])

  // Completions drive level states, XP and streak, so they are watched live —
  // finishing a level updates the whole screen without a manual refetch.
  useEffect(() => {
    if (!user) return
    return onSnapshot(collection(db, 'users', user.uid, 'levelCompletions'), (snap) => {
      const ids = new Set(snap.docs.map((d) => d.id))
      const dates = snap.docs
        .map((d) => (d.data().completedAt as Timestamp | null)?.toDate())
        .filter((d): d is Date => d instanceof Date)

      setData((prev) =>
        prev
          ? {
              ...prev,
              levels: deriveStates(prev.levels, ids),
              cleared: ids.size,
              xp: xpFrom(ids.size),
              streak: streakFrom(dates),
            }
          : prev,
      )
    })
  }, [user])

  return { data, error, loading, reload: load }
}
