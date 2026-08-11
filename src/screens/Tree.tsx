import { useApp } from '../context/AppContext'
import { ACCENT, SKILLS } from '../data/content'
import { chip, row } from '../lib/styleHelpers'

export function Tree() {
  const { state, t, skillObj, set, nav } = useApp()
  const sk = skillObj()
  const un = state.unlocked[sk.id]

  return (
    <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(60,60,67,0.6)' }}>{t('Skill path', 'مسار المهارة')}</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, margin: '2px 0 6px' }}>{t(sk.en, sk.ar)}</h1>
        <div style={{ fontSize: 14, color: 'rgba(60,60,67,0.6)' }}>
          {t(`${un - 1} of 6 levels cleared`, `أنهيت ${un - 1} من ٦ مستويات`)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {SKILLS.map((s) => (
          <button key={s.id} onClick={() => set({ skill: s.id })} style={chip(s.id === state.skill)}>
            {t(s.catEn, s.catAr)}
          </button>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.05)' }}>
        {sk.levels.map((lv, i) => {
          const n = i + 1
          const status = n < un ? 'done' : n === un ? 'current' : 'locked'
          const label = status === 'done' ? t('Done', 'تم') : status === 'current' ? t('Next', 'التالي') : t('Locked', 'مغلق')
          return (
            <button
              key={n}
              onClick={() => {
                if (status !== 'locked') nav({ level: n, screen: 'lesson' })
              }}
              style={row(i === sk.levels.length - 1, status === 'locked' ? { opacity: 0.45, cursor: 'not-allowed' } : undefined)}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  flex: '0 0 auto',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 650,
                  background: status === 'done' ? 'rgba(52,199,89,0.14)' : status === 'current' ? ACCENT : 'rgba(118,118,128,0.14)',
                  color: status === 'done' ? '#248a3d' : status === 'current' ? '#fff' : 'rgba(60,60,67,0.6)',
                  boxShadow: status === 'current' ? '0 6px 16px rgba(228,52,26,0.28)' : undefined,
                }}
              >
                {status === 'done' ? '✓' : n}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'start', flex: 1 }}>
                <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em' }}>{t(lv[0], lv[1])}</span>
                <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>{t('4 drills · 12 min', '٤ تمارين · ١٢ دقيقة')}</span>
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 999,
                  padding: '5px 11px',
                  background: status === 'current' ? 'rgba(228,52,26,0.1)' : 'rgba(118,118,128,0.12)',
                  color: status === 'current' ? '#c22a13' : 'rgba(60,60,67,0.6)',
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
