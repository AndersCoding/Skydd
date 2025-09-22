// firebaseConfig.ts
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

// The projects Firebase configuration
// This is available from the Firebase console, to admins
const firebaseConfig = {
  apiKey: 'AIzaSyBJJpgv4HB7n6dpyrsc6n6HLoDMTvY81lM',
  authDomain: 'nautilusrisikovurdering.firebaseapp.com',
  databaseURL:
    'https://nautilusrisikovurdering-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'nautilusrisikovurdering',
  storageBucket: 'nautilusrisikovurdering.appspot.com',
  messagingSenderId: '604153962507',
  appId: '1:604153962507:web:931b8772b9df9c6e11270e',
  measurementId: 'G-L4MS0EZYL5',
}

const app = initializeApp(firebaseConfig)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})

export { app, auth }