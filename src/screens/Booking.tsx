import { useApp } from '../context/AppContext'
import { ACCENT, SLOTS } from '../data/content'
import { cardShadow, cardShadowSm, radio, row } from '../lib/styleHelpers'
import { IconCheckBig } from '../components/Icons'

export function Booking() {
  const { state, t, egp, coachObj, skillObj, set, goCoaches, goHome } = useApp()
  const coach = coachObj()
  const sessionPrice = state.session === 'form' ? 250 : coach.rate
  const slotSel = SLOTS[state.slot]

  const sessionTypes = [
    { id: 'form' as const, name: t('Form review', 'مراجعة أداء'), meta: t('Send a clip, notes in 48h', 'أرسل مقطعاً واستلم ملاحظات خلال ٤٨ ساعة'), price: egp(250) },
    { id: 'live' as const, name: t('Live 1-on-1', 'جلسة فردية مباشرة'), meta: t('60 minutes, video call', '٦٠ دقيقة، مكالمة فيديو'), price: egp(coach.rate) },
  ]

  const receipt = [
    { k: t('Coach', 'المدرب'), v: t(coach.en, coach.ar) },
    { k: t('Session', 'الجلسة'), v: state.session === 'form' ? t('Form review', 'مراجعة أداء') : t('Live 1-on-1', 'جلسة فردية') },
    { k: t('When', 'الموعد'), v: `${t(slotSel.dayEn, slotSel.dayAr)} ${slotSel.time}` },
    { k: t('Paid', 'المدفوع'), v: egp(sessionPrice) },
  ]

  return (
    <div style={{ padding: '12px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <button
        onClick={goCoaches}
        style={{ alignSelf: 'flex-start', background: 'rgba(118,118,128,0.12)', border: 'none', borderRadius: 999, padding: '9px 16px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#1c1c1e' }}
      >
        {t('‹ Back', 'رجوع ›')}
      </button>

      {state.booked ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 20, animation: 'cravaFade .35s ease both' }}>
          <span
            style={{
              width: 76,
              height: 76,
              borderRadius: 999,
              background: '#34c759',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(52,199,89,0.35)',
            }}
          >
            <IconCheckBig />
          </span>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, margin: 0 }}>{t('You are booked', 'حجزك مؤكد')}</h1>
            <p style={{ fontSize: 15, lineHeight: 1.45, color: 'rgba(60,60,67,0.6)', margin: '8px 0 0' }}>
              {t('A reminder lands an hour before. Cancel free up to 12h ahead.', 'سيصلك تذكير قبل الموعد بساعة. الإلغاء مجاني حتى ١٢ ساعة قبل الجلسة.')}
            </p>
          </div>
          <div style={{ background: '#fff', borderRadius: 22, padding: '6px 18px', ...cardShadow }}>
            {receipt.map((r, i) => (
              <div
                key={r.k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: i === receipt.length - 1 ? undefined : '0.5px solid rgba(60,60,67,0.14)',
                  fontSize: 15,
                }}
              >
                <span style={{ color: 'rgba(60,60,67,0.6)' }}>{r.k}</span>
                <span style={{ fontWeight: 600 }}>{r.v}</span>
              </div>
            ))}
          </div>
          <button
            onClick={goHome}
            style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 16, padding: 17, fontFamily: 'inherit', fontSize: 17, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 22px rgba(228,52,26,0.28)' }}
          >
            {t('Back to home', 'العودة للرئيسية')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#fff', borderRadius: 22, padding: 16, ...cardShadowSm }}>
            <span style={{ width: 64, height: 64, flex: '0 0 auto', borderRadius: 999, background: 'linear-gradient(150deg,#dcdce1,#c9c9d1)' }} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em' }}>{t(coach.en, coach.ar)}</span>
              <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>
                {t(skillObj(coach.skill).catEn, skillObj(coach.skill).catAr)} · {t(coach.cityEn, coach.cityAr)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{egp(coach.rate)}{t(' per hour', ' للساعة')}</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(60,60,67,0.6)' }}>{t('Session type', 'نوع الجلسة')}</div>
            <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', ...cardShadow }}>
              {sessionTypes.map((s, i) => {
                const active = state.session === s.id
                return (
                  <button key={s.id} onClick={() => set({ session: s.id })} style={row(i === sessionTypes.length - 1, active ? { background: 'rgba(228,52,26,0.06)' } : undefined)}>
                    <span style={radio(active)}>{active && '✓'}</span>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'start', flex: 1 }}>
                      <span style={{ fontSize: 16, fontWeight: 600 }}>{s.name}</span>
                      <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>{s.meta}</span>
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 650 }}>{s.price}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(60,60,67,0.6)' }}>{t('Pick a slot', 'اختر الموعد')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {SLOTS.map((s, i) => {
                const active = state.slot === i
                return (
                  <button
                    key={i}
                    onClick={() => set({ slot: i })}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      alignItems: 'flex-start',
                      padding: '12px 14px',
                      border: 'none',
                      borderRadius: 16,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      background: active ? ACCENT : '#fff',
                      color: active ? '#fff' : '#1c1c1e',
                      boxShadow: active ? '0 8px 20px rgba(228,52,26,0.26)' : '0 1px 2px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)',
                    }}
                  >
                    <span style={{ fontSize: 12, opacity: 0.72 }}>{t(s.dayEn, s.dayAr)}</span>
                    <span style={{ fontSize: 16, fontWeight: 650 }}>{s.time}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 22, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, ...cardShadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 15, color: 'rgba(60,60,67,0.6)' }}>{t('Total', 'الإجمالي')}</span>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>{egp(sessionPrice)}</span>
            </div>
            <button
              onClick={() => set({ booked: true })}
              style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 16, padding: 17, fontFamily: 'inherit', fontSize: 17, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 22px rgba(228,52,26,0.28)' }}
            >
              {t('Confirm and pay', 'أكد وادفع')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
