import type { CSSProperties } from 'react'
import { ACCENT, SEP } from '../data/content'

export function row(last: boolean, extra?: CSSProperties): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    boxSizing: 'border-box',
    padding: '16px 18px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: '#1c1c1e',
    textAlign: 'start',
    borderBottom: last ? undefined : SEP,
    ...extra,
  }
}

export function radio(on: boolean): CSSProperties {
  return {
    width: 24,
    height: 24,
    flex: '0 0 auto',
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
    background: on ? ACCENT : 'rgba(118,118,128,0.14)',
    boxShadow: on ? undefined : 'inset 0 0 0 1.5px rgba(60,60,67,0.18)',
  }
}

export function tab(on: boolean): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '7px 2px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: on ? ACCENT : 'rgba(60,60,67,0.5)',
  }
}

export function chip(active: boolean): CSSProperties {
  return {
    flex: '0 0 auto',
    border: 'none',
    borderRadius: 999,
    padding: '9px 16px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    background: active ? ACCENT : 'rgba(118,118,128,0.12)',
    color: active ? '#fff' : '#1c1c1e',
    boxShadow: active ? '0 6px 16px rgba(228,52,26,0.26)' : undefined,
  }
}

export const cardShadow: CSSProperties = {
  boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.05)',
}

export const cardShadowSm: CSSProperties = {
  boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
}
