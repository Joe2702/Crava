import { useCallback, useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where, type Timestamp } from 'firebase/firestore'
import { db, isDemo } from './firebase'
import { demo, DEMO_LEVELS, DEMO_SKILL } from './demo'
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

function build(skill: Skill, levels: Level[], user: UserDoc, completions: Map<string, Date>): SkillPath {
  const ids = new Set(completions.keys())
  return {
    skill,
    levels: deriveStates(levels, ids),
    user,
    cleared: ids.size,
    xp: xpFrom(ids.size),
    streak: streakFrom([...completions.values()]),
  }
}

export function useSkillPath(skillId = 'muscleup') {
  const { user } = useAuth()
  const [data, setData] = useState<SkillPath | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setError(null)

    if (isDemo) {
      setData(build(DEMO_SKILL, DEMO_LEVELS, demo.user, demo.levelCompletions()))
      setLoading(false)
      return
    }

    try {
      const [skillSnap, levelSnap, userSnap] = await Promise.all([
        getDoc(doc(db(), 'skills', skillId)),
        getDocs(query(collection(db(), 'levels'), where('skillId', '==', skillId), orderBy('idx'))),
        getDoc(doc(db(), 'users', user.uid)),
      ])

      if (!skillSnap.exists()) throw new Error(`Skill "${skillId}" not found — has the seed script been run?`)
      if (!userSnap.exists()) throw new Error('User document missing')

      setData(
        build(
          { id: skillSnap.id, ...skillSnap.data() } as Skill,
          levelSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Level),
          userSnap.data() as UserDoc,
          new Map(),
        ),
      )
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

    if (isDemo) {
      return demo.subscribe(() => {
        setData(build(DEMO_SKILL, DEMO_LEVELS, demo.user, demo.levelCompletions()))
      })
    }

    return onSnapshot(collection(db(), 'users', user.uid, 'levelCompletions'), (snap) => {
      const completions = new Map<string, Date>()
      for (const d of snap.docs) {
        const at = (d.data().completedAt as Timestamp | null)?.toDate()
        if (at) completions.set(d.id, at)
      }
      setData((prev) => (prev ? build(prev.skill, prev.levels, prev.user, completions) : prev))
    })
  }, [user])

  return { data, error, loading, reload: load }
}
