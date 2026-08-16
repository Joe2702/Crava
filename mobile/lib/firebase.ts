import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
// Auth is imported from @firebase/auth rather than firebase/auth on purpose.
// The umbrella `firebase` package has no "react-native" export condition, so
// firebase/auth resolves to the browser build, where getReactNativePersistence
// does not exist — sessions would silently fall back to in-memory and every
// cold start would sign the user out. @firebase/auth does carry that condition,
// so Metro picks its React Native build. Import ALL auth APIs from here: mixing
// the two paths would load two copies of the module and the auth instance from
// one would not be recognised by functions from the other.
import { initializeAuth, getAuth, getReactNativePersistence, type Auth } from '@firebase/auth'
import { initializeFirestore, type Firestore } from 'firebase/firestore'
import { getFunctions, type Functions } from 'firebase/functions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

/**
 * With no Firebase config the app runs against an in-memory store instead of
 * failing to start, so it can be opened and demonstrated before any backend
 * exists. Fill mobile/.env to switch to the real backend.
 */
export const isDemo = !config.apiKey || !config.projectId

const isNative = Platform.OS !== 'web'

let _app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null
let _functions: Functions | null = null

if (!isDemo) {
  _app = getApps().length ? getApp() : initializeApp(config)
  _auth = isNative
    ? initializeAuth(_app, { persistence: getReactNativePersistence(AsyncStorage) })
    : getAuth(_app)
  // React Native's networking stack does not support the streaming reads
  // Firestore prefers, so it must be told to long-poll or the first query hangs.
  _db = initializeFirestore(_app, isNative ? { experimentalForceLongPolling: true } : {})
  _functions = getFunctions(_app, process.env.EXPO_PUBLIC_FIREBASE_REGION || 'europe-west1')
}

function required<T>(value: T | null, name: string): T {
  if (!value) throw new Error(`${name} is unavailable in demo mode — check isDemo before using it.`)
  return value
}

export const auth = () => required(_auth, 'auth')
export const db = () => required(_db, 'db')
export const functions = () => required(_functions, 'functions')
