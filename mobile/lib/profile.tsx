import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, isDemo } from './firebase'
import { demo } from './demo'
import { useAuth } from './auth'
import type { UserDoc } from './types'

interface ProfileValue {
  profile: UserDoc | null
  /** False until the document has been read at least once. */
  ready: boolean
}

const ProfileCtx = createContext<ProfileValue>({ profile: null, ready: false })

/**
 * The signed-in user's profile document, watched live so an entitlement written
 * by a store webhook takes effect without a restart, and so onboarding stops
 * being offered the moment it is finished.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserDoc | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setReady(false)
      return
    }

    if (isDemo) {
      const sync = () => {
        setProfile(demo.user)
        setReady(true)
      }
      sync()
      return demo.subscribe(sync)
    }

    return onSnapshot(
      doc(db(), 'users', user.uid),
      (snap) => {
        setProfile(snap.exists() ? (snap.data() as UserDoc) : null)
        setReady(true)
      },
      // A read failure must not wedge the app on a spinner; the screens below
      // handle a null profile.
      () => setReady(true),
    )
  }, [user])

  const value = useMemo(() => ({ profile, ready }), [profile, ready])
  return <ProfileCtx.Provider value={value}>{children}</ProfileCtx.Provider>
}

export function useProfile() {
  return useContext(ProfileCtx)
}
