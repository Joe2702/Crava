import { useApp } from '../context/AppContext'
import { SKILLS, ACCENT } from '../data/content'
import { row, radio } from '../lib/styleHelpers'
import { IconCheck } from '../components/Icons'

export function Onboarding() {
  const { state, t, set, goHome, nav } = useApp()

  const steps = [
    {
      kicker: t('Step 1 of 3', 'الخطوة ١ من ٣'),
      title: t('Master the move', 'اتقن الحركة'),
      sub: t('Pick the skill you want first. You can add more later.', 'اختر المهارة التي تريدها أولاً. يمكنك إضافة المزيد لاحقاً.'),
      opts: SKILLS.map((s) => ({ id: s.id, title: t(s.en, s.ar), meta: t(`${s.catEn} · 6 levels`, `${s.catAr} · ٦ مستويات`) })),
    },
    {
      kicker: t('Step 2 of 3', 'الخطوة ٢ من ٣'),
      title: t('Where are you now?', 'أين أنت الآن؟'),
      sub: t('We start you at the right level so nothing is wasted.', 'نبدأ معك من المستوى المناسب حتى لا يضيع وقتك.'),
      opts: [
        { id: 'new', title: t('Never trained', 'لم أتدرب من قبل'), meta: t('Start at level 1', 'ابدأ من المستوى ١') },
        { id: 'some', title: t('I can do pull-ups', 'أستطيع أداء العقلة'), meta: t('Start at level 3', 'ابدأ من المستوى ٣') },
        { id: 'adv', title: t('Advanced', 'متقدم'), meta: t('Skip to the transition work', 'انتقل إلى تمارين الانتقال') },
      ],
    },
    {
      kicker: t('Step 3 of 3', 'الخطوة ٣ من ٣'),
      title: t('How often?', 'كم مرة أسبوعياً؟'),
      sub: t('Your streak and reminders follow this.', 'سلسلة أيامك والتذكيرات تتبع هذا الاختيار.'),
      opts: [
        { id: '2', title: t('2 days a week', 'يومان أسبوعياً'), meta: t('Light', 'خفيف') },
        { id: '4', title: t('4 days a week', '٤ أيام أسبوعياً'), meta: t('Recommended', 'موصى به') },
        { id: '6', title: t('6 days a week', '٦ أيام أسبوعياً'), meta: t('Serious', 'جاد') },
      ],
    },
  ]

  const ob = steps[state.ob]

  const pick = (id: string) => {
    set((s) => {
      const p = { ...s.obPicked, [s.ob]: id }
      return s.ob === 0 ? { obPicked: p, skill: id } : { obPicked: p }
    })
  }

  const obNext = () => {
    if (state.ob < 2) nav({ ob: state.ob + 1 })
    else nav({ screen: 'home' })
  }

  return (
    <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22, minHeight: '100%' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ height: 5, flex: 1, borderRadius: 999, background: i <= state.ob ? ACCENT : 'rgba(118,118,128,0.2)' }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT, letterSpacing: '0.01em' }}>{ob.kicker}</div>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.08, margin: 0 }}>{ob.title}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.45, color: 'rgba(60,60,67,0.6)', margin: 0, maxWidth: '32ch' }}>{ob.sub}</p>
      </div>
      <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.05)' }}>
        {ob.opts.map((o, i) => {
          const active = state.obPicked[state.ob] === o.id
          return (
            <button
              key={o.id}
              onClick={() => pick(o.id)}
              style={row(i === ob.opts.length - 1, active ? { background: 'rgba(228,52,26,0.06)' } : undefined)}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'start', flex: 1 }}>
                <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{o.title}</span>
                <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>{o.meta}</span>
              </span>
              <span style={radio(active)}>{active && <IconCheck size={12} />}</span>
            </button>
          )
        })}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={obNext}
          style={{
            background: ACCENT,
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
          {state.ob < 2 ? t('Continue', 'متابعة') : t('Start training', 'ابدأ التدريب')}
        </button>
        <button
          onClick={goHome}
          style={{ background: 'none', border: 'none', padding: 12, fontFamily: 'inherit', fontSize: 15, color: 'rgba(60,60,67,0.6)', cursor: 'pointer' }}
        >
          {t('Skip for now', 'تخطي الآن')}
        </button>
      </div>
    </div>
  )
}
