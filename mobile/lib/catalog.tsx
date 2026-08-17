import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db, isDemo } from './firebase'
import { DEMO_SKILLS } from './demo'
import type { Course } from './types'

interface CatalogValue {
  courses: Course[]
  loading: boolean
  error: string | null
  reload: () => void
}

const CatalogCtx = createContext<CatalogValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    if (isDemo) {
      setCourses(DEMO_SKILLS)
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
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Course))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the catalog')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const value = useMemo<CatalogValue>(
    () => ({ courses, loading, error, reload: () => void load() }),
    [courses, loading, error, load],
  )

  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogCtx)
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider')
  return ctx
}
