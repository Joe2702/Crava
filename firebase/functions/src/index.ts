import { initializeApp } from 'firebase-admin/app'
import { setGlobalOptions } from 'firebase-functions/v2'

initializeApp()

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 })

/**
 * The only function that has to exist server-side.
 *
 * Progress is enforced by Firestore rules rather than a function — see
 * firebase/README.md — and account deletion happens from the client. Video is
 * different: signing a playback URL needs a private key, and a key shipped
 * inside an app is not a secret.
 */
export { getPlaybackUrl } from './playback'
