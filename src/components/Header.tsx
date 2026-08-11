import type { CSSProperties } from 'react'
import { useApp } from '../context/AppContext'
import { ACCENT } from '../data/content'
import { IconBell } from './Icons'

export function Header() {
  const { lang, setEN, setAR, goCommunity } = useApp()

  const btnBase: CSSProperties = {
    border: 'none',
    borderRadius: 999,
    padding: '6px 13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 600,
  }

  return (
    <div
      style={{
        flex: '0 0 auto',
        padding: '20px 20px 10px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12,
        background: 'rgba(242,242,247,0.82)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '0.5px solid rgba(60,60,67,0.16)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>Crava</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={goCommunity}
          aria-label="Community"
          style={{
            position: 'relative',
            border: 'none',
            background: 'rgba(118,118,128,0.12)',
            borderRadius: 999,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1c1c1e',
          }}
        >
          <IconBell />
          <span
            style={{
              position: 'absolute',
              top: 5,
              insetInlineEnd: 6,
              width: 8,
              height: 8,
              borderRadius: 999,
              background: ACCENT,
              boxShadow: '0 0 0 2px rgba(242,242,247,0.95)',
            }}
          />
        </button>
        <span style={{ display: 'flex', background: 'rgba(118,118,128,0.12)', borderRadius: 999, padding: 2 }}>
          <button
            onClick={setEN}
            style={{
              ...btnBase,
              background: lang === 'en' ? '#fff' : 'transparent',
              color: lang === 'en' ? '#1c1c1e' : 'rgba(60,60,67,0.6)',
              boxShadow: lang === 'en' ? '0 1px 3px rgba(0,0,0,0.14)' : undefined,
            }}
          >
            EN
          </button>
          <button
            onClick={setAR}
            style={{
              ...btnBase,
              background: lang === 'ar' ? '#fff' : 'transparent',
              color: lang === 'ar' ? '#1c1c1e' : 'rgba(60,60,67,0.6)',
              boxShadow: lang === 'ar' ? '0 1px 3px rgba(0,0,0,0.14)' : undefined,
            }}
          >
            عربي
          </button>
        </span>
      </span>
    </div>
  )
}
