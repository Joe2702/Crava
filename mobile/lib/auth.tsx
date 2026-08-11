import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from '@firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { auth, db, functions } from './firebase'

interface AuthValue {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthCtx = createContext<AuthValue | null>(null)

/**
 * Firebase Auth has no server-side "on user created" hook that can run before
 * the client reads its own document, so the user doc is created here right
 * after sign-up. `merge` keeps this safe to re-run.
 */
async function ensureUserDoc(user: User, displayName?: string) {
  await setDoc(
    doc(db, 'users', user.uid),
    {
      displayName: displayName ?? user.displayName ?? null,
      locale: 'en',
      city: null,
      notifEnabled: true,
      onboardedAt: null,
      createdAt: serverTimestamp(),
      xp: 0,
      streakCount: 0,
      lastSessionDate: null,
      entitlement: null,
    },
    { merge: true },
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (next) => {
      setUser(next)
      setLoading(false)
    })
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      signUp: async (email, password, displayName) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (displayName) await updateProfile(cred.user, { displayName })
        await ensureUserDoc(cred.user, displayName)
      },
      signIn: async (email, password) => {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        // covers accounts created before this doc shape existed
        await ensureUserDoc(cred.user)
      },
      signOut: () => fbSignOut(auth),
      resetPassword: (email) => sendPasswordResetEmail(auth, email),
      deleteAccount: async () => {
        if (!auth.currentUser) throw new Error('Not signed in')
        // Deleting client-side would strand the Firestore data, so the function
        // clears the documents and the auth record together.
        const call = httpsCallable<{ confirm: boolean }, { deleted: boolean }>(functions, 'deleteAccount')
        await call({ confirm: true })
        await fbSignOut(auth)
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
