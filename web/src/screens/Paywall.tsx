import { useApp } from '../context/AppContext'
import { ACCENT } from '../data/content'
import { cardShadow, radio } from '../lib/styleHelpers'
import { IconCheck } from '../components/Icons'

export function Paywall() {
  const { state, t, egp, set, goHome, nav } = useApp()

  const plans = [
    { id: 'monthly' as const, name: t('Monthly', 'شهري'), meta: t('Billed every month', 'يُحصّل شهرياً'), price: egp(149), note: '' },
    { id: 'annual' as const, name: t('Annual', 'سنوي'), meta: t('Billed once a year', 'يُحصّل مرة سنوياً'), price: egp(1190), note: t('Save 33%', 'وفر ٣٣٪') },
  ]

  const proFeatures = [
    t('All four skill paths, 24 levels total', 'كل المسارات الأربعة، ٢٤ مستوى'),
    t('Arabic-first instruction with English subtitles', 'شرح بالعربية أولاً مع ترجمة إنجليزية'),
    t('Offline course packs for weak connections', 'حزم تحميل للمشاهدة دون إنترنت'),
    t('One free coach form review each month', 'مراجعة أداء مجانية مع مدرب شهرياً'),
    t('Crava Certified badge on completion', 'شارة كرافا المعتمدة عند الإنهاء'),
  ]

  return (
    <div style={{ padding: '12px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18, minHeight: '100%' }}>
      <button
        onClick={goHome}
        style={{ alignSelf: 'flex-start', background: 'rgba(118,118,128,0.12)', border: 'none', borderRadius: 999, width: 34, height: 34, fontFamily: 'inherit', fontSize: 17, cursor: 'pointer', color: 'rgba(60,60,67,0.6)' }}
      >
        ✕
      </button>
      <div style={{ borderRadius: 28, padding: 26, background: 'linear-gradient(140deg,#f0512f,#c9260c)', color: '#fff', boxShadow: '0 16px 44px rgba(201,38,12,0.32)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 }}>Crava Pro</div>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.06, margin: '12px 0 0' }}>{t('Train without limits', 'تدرب بلا حدود')}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.45, margin: '10px 0 0', maxWidth: '28ch', opacity: 0.92 }}>
          {t('Every skill path, every coach video, offline downloads.', 'كل مسارات المهارات، كل فيديوهات المدربين، وتحميل للمشاهدة دون إنترنت.')}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plans.map((p) => {
          const active = state.plan === p.id
          return (
            <button
              key={p.id}
              onClick={() => set({ plan: p.id })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                boxSizing: 'border-box',
                background: '#fff',
                border: 'none',
                borderRadius: 20,
                padding: 18,
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: '#1c1c1e',
                textAlign: 'start',
                boxShadow: active ? `0 0 0 2px ${ACCENT}, 0 10px 28px rgba(228,52,26,0.16)` : '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
              }}
            >
              <span style={radio(active)}>{active && '✓'}</span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'start', flex: 1 }}>
                <span style={{ fontSize: 17, fontWeight: 650 }}>{p.name}</span>
                <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>{p.meta}</span>
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{p.price}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#c22a13' }}>{p.note}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div style={{ background: '#fff', borderRadius: 22, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, ...cardShadow }}>
        {proFeatures.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: 'rgba(228,52,26,0.12)',
                color: '#c22a13',
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconCheck />
            </span>
            <span style={{ fontSize: 15, lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={() => nav({ screen: 'home' })}
          style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 16, padding: 17, fontFamily: 'inherit', fontSize: 17, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 22px rgba(228,52,26,0.28)' }}
        >
          {t('Start 7-day free trial', 'ابدأ ٧ أيام مجاناً')}
        </button>
        <div style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)', textAlign: 'center' }}>
          {t('Cancel anytime · charged after trial', 'إلغاء في أي وقت · يبدأ الخصم بعد التجربة')}
        </div>
      </div>
    </div>
  )
}
