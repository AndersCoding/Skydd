'use client'

import { Slot, Stack, useRouter } from 'expo-router'
import { app } from '../firebaseConfig'
import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { StyleSheet, View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { LanguageProvider } from './context/language-context'
import { ThemeProvider } from './context/theme-context'

SplashScreen.preventAutoHideAsync()

// Main routing for the app
export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Loads is user is logged in / autorized
  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Slot />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LanguageProvider>
        <ThemeProvider>
          {user ? (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="pages/terms"
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen name="courses" />
            </Stack>
          ) : (
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
          )}
        </ThemeProvider>
      </LanguageProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B2C41',
  },
})
