/**
 * @firebase/auth ships getReactNativePersistence only in its React Native
 * build (dist/rn/index.rn.d.ts). Its package exports map lists a generic
 * "types" entry ahead of the "react-native" branch, so TypeScript always
 * resolves the browser typings and never sees that export — even with
 * customConditions set. Metro does resolve the RN build at runtime, so the
 * function is really there; this augmentation just tells TypeScript so.
 *
 * The top-level import is what makes this file a module, so `declare module`
 * augments the real types instead of replacing them.
 *
 * Delete this once Firebase exposes the export from the default typings.
 */
import type { Persistence } from '@firebase/auth'

declare module '@firebase/auth' {
  export interface ReactNativeAsyncStorage {
    setItem(key: string, value: string): Promise<void>
    getItem(key: string): Promise<string | null>
    removeItem(key: string): Promise<void>
  }

  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence
}
