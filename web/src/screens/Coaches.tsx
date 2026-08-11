import { useApp } from '../context/AppContext'
import { COACHES } from '../data/content'
import { cardShadowSm } from '../lib/styleHelpers'
import { IconChevronRight } from '../components/Icons'

export function Coaches() {
  const { t, skillObj, nav } = useApp()

  return (
    <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(60,60,67,0.6)' }}>{t('Marketplace', 'السوق')}</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, margin: '2px 0 6px' }}>
          {t('Verified coaches', 'مدربون معتمدون')}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(60,60,67,0.6)', margin: 0, lineHeight: 1.4 }}>
          {t('Local athletes. Form reviews and live 1-on-1 sessions.', 'رياضيون محليون. مراجعة أداء وجلسات فردية مباشرة.')}
        </p>
      </div>
      {COACHES.map((c) => (
        <button
          key={c.id}
          onClick={() => nav({ coach: c.id, screen: 'booking', booked: false })}
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
            background: '#fff',
            border: 'none',
            borderRadius: 22,
            padding: 16,
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: 'inherit',
            textAlign: 'start',
            ...cardShadowSm,
          }}
        >
          <span style={{ width: 64, height: 64, flex: '0 0 auto', borderRadius: 999, background: 'linear-gradient(150deg,#dcdce1,#c9c9d1)' }} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'start', flex: 1 }}>
            <span style={{ fontSize: 17, fontWeight: 650, letterSpacing: '-0.02em' }}>{t(c.en, c.ar)}</span>
            <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>
              {t(skillObj(c.skill).catEn, skillObj(c.skill).catAr)} · {t(c.cityEn, c.cityAr)}
            </span>
            <span style={{ display: 'flex', gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600, background: 'rgba(118,118,128,0.12)', borderRadius: 999, padding: '3px 9px' }}>★ {c.rating}</span>
              <span style={{ fontSize: 12, fontWeight: 600, background: 'rgba(228,52,26,0.1)', color: '#c22a13', borderRadius: 999, padding: '3px 9px' }}>
                {t('Verified', 'معتمد')}
              </span>
            </span>
            <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)', marginTop: 4 }}>{t('From EGP 250 per session', 'من ٢٥٠ ج.م للجلسة')}</span>
          </span>
          <span style={{ flex: '0 0 auto' }}>
            <IconChevronRight />
          </span>
        </button>
      ))}
    </div>
  )
}
