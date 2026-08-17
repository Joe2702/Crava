import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from '@firebase/auth'
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, isDemo } from './firebase'
import { demo } from './demo'

/** Enough of a user for the app; in demo mode this is a stand-in, not a real one. */
export interface SessionUser {
  uid: string
  email: string | null
  displayName: string | null
}

interface AuthValue {
  user: SessionUser | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthCtx = createContext<AuthValue | null>(null)

const DEMO_UID = 'demo-user'

/**
 * Firebase Auth has no server-side "on user created" hook that can run before
 * the client reads its own document, so the user doc is created here right
 * after sign-up. `merge` keeps this safe to re-run.
 */
async function ensureUserDoc(user: User, displayName?: string) {
  await setDoc(
    doc(db(), 'users', user.uid),
    {
      displayName: displayName ?? user.displayName ?? null,
      locale: 'en',
      city: null,
      notifEnabled: true,
      onboardedAt: null,
      weeklyGoal: null,
      createdAt: serverTimestamp(),
      entitlement: null,
    },
    { merge: true },
  )
}

/**
 * Deleting a document does not delete its subcollections, so progress would
 * outlive the account without this.
 */
async function deleteOwnData(uid: string) {
  for (const sub of ['drillCompletions', 'levelCompletions', 'enrollments']) {
    const snap = await getDocs(collection(db(), 'users', uid, sub))
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  }
  await deleteDoc(doc(db(), 'users', uid))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo) {
      const sync = () =>
        setUser(demo.isSignedIn ? { uid: DEMO_UID, email: null, displayName: demo.user.displayName } : null)
      sync()
      setLoading(false)
      return demo.subscribe(sync)
    }
    return onAuthStateChanged(auth(), (next) => {
      setUser(next ? { uid: next.uid, email: next.email, displayName: next.displayName } : null)
      setLoading(false)
    })
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      signUp: async (email, password, displayName) => {
        if (isDemo) return void demo.signIn(displayName || 'Yassin')
        const cred = await createUserWithEmailAndPassword(auth(), email, password)
        if (displayName) await updateProfile(cred.user, { displayName })
        await ensureUserDoc(cred.user, displayName)
      },
      signIn: async (email, password) => {
        if (isDemo) return void demo.signIn()
        const cred = await signInWithEmailAndPassword(auth(), email, password)
        // covers accounts created before this doc shape existed
        await ensureUserDoc(cred.user)
      },
      signOut: async () => {
        if (isDemo) return void demo.signOut()
        await fbSignOut(auth())
      },
      resetPassword: async (email) => {
        if (isDemo) return
        await sendPasswordResetEmail(auth(), email)
      },
      deleteAccount: async () => {
        if (isDemo) return void demo.reset()
        const current = auth().currentUser
        if (!current) throw new Error('Not signed in')
        // Firestore first: once the auth record is gone the rules no longer
        // recognise the owner, and the documents could not be removed.
        await deleteOwnData(current.uid)
        await deleteUser(current)
      },
    }),
    [user, loading],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
