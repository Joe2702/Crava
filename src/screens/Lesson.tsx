import { useApp } from '../context/AppContext'
import { ACCENT } from '../data/content'
import { radio, row } from '../lib/styleHelpers'
import { IconPlayBig } from '../components/Icons'

export function Lesson() {
  const { state, t, skillObj, goTree, goBooking, drillsFor, drillKey, allDrillsDone, toggleDrill, complete } = useApp()
  const sk = skillObj()
  const lvName = sk.levels[state.level - 1]
  const drills = drillsFor(state.skill, state.level)
  const done = allDrillsDone()

  return (
    <div style={{ padding: '12px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={goTree}
          style={{ background: 'rgba(118,118,128,0.12)', border: 'none', borderRadius: 999, padding: '9px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#1c1c1e' }}
        >
          {t('‹ Back', 'رجوع ›')}
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(60,60,67,0.6)' }}>{t(`Level ${state.level} of 6`, `المستوى ${state.level} من ٦`)}</span>
      </div>

      <div style={{ borderRadius: 26, overflow: 'hidden', background: '#1c1c1e', boxShadow: '0 14px 40px rgba(0,0,0,0.18)' }}>
        <div style={{ height: 214, background: 'linear-gradient(150deg,#3a3a3e,#232326)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span
            style={{
              width: 66,
              height: 66,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.94)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1c1c1e',
              paddingInlineStart: 4,
              boxShadow: '0 10px 26px rgba(0,0,0,0.28)',
            }}
          >
            <IconPlayBig />
          </span>
        </div>
        <div style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.22)', overflow: 'hidden' }}>
            <div style={{ width: '38%', height: '100%', background: '#fff', borderRadius: 999 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            <span>1:34</span>
            <span>{t('AR audio · EN subtitles', 'صوت عربي · ترجمة إنجليزية')}</span>
            <span>4:12</span>
          </div>
        </div>
      </div>

      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.12, margin: 0 }}>{t(lvName[0], lvName[1])}</h1>
        <div style={{ fontSize: 14, color: 'rgba(60,60,67,0.6)', marginTop: 6 }}>
          {t(sk.en, sk.ar)} · {t(sk.coachEn, sk.coachAr)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(60,60,67,0.6)' }}>{t('Drills', 'التمارين')}</div>
        <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.05)' }}>
          {drills.map((d, i) => {
            const on = !!state.done[drillKey(i)]
            return (
              <button key={i} onClick={() => toggleDrill(i)} style={row(i === drills.length - 1, { alignItems: 'flex-start' })}>
                <span style={{ ...radio(on), marginTop: 1 }}>{on && '✓'}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'start', flex: 1 }}>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: '-0.015em',
                      textDecoration: on ? 'line-through' : undefined,
                      color: on ? 'rgba(60,60,67,0.5)' : undefined,
                    }}
                  >
                    {t(d.en, d.ar)}
                  </span>
                  <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>{t(d.metaEn, d.metaAr)}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={complete}
          disabled={!done}
          style={{
            border: 'none',
            borderRadius: 16,
            padding: 17,
            fontFamily: 'inherit',
            fontSize: 17,
            fontWeight: 600,
            background: done ? ACCENT : 'rgba(118,118,128,0.12)',
            color: done ? '#fff' : 'rgba(60,60,67,0.45)',
            cursor: done ? 'pointer' : 'not-allowed',
            boxShadow: done ? '0 8px 22px rgba(228,52,26,0.28)' : undefined,
          }}
        >
          {done ? t('Mark level complete · +120 XP', 'أنهِ المستوى · +١٢٠ نقطة') : t('Finish the drills to unlock', 'أكمل التمارين للفتح')}
        </button>
        <button
          onClick={goBooking}
          style={{ background: 'rgba(228,52,26,0.1)', color: '#c22a13', border: 'none', borderRadius: 16, padding: 16, fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
        >
          {t('Book a coach review', 'احجز مراجعة مع مدرب')}
        </button>
      </div>
    </div>
  )
}
