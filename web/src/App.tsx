import { AppProvider, useApp } from './context/AppContext'
import { Header } from './components/Header'
import { TabBar } from './components/TabBar'
import { LevelUpSheet } from './components/LevelUpSheet'
import { Onboarding } from './screens/Onboarding'
import { Home } from './screens/Home'
import { Tree } from './screens/Tree'
import { Lesson } from './screens/Lesson'
import { Search } from './screens/Search'
import { Coaches } from './screens/Coaches'
import { Booking } from './screens/Booking'
import { Paywall } from './screens/Paywall'
import { Community } from './screens/Community'
import { Profile } from './screens/Profile'

const TAB_SCREENS = ['home', 'search', 'tree', 'coaches', 'profile']

function CurrentScreen() {
  const { state } = useApp()
  switch (state.screen) {
    case 'onboarding':
      return <Onboarding />
    case 'home':
      return <Home />
    case 'tree':
      return <Tree />
    case 'lesson':
      return <Lesson />
    case 'search':
      return <Search />
    case 'coaches':
      return <Coaches />
    case 'booking':
      return <Booking />
    case 'paywall':
      return <Paywall />
    case 'community':
      return <Community />
    case 'profile':
      return <Profile />
    default:
      return null
  }
}

function Shell() {
  const { state } = useApp()
  const dir = state.lang === 'ar' ? 'rtl' : 'ltr'
  const showTabs = TAB_SCREENS.includes(state.screen)

  return (
    <div className="app-page">
      <div
        className="app-shell"
        dir={dir}
        style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: '#f2f2f7' }}
      >
        <Header />
        <div style={{ flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden', position: 'relative', WebkitOverflowScrolling: 'touch' }}>
          <div
            key={state.screen}
            style={{ minHeight: '100%', animation: `${state.tick % 2 ? 'cravaInB' : 'cravaInA'} .34s cubic-bezier(.22,.9,.28,1) both` }}
          >
            <CurrentScreen />
            {showTabs && <div style={{ height: 104 }} />}
          </div>
          <LevelUpSheet />
        </div>
        <TabBar />
      </div>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}

export default App
