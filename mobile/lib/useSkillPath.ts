import { useCallback, useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where, type Timestamp } from 'firebase/firestore'
import { db, isDemo } from './firebase'
import { demo, DEMO_SKILLS, levelsForSkill } from './demo'
import { useAuth } from './auth'
import { useCatalog } from './catalog'
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

function blankProfile(displayName: string | null): UserDoc {
  return {
    displayName,
    locale: 'en',
    city: null,
    notifEnabled: true,
    onboardedAt: null,
    createdAt: Date.now(),
    entitlement: null,
  }
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

/** Reads the catalog's active skill unless a specific one is asked for. */
export function useSkillPath(skillIdArg?: string) {
  const { user } = useAuth()
  const { activeSkillId } = useCatalog()
  const skillId = skillIdArg ?? activeSkillId
  const [data, setData] = useState<SkillPath | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user || !skillId) return
    setError(null)

    if (isDemo) {
      const skill = DEMO_SKILLS.find((s) => s.id === skillId)
      if (skill) setData(build(skill, levelsForSkill(skillId), demo.user, demo.levelCompletions()))
      setLoading(false)
      return
    }

    try {
      const [skillSnap, levelSnap, userSnap] = await Promise.all([
        getDoc(doc(db(), 'skills', skillId)),
        // isPublished is filtered here because the security rule on levels/
        // tests it. Rules are not filters: for a query, Firestore rejects the
        // whole read unless the query itself proves every document it could
        // return satisfies the rule. Without this clause the screen fails with
        // "Missing or insufficient permissions" even though every level is
        // published. The single-document reads either side are fine, since a
        // get is evaluated against the document it actually returns.
        getDocs(
          query(
            collection(db(), 'levels'),
            where('skillId', '==', skillId),
            where('isPublished', '==', true),
            orderBy('idx'),
          ),
        ),
        getDoc(doc(db(), 'users', user.uid)),
      ])

      if (!skillSnap.exists()) throw new Error(`Skill "${skillId}" not found — has the seed script been run?`)

      setData(
        build(
          { id: skillSnap.id, ...skillSnap.data() } as Skill,
          levelSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Level),
          // The profile document is written straight after sign-up, but
          // onAuthStateChanged fires before that write lands, so this screen can
          // mount first. Nothing here derives from the profile — it is display
          // data — so a blank one is used rather than failing the whole path.
          (userSnap.data() as UserDoc | undefined) ?? blankProfile(user.displayName),
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
        setData((prev) =>
          prev ? build(prev.skill, prev.levels, demo.user, demo.levelCompletions()) : prev,
        )
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
