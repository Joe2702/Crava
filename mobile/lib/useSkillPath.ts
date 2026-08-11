import { useCallback, useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './auth'
import type { Level, Skill, UserDoc } from './types'

export interface LevelWithState extends Level {
  state: 'done' | 'current' | 'locked'
}

export interface SkillPath {
  skill: Skill
  levels: LevelWithState[]
  user: UserDoc
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
      const [skillSnap, levelSnap, completionSnap, userSnap] = await Promise.all([
        getDoc(doc(db, 'skills', skillId)),
        getDocs(query(collection(db, 'levels'), where('skillId', '==', skillId), orderBy('idx'))),
        getDocs(collection(db, 'users', user.uid, 'levelCompletions')),
        getDoc(doc(db, 'users', user.uid)),
      ])

      if (!skillSnap.exists()) throw new Error(`Skill "${skillId}" not found — has the seed script been run?`)
      if (!userSnap.exists()) throw new Error('User document missing')

      const levels = levelSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Level)
      setData({
        skill: { id: skillSnap.id, ...skillSnap.data() } as Skill,
        levels: deriveStates(levels, new Set(completionSnap.docs.map((d) => d.id))),
        user: userSnap.data() as UserDoc,
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

  // XP and streak are written by a Cloud Function, so the client never sees
  // those updates from its own write — subscribe instead of relying on refetch.
  useEffect(() => {
    if (!user) return
    return onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (!snap.exists()) return
      setData((prev) => (prev ? { ...prev, user: snap.data() as UserDoc } : prev))
    })
  }, [user])

  return { data, error, loading, reload: load }
}
