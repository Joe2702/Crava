import { useApp } from '../context/AppContext'
import { tab } from '../lib/styleHelpers'
import { IconCoaches, IconHome, IconSearch, IconTrain, IconUser } from './Icons'

const TAB_SCREENS = ['home', 'search', 'tree', 'coaches', 'profile']

export function TabBar() {
  const { state, t, goHome, goSearch, goTree, goCoaches, goProfile } = useApp()
  if (!TAB_SCREENS.includes(state.screen)) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 26,
        zIndex: 15,
        display: 'grid',
        gridTemplateColumns: 'repeat(5,1fr)',
        gap: 2,
        padding: '9px 8px',
        borderRadius: 30,
        background: 'rgba(255,255,255,0.62)',
        backdropFilter: 'saturate(200%) blur(28px)',
        WebkitBackdropFilter: 'saturate(200%) blur(28px)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.7) inset, 0 10px 34px rgba(28,28,30,0.16), 0 2px 8px rgba(28,28,30,0.08)',
      }}
    >
      <button onClick={goHome} style={tab(state.screen === 'home')}>
        <IconHome />
        <span>{t('Home', 'الرئيسية')}</span>
      </button>
      <button onClick={goSearch} style={tab(state.screen === 'search')}>
        <IconSearch size={23} />
        <span>{t('Browse', 'تصفح')}</span>
      </button>
      <button onClick={goTree} style={tab(state.screen === 'tree')}>
        <IconTrain />
        <span>{t('Train', 'تدرب')}</span>
      </button>
      <button onClick={goCoaches} style={tab(state.screen === 'coaches')}>
        <IconCoaches />
        <span>{t('Coaches', 'المدربون')}</span>
      </button>
      <button onClick={goProfile} style={tab(state.screen === 'profile')}>
        <IconUser />
        <span>{t('You', 'حسابي')}</span>
      </button>
    </div>
  )
}
