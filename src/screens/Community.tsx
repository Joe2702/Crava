import { useApp } from '../context/AppContext'
import { POSTS } from '../data/content'
import { cardShadow } from '../lib/styleHelpers'

export function Community() {
  const { state, t, skillObj, set, goHome } = useApp()

  return (
    <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.035em', margin: 0 }}>{t('Milestones', 'الإنجازات')}</h1>
        <button
          onClick={goHome}
          style={{ background: 'rgba(118,118,128,0.12)', border: 'none', borderRadius: 999, width: 34, height: 34, fontFamily: 'inherit', fontSize: 17, cursor: 'pointer', color: 'rgba(60,60,67,0.6)' }}
        >
          ✕
        </button>
      </div>
      {POSTS.map((p, i) => {
        const liked = !!state.liked[i]
        return (
          <div key={i} style={{ background: '#fff', borderRadius: 24, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, ...cardShadow }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: 999, background: 'linear-gradient(150deg,#dcdce1,#c9c9d1)', flex: '0 0 auto' }} />
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{t(p.en, p.ar)}</span>
                <span style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)' }}>
                  {t(skillObj(p.skill).catEn, skillObj(p.skill).catAr)} · {t(p.whenEn, p.whenAr)}
                </span>
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.4, letterSpacing: '-0.01em' }}>{t(p.textEn, p.textAr)}</div>
            <div style={{ height: 150, borderRadius: 18, background: 'linear-gradient(150deg,#dcdce1,#c9c9d1)', display: 'flex', alignItems: 'flex-end', padding: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(28,28,30,0.5)' }}>{p.slot}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => set((s) => ({ liked: { ...s.liked, [i]: !s.liked[i] } }))}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: 600,
                  background: liked ? 'rgba(228,52,26,0.12)' : 'rgba(118,118,128,0.12)',
                  color: liked ? '#c22a13' : 'rgba(60,60,67,0.7)',
                }}
              >
                {(liked ? '♥ ' : '♡ ') + (p.likes + (liked ? 1 : 0))}
              </button>
              <span style={{ fontSize: 13, fontWeight: 600, background: 'rgba(118,118,128,0.12)', color: 'rgba(60,60,67,0.7)', borderRadius: 999, padding: '8px 14px' }}>
                {t('Milestone', 'إنجاز')}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
