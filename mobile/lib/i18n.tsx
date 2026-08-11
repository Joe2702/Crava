import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

export type Locale = 'en' | 'ar'

const STORAGE_KEY = 'crava.locale'

function deviceLocale(): Locale {
  return getLocales()[0]?.languageCode === 'ar' ? 'ar' : 'en'
}

interface LocaleValue {
  locale: Locale
  isRTL: boolean
  /** Picks the Arabic or English variant of a pair. */
  t: (en: string, ar: string) => string
  /** Reads the matching `_en` / `_ar` column off a database row. */
  field: (row: object, base: string) => string
  setLocale: (next: Locale) => void
  ready: boolean
}

const LocaleCtx = createContext<LocaleValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return
        setLocaleState(stored === 'ar' || stored === 'en' ? stored : deviceLocale())
      })
      .catch(() => {
        if (!cancelled) setLocaleState(deviceLocale())
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    void AsyncStorage.setItem(STORAGE_KEY, next)
    // best-effort sync so the choice follows the account to another device;
    // failure here must not block the UI from switching language
    const uid = auth.currentUser?.uid
    if (uid) void updateDoc(doc(db, 'users', uid), { locale: next }).catch(() => {})
  }, [])

  const value = useMemo<LocaleValue>(() => {
    const isRTL = locale === 'ar'
    return {
      locale,
      isRTL,
      ready,
      setLocale,
      t: (en, ar) => (isRTL ? ar : en),
      field: (row, base) => {
        const r = row as Record<string, unknown>
        return String(r[`${base}_${locale}`] ?? r[`${base}_en`] ?? '')
      },
    }
  }, [locale, ready, setLocale])

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleCtx)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

/**
 * Arabic-Indic digits. Used for counts and numerals in Arabic copy so the UI
 * doesn't mix Western digits into otherwise Arabic sentences.
 */
const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function localizeNumber(n: number, locale: Locale): string {
  const s = String(n)
  return locale === 'ar' ? s.replace(/\d/g, (d) => AR_DIGITS[Number(d)]) : s
}
