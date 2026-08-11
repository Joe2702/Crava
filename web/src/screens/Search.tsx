import { useApp } from '../context/AppContext'
import { COACHES, SKILLS } from '../data/content'
import { chip, row } from '../lib/styleHelpers'
import { IconChevronRight, IconSearch } from '../components/Icons'

export function Search() {
  const { state, t, set, skillObj, nav } = useApp()

  const cats: [string, string][] = [['all', t('All', 'الكل')], ...SKILLS.map((s) => [s.id, t(s.catEn, s.catAr)] as [string, string])]
  const q = state.q.trim().toLowerCase()

  const skillHits = SKILLS.filter((s) => state.cat === 'all' || s.id === state.cat)
    .filter((s) => !q || `${s.en} ${s.ar} ${s.catEn}`.toLowerCase().includes(q))
    .map((s) => ({
      key: `skill-${s.id}`,
      name: t(s.en, s.ar),
      meta: t(`${s.catEn} · 6 levels · ${s.coachEn}`, `${s.catAr} · ٦ مستويات · ${s.coachAr}`),
      go: () => nav({ skill: s.id, screen: 'tree' }),
    }))

  const coachHits = COACHES.filter((c) => state.cat === 'all' || c.skill === state.cat)
    .filter((c) => !q || `${c.en} ${c.ar}`.toLowerCase().includes(q))
    .map((c) => ({
      key: `coach-${c.id}`,
      name: t(c.en, c.ar),
      meta: t(`Coach · ${skillObj(c.skill).catEn} · ★ ${c.rating}`, `مدرب · ${skillObj(c.skill).catAr} · ★ ${c.rating}`),
      go: () => nav({ coach: c.id, screen: 'booking', booked: false }),
    }))

  const results = [...skillHits, ...coachHits]

  return (
    <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.035em', margin: 0 }}>{t('Browse', 'تصفح')}</h1>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', insetInlineStart: 14, display: 'flex', color: 'rgba(60,60,67,0.45)', pointerEvents: 'none' }}>
          <IconSearch />
        </span>
        <input
          value={state.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder={t('Search skills, coaches', 'ابحث عن مهارة أو مدرب')}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: 'none',
            background: 'rgba(118,118,128,0.12)',
            borderRadius: 14,
            padding: '13px 16px',
            paddingInlineStart: 44,
            fontSize: 16,
            color: '#1c1c1e',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {cats.map(([id, name]) => (
          <button key={id} onClick={() => set({ cat: id })} style={chip(state.cat === id)}>
            {name}
          </button>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.05)' }}>
        {results.map((r, i) => (
          <button key={r.key} onClick={r.go} style={row(i === results.length - 1)}>
            <span style={{ width: 56, height: 56, flex: '0 0 auto', borderRadius: 16, background: 'linear-gradient(150deg,#dcdce1,#cbcbd3)' }} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'start', flex: 1 }}>
              <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em' }}>{r.name}</span>
              <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>{r.meta}</span>
            </span>
            <span style={{ flex: '0 0 auto' }}>
              <IconChevronRight />
            </span>
          </button>
        ))}
      </div>
      {results.length === 0 && (
        <div style={{ padding: '24px 4px', fontSize: 15, color: 'rgba(60,60,67,0.6)' }}>{t('Nothing matches that yet.', 'لا توجد نتائج مطابقة بعد.')}</div>
      )}
    </div>
  )
}
