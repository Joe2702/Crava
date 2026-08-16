import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { db, isDemo } from './firebase'
import { DEMO_SKILLS } from './demo'
import type { Skill } from './types'

const ACTIVE_SKILL_KEY = 'crava.activeSkillId'

interface CatalogValue {
  skills: Skill[]
  loading: boolean
  error: string | null
  reload: () => void
  activeSkillId: string | null
  setActiveSkillId: (id: string) => void
  activeSkill: Skill | null
}

const CatalogCtx = createContext<CatalogValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSkillId, setActive] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    if (isDemo) {
      setSkills(DEMO_SKILLS)
      setLoading(false)
      return
    }
    try {
      // isPublished is filtered rather than assumed because the rule on skills/
      // tests it, and a query that does not constrain what the rule tests is
      // rejected outright. See firebase/README.md.
      const snap = await getDocs(
        query(collection(db(), 'skills'), where('isPublished', '==', true), orderBy('sortOrder')),
      )
      setSkills(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Skill))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the catalog')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // The chosen skill is a device preference rather than account state, so it
  // lives in AsyncStorage. Moving it to the user document would sync it across
  // devices, which needs a rules change to allow the extra key.
  useEffect(() => {
    void AsyncStorage.getItem(ACTIVE_SKILL_KEY).then((stored) => {
      if (stored) setActive(stored)
    })
  }, [])

  const setActiveSkillId = useCallback((id: string) => {
    setActive(id)
    void AsyncStorage.setItem(ACTIVE_SKILL_KEY, id)
  }, [])

  // Falling back to the first skill keeps every screen working before a choice
  // has been made, and also when a stored id points at a skill that has since
  // been unpublished.
  const activeSkill = useMemo(
    () => skills.find((s) => s.id === activeSkillId) ?? skills[0] ?? null,
    [skills, activeSkillId],
  )

  const value = useMemo<CatalogValue>(
    () => ({
      skills,
      loading,
      error,
      reload: () => void load(),
      activeSkillId: activeSkill?.id ?? null,
      setActiveSkillId,
      activeSkill,
    }),
    [skills, loading, error, load, activeSkill, setActiveSkillId],
  )

  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogCtx)
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider')
  return ctx
}
