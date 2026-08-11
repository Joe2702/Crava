import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import type { Database } from './database.types'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — copy .env.example to .env')
}

// SecureStore values are capped at 2048 bytes and Supabase sessions can exceed
// that once a JWT carries claims, so the token is split across numbered chunks.
const CHUNK_SIZE = 1800

const secureStorage = {
  async getItem(k: string) {
    const head = await SecureStore.getItemAsync(`${k}.0`)
    if (head === null) return null
    let value = head
    for (let i = 1; ; i++) {
      const next = await SecureStore.getItemAsync(`${k}.${i}`)
      if (next === null) break
      value += next
    }
    return value
  },
  async setItem(k: string, value: string) {
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) ?? ['']
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${k}.${i}`, chunks[i])
    }
    // clear any chunks left behind by a previously longer session
    for (let i = chunks.length; ; i++) {
      const stale = await SecureStore.getItemAsync(`${k}.${i}`)
      if (stale === null) break
      await SecureStore.deleteItemAsync(`${k}.${i}`)
    }
  },
  async removeItem(k: string) {
    for (let i = 0; ; i++) {
      const existing = await SecureStore.getItemAsync(`${k}.${i}`)
      if (existing === null) break
      await SecureStore.deleteItemAsync(`${k}.${i}`)
    }
  },
}

export const supabase = createClient<Database>(url, key, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
