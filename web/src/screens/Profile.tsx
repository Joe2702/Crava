import { useApp } from '../context/AppContext'
import { ACCENT } from '../data/content'
import { cardShadow, cardShadowSm } from '../lib/styleHelpers'
import { IconChevronRight } from '../components/Icons'

export function Profile() {
  const { state, t, set, toggleLang, goPaywall, goSearch } = useApp()

  const xpMax = 2000
  const xpPct = Math.min(100, Math.round((state.xp / xpMax) * 100))
  const levelsCleared = Object.values(state.unlocked).reduce((a, b) => a + b - 1, 0)

  const stats = [
    { v: String(levelsCleared), k: t('Levels', 'مستويات') },
    { v: String(state.streak), k: t('Day streak', 'يوم متتالي') },
    { v: '3', k: t('Badges', 'شارات') },
  ]

  const badges: { name: string; earned: boolean }[] = [
    { name: t('First rep', 'أول تكرار'), earned: true },
    { name: t('7-day streak', '٧ أيام متتالية'), earned: true },
    { name: t('Level 5', 'المستوى ٥'), earned: true },
    { name: t('Muscle-up', 'المسل أب'), earned: false },
    { name: t('Coach reviewed', 'مراجعة مدرب'), earned: false },
    { name: t('30-day streak', '٣٠ يوماً'), earned: false },
  ]

  const reset = () =>
    set({
      done: {},
      xp: 1240,
      streak: 12,
      unlocked: { muscleup: 4, boxing: 2, sprint: 1, parkour: 1 },
      liked: {},
      booked: false,
      screen: 'onboarding',
      ob: 0,
      tick: 0,
    })

  return (
    <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ width: 78, height: 78, flex: '0 0 auto', borderRadius: 999, background: 'linear-gradient(150deg,#dcdce1,#c9c9d1)' }} />
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{t('Yassin', 'ياسين')}</span>
          <span style={{ fontSize: 14, color: 'rgba(60,60,67,0.6)' }}>{t('Cairo · joined March 2026', 'القاهرة · انضم في مارس ٢٠٢٦')}</span>
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {stats.map((s) => (
          <div key={s.k} style={{ background: '#fff', borderRadius: 20, padding: 16, ...cardShadowSm }}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)', marginTop: 6 }}>{s.k}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 22, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, ...cardShadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{t('Level 7', 'المستوى ٧')}</span>
          <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>{state.xp} / {xpMax} XP</span>
        </div>
        <div style={{ height: 12, borderRadius: 999, background: 'rgba(118,118,128,0.12)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg,#f0512f,${ACCENT})`, width: `${xpPct}%`, transition: 'width .4s ease' }} />
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(60,60,67,0.6)' }}>{t('Badges', 'الشارات')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {badges.map((b) => (
          <div
            key={b.name}
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              minHeight: 112,
              opacity: b.earned ? 1 : 0.5,
              ...cardShadowSm,
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                background: b.earned ? 'linear-gradient(140deg,#f0512f,#c9260c)' : 'rgba(118,118,128,0.16)',
                color: b.earned ? '#fff' : 'rgba(60,60,67,0.4)',
              }}
            >
              {b.earned ? '★' : ''}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>{b.name}</span>
            <span style={{ fontSize: 11, color: 'rgba(60,60,67,0.6)' }}>{b.earned ? t('Earned', 'مكتسبة') : t('Locked', 'مغلقة')}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', ...cardShadow }}>
        <button
          onClick={toggleLang}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            boxSizing: 'border-box',
            background: 'none',
            border: 'none',
            borderBottom: '0.5px solid rgba(60,60,67,0.14)',
            padding: '16px 18px',
            fontFamily: 'inherit',
            fontSize: 16,
            cursor: 'pointer',
            color: '#1c1c1e',
          }}
        >
          {t('Language — English', 'اللغة — العربية')}
          <IconChevronRight />
        </button>
        <button
          onClick={goPaywall}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            boxSizing: 'border-box',
            background: 'none',
            border: 'none',
            borderBottom: '0.5px solid rgba(60,60,67,0.14)',
            padding: '16px 18px',
            fontFamily: 'inherit',
            fontSize: 16,
            cursor: 'pointer',
            color: '#1c1c1e',
          }}
        >
          {t('Manage subscription', 'إدارة الاشتراك')}
          <IconChevronRight />
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            width: '100%',
            boxSizing: 'border-box',
            borderBottom: '0.5px solid rgba(60,60,67,0.14)',
            padding: '13px 18px',
            fontSize: 16,
          }}
        >
          <span>{t('Notifications', 'الإشعارات')}</span>
          <button
            onClick={() => set((s) => ({ notif: !s.notif }))}
            style={{
              width: 51,
              height: 31,
              flex: '0 0 auto',
              borderRadius: 999,
              border: 'none',
              padding: 2,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: state.notif ? 'flex-end' : 'flex-start',
              background: state.notif ? '#34c759' : 'rgba(118,118,128,0.24)',
              transition: 'background .22s ease',
            }}
          >
            <span style={{ width: 27, height: 27, borderRadius: 999, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.22)', display: 'block' }} />
          </button>
        </div>
        <button
          onClick={goSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            boxSizing: 'border-box',
            background: 'none',
            border: 'none',
            borderBottom: '0.5px solid rgba(60,60,67,0.14)',
            padding: '16px 18px',
            fontFamily: 'inherit',
            fontSize: 16,
            cursor: 'pointer',
            color: '#1c1c1e',
          }}
        >
          {t('Downloads · 3 courses', 'التحميلات · ٣ كورسات')}
          <IconChevronRight />
        </button>
        <button
          onClick={reset}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
            background: 'none',
            border: 'none',
            padding: '16px 18px',
            fontFamily: 'inherit',
            fontSize: 16,
            cursor: 'pointer',
            color: ACCENT,
          }}
        >
          {t('Reset prototype data', 'إعادة ضبط بيانات النموذج')}
        </button>
      </div>
    </div>
  )
}
