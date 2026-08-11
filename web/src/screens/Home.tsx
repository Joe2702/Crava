import { useApp } from '../context/AppContext'
import { ACCENT, POSTS, SKILLS } from '../data/content'
import { cardShadow, cardShadowSm } from '../lib/styleHelpers'
import { IconFlame, IconPlay } from '../components/Icons'

export function Home() {
  const { state, t, skillObj, nav, goLesson, goSearch, goPaywall, goCommunity } = useApp()

  const sk = skillObj()
  const lvName = sk.levels[state.level - 1]
  const xpMax = 2000
  const xpPct = Math.min(100, Math.round((state.xp / xpMax) * 100))
  const week: [string, boolean][] = [
    [t('M', 'ن'), true],
    [t('T', 'ث'), true],
    [t('W', 'ر'), true],
    [t('T', 'خ'), false],
    [t('F', 'ج'), true],
    [t('S', 'س'), false],
    [t('S', 'ح'), false],
  ]
  const topPost = POSTS[0]

  return (
    <div style={{ padding: '8px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, paddingTop: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(60,60,67,0.6)' }}>{t('Welcome back', 'أهلاً بعودتك')}</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, margin: '2px 0 0' }}>
            {t('Yassin', 'ياسين')}
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(228,52,26,0.1)',
            color: '#c22a13',
            borderRadius: 999,
            padding: '8px 14px',
          }}
        >
          <IconFlame />
          <span style={{ fontSize: 17, fontWeight: 700 }}>{state.streak}</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{t('day streak', 'يوم متتالي')}</span>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 22, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, ...cardShadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{t('Level 7', 'المستوى ٧')}</span>
          <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>{state.xp} / {xpMax} XP</span>
        </div>
        <div style={{ height: 12, borderRadius: 999, background: 'rgba(118,118,128,0.12)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#f0512f,' + ACCENT + ')', width: `${xpPct}%`, transition: 'width .4s ease' }} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 22, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, ...cardShadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{t('This week', 'هذا الأسبوع')}</span>
          <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>{t('4 of 5 sessions', '٤ من ٥ جلسات')}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
          {week.map(([d, done], i) => (
            <span key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: 1 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  background: done ? ACCENT : 'rgba(118,118,128,0.12)',
                  color: done ? '#fff' : 'rgba(60,60,67,0.4)',
                  boxShadow: done ? '0 5px 14px rgba(228,52,26,0.26)' : undefined,
                }}
              >
                {done ? '✓' : ''}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(60,60,67,0.6)' }}>{d}</span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(60,60,67,0.6)', letterSpacing: '0.01em' }}>
          {t('Continue where you stopped', 'أكمل من حيث توقفت')}
        </div>
        <button
          onClick={goLesson}
          style={{
            background: '#fff',
            border: 'none',
            borderRadius: 24,
            padding: 0,
            overflow: 'hidden',
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: 'inherit',
            textAlign: 'start',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 14px 36px rgba(0,0,0,0.07)',
          }}
        >
          <div
            style={{
              height: 170,
              background: 'linear-gradient(150deg,#d8d8de,#c9c9d1)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: 14,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(28,28,30,0.55)' }}>
              Skill still 16:9
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(12px)',
                borderRadius: 999,
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <IconPlay />
              {t('Resume', 'متابعة')}
            </span>
          </div>
          <div style={{ padding: '16px 18px 18px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT, letterSpacing: '0.02em' }}>
              {t(`Level ${state.level} of 6`, `المستوى ${state.level} من ٦`)}
            </div>
            <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4 }}>{t(lvName[0], lvName[1])}</div>
            <div style={{ fontSize: 14, color: 'rgba(60,60,67,0.6)', marginTop: 3 }}>
              {t(sk.en, sk.ar)} · {t(sk.coachEn, sk.coachAr)}
            </div>
          </div>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(60,60,67,0.6)' }}>{t('Skills for you', 'مهارات لك')}</span>
          <button onClick={goSearch} style={{ background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: ACCENT, cursor: 'pointer', padding: 0 }}>
            {t('See all', 'عرض الكل')}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {SKILLS.map((s) => {
            const pct = Math.round(((state.unlocked[s.id] - 1) / 6) * 100)
            return (
              <button
                key={s.id}
                onClick={() => nav({ skill: s.id, screen: 'tree' })}
                style={{
                  background: '#fff',
                  border: 'none',
                  borderRadius: 20,
                  padding: 16,
                  textAlign: 'start',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minHeight: 124,
                  ...cardShadowSm,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 650, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{t(s.en, s.ar)}</span>
                <span style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)' }}>
                  {t(s.catEn, s.catAr)} · {state.unlocked[s.id] - 1}/6
                </span>
                <span style={{ marginTop: 'auto', height: 8, borderRadius: 999, background: 'rgba(118,118,128,0.12)', display: 'block', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', borderRadius: 999, background: ACCENT, width: `${pct}%` }} />
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={goPaywall}
        style={{
          textAlign: 'start',
          background: 'linear-gradient(135deg,#ef4a2f,#d02c11)',
          color: '#fff',
          border: 'none',
          borderRadius: 24,
          padding: 22,
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 10px 30px rgba(228,52,26,0.28)',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85 }}>
          {t('Crava Pro', 'كرافا برو')}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.12, marginTop: 8 }}>
          {t('Every skill, one price', 'كل المهارات بسعر واحد')}
        </div>
        <div style={{ fontSize: 14, marginTop: 6, opacity: 0.9 }}>{t('EGP 149 / month · cancel anytime', '١٤٩ ج.م شهرياً · إلغاء في أي وقت')}</div>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(60,60,67,0.6)' }}>{t('From the community', 'من المجتمع')}</div>
        <button
          onClick={goCommunity}
          style={{
            background: '#fff',
            border: 'none',
            borderRadius: 20,
            padding: 18,
            textAlign: 'start',
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: 'inherit',
            ...cardShadowSm,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.01em' }}>{t(topPost.textEn, topPost.textAr)}</div>
          <div style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)', marginTop: 8 }}>
            {t(topPost.en, topPost.ar)} · {t(topPost.whenEn, topPost.whenAr)} · {topPost.likes} {t('likes', 'إعجاب')}
          </div>
        </button>
      </div>
    </div>
  )
}
