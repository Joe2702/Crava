import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Tables } from './database.types'

export interface LevelWithState {
  id: string
  idx: number
  name_en: string
  name_ar: string
  video_id: string | null
  state: 'done' | 'current' | 'locked'
}

export interface SkillPath {
  skill: Tables<'skills'>
  levels: LevelWithState[]
  stats: Tables<'user_stats'>
  profile: Tables<'profiles'>
}

// Levels unlock strictly in order: everything up to the highest completed level
// is done, the next one is current, the rest are locked.
function deriveStates(
  levels: Tables<'levels'>[],
  completedIds: Set<string>,
): LevelWithState[] {
  const sorted = [...levels].sort((a, b) => a.idx - b.idx)
  const firstIncomplete = sorted.findIndex((l) => !completedIds.has(l.id))
  const currentIdx = firstIncomplete === -1 ? sorted.length : firstIncomplete
  return sorted.map((l, i) => ({
    id: l.id,
    idx: l.idx,
    name_en: l.name_en,
    name_ar: l.name_ar,
    video_id: l.video_id,
    state: i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'locked',
  }))
}

export function useSkillPath(skillId = 'muscleup') {
  const [data, setData] = useState<SkillPath | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setError(null)
    const [skillRes, levelRes, completionRes, statsRes, profileRes] = await Promise.all([
      supabase.from('skills').select('*').eq('id', skillId).single(),
      supabase.from('levels').select('*').eq('skill_id', skillId).order('idx'),
      supabase.from('user_level_completions').select('level_id'),
      supabase.from('user_stats').select('*').single(),
      supabase.from('profiles').select('*').single(),
    ])

    const failure =
      skillRes.error || levelRes.error || completionRes.error || statsRes.error || profileRes.error
    if (failure) {
      setError(failure.message)
      setLoading(false)
      return
    }

    setData({
      skill: skillRes.data,
      levels: deriveStates(levelRes.data, new Set(completionRes.data.map((c) => c.level_id))),
      stats: statsRes.data,
      profile: profileRes.data,
    })
    setLoading(false)
  }, [skillId])

  useEffect(() => {
    void load()
  }, [load])

  return { data, error, loading, reload: load }
}
