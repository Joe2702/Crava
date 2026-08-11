import { initializeApp, getApps, getApp } from 'firebase/app'
// Auth is imported from @firebase/auth rather than firebase/auth on purpose.
// The umbrella `firebase` package has no "react-native" export condition, so
// firebase/auth resolves to the browser build, where getReactNativePersistence
// does not exist — sessions would silently fall back to in-memory and every
// cold start would sign the user out. @firebase/auth does carry that condition,
// so Metro picks its React Native build. Import ALL auth APIs from here: mixing
// the two paths would load two copies of the module and the auth instance from
// one would not be recognised by functions from the other.
import { initializeAuth, getAuth, getReactNativePersistence } from '@firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
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

if (!config.apiKey || !config.projectId) {
  throw new Error(
    'Missing Firebase config. Copy mobile/.env.example to mobile/.env and fill it in from the Firebase console.',
  )
}

const isNative = Platform.OS !== 'web'

export const app = getApps().length ? getApp() : initializeApp(config)

export const auth = isNative
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app)

// React Native's networking stack does not support the streaming reads Firestore
// prefers, so it must be told to long-poll or the first query hangs.
export const db = initializeFirestore(app,
  isNative ? { experimentalForceLongPolling: true } : {},
)

export const functions = getFunctions(app, process.env.EXPO_PUBLIC_FIREBASE_REGION || 'europe-west1')
