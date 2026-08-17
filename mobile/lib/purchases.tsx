import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db, isDemo } from './firebase'
import { demo } from './demo'
import { useAuth } from './auth'

interface PurchasesValue {
  /** Course ids this account has bought. */
  owned: ReadonlySet<string>
  ready: boolean
}

const PurchasesCtx = createContext<PurchasesValue>({ owned: new Set(), ready: false })

/**
 * Watched live, so a purchase written by a verified store receipt unlocks the
 * course without the app being restarted.
 *
 * Nothing here writes. The rules make purchases read-only to every client,
 * which is what stops someone granting themselves a course — the same reason
 * the all-access entitlement is absent from the user document's writable keys.
 */
export function PurchasesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [owned, setOwned] = useState<ReadonlySet<string>>(new Set())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!user) {
      setOwned(new Set())
      setReady(false)
      return
    }
    if (isDemo) {
      const sync = () => {
        setOwned(new Set(demo.purchases()))
        setReady(true)
      }
      sync()
      return demo.subscribe(sync)
    }
    return onSnapshot(
      collection(db(), 'users', user.uid, 'purchases'),
      (snap) => {
        setOwned(new Set(snap.docs.map((d) => d.id)))
        setReady(true)
      },
      // Failing to read purchases must not wedge the app; it means nothing is
      // owned, which shows the buy button rather than silently unlocking.
      () => setReady(true),
    )
  }, [user])

  const value = useMemo(() => ({ owned, ready }), [owned, ready])
  return <PurchasesCtx.Provider value={value}>{children}</PurchasesCtx.Provider>
}

export function usePurchases() {
  return useContext(PurchasesCtx)
}
