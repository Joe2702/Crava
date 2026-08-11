import { useApp } from '../context/AppContext'

export function LevelUpSheet() {
  const { state, t, skillObj, closeLevelUp } = useApp()
  if (state.levelUp === null) return null

  const sk = skillObj()
  const nextLevel = sk.levels[Math.min(5, state.level)] || sk.levels[5]

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        background: 'rgba(28,28,30,0.4)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-end',
        animation: 'cravaFade .22s ease both',
      }}
    >
      <div
        style={{
          width: '100%',
          background: '#f2f2f7',
          borderRadius: '30px 30px 0 0',
          padding: '12px 20px 26px',
          animation: 'cravaSheet .34s cubic-bezier(.22,.9,.28,1) both',
        }}
      >
        <div style={{ width: 40, height: 5, borderRadius: 999, background: 'rgba(60,60,67,0.2)', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          <span
            style={{
              width: 66,
              height: 66,
              borderRadius: 999,
              background: 'linear-gradient(140deg,#f0512f,#c9260c)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 10px 26px rgba(201,38,12,0.3)',
            }}
          >
            ★
          </span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c22a13' }}>{t('Level cleared', 'تم إنهاء المستوى')}</div>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, margin: '4px 0 0' }}>
              {t(`Level ${state.level} done`, `المستوى ${state.level} تم`)}
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.45, color: 'rgba(60,60,67,0.6)', margin: '8px 0 0' }}>
              {t(`Next up: ${nextLevel[0]}. It is unlocked now.`, `التالي: ${nextLevel[1]}. تم فتحه الآن.`)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>+120</div>
              <div style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)', marginTop: 2 }}>XP</div>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{state.streak}</div>
              <div style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)', marginTop: 2 }}>{t('day streak', 'يوم متتالي')}</div>
            </div>
          </div>
          <button
            onClick={closeLevelUp}
            style={{
              width: '100%',
              background: '#e4341a',
              color: '#fff',
              border: 'none',
              borderRadius: 16,
              padding: 17,
              fontFamily: 'inherit',
              fontSize: 17,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 22px rgba(228,52,26,0.28)',
            }}
          >
            {t('Continue', 'متابعة')}
          </button>
        </div>
      </div>
    </div>
  )
}
