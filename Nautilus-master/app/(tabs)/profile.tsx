'use client'

import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { getAuth, signOut } from 'firebase/auth'
import { getUserByUid, type User } from '@/services/user-service'
import { app } from '@/firebaseConfig'
import { Ionicons } from '@expo/vector-icons'
import { useLanguage } from '../context/language-context'
import { useTheme } from '../context/theme-context'

// Page for the users profile
export default function Profile() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const auth = getAuth(app)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()
  const { theme } = useTheme()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          const userData = await getUserByUid(currentUser.uid)
          setUser(userData)
        } else if (params.isGuest === 'true') {
          setUser({
            email: 'guest@example.com',
            firstName: 'Guest',
            lastName: 'User',
            birthDate: '',
            hasBoatingLicence: false,
          })
        } else {
          setError('No authenticated user found')
        }
      } catch (err) {
        setError('Error fetching user data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [auth.currentUser, params.isGuest])

  // Method for logging out, and redirecting to the home page
  const handleLogout = async () => {
    try {
      if (user?.email !== 'guest@example.com') {
        await signOut(auth)
      }
      router.replace('/')
    } catch (error) {
      console.error('Error signing out: ', error)
      setError('Failed to log out. Please try again.')
    }
  }

  // Navigation for users
  // Guest users will have limited functionality
  const navigateTo = (route: string) => {
    if (
      user?.email === 'guest@guest.no' &&
      (route === '../pages/my-boats' || route === '../pages/personal-info')
    ) {
      Alert.alert(
        'Begrenset funksjonalitet',
        'Du kan ikke bruke denne funksjonen som gjest, vennligst registrer en konto for å endre dette.',
        [{ text: 'OK' }]
      )
      return
    }

    router.push(route as any)
  }

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Text style={[styles.loadingText, { color: theme.colors.white }]}>
          {t.loading}
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Text style={[styles.errorText, { color: theme.colors.failure }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.accent }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
            {t.goBack}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.primary }]}
    >
      <View style={styles.profileSection}>
        <Image
          source={{
            uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sail-boat-xxl-JBuE2rXdlhvLmJpYQikw3V8cG0lh0h.png',
          }}
          style={[
            styles.profileImage,
            { backgroundColor: theme.colors.accent },
          ]}
        />
        <Text style={[styles.profileName, { color: theme.colors.white }]}>
          {user ? `${user.firstName} ${user.lastName}` : 'Per Ivar Nordmann'}
        </Text>
      </View>

      <View style={styles.menuGrid}>
        <View style={styles.menuRow}>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: theme.colors.white }]}
            onPress={() => navigateTo('../pages/personal-info')}
          >
            <Ionicons
              name="person"
              size={28}
              color={theme.colors.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.colors.primary }]}>
              {t.personalInfo}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: theme.colors.white }]}
            onPress={() => navigateTo('../pages/settings')}
          >
            <Ionicons
              name="settings"
              size={28}
              color={theme.colors.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.colors.primary }]}>
              {t.settings}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuRow}>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: theme.colors.white }]}
            onPress={() => navigateTo('../pages/my-boats')}
          >
            <Ionicons
              name="boat"
              size={28}
              color={theme.colors.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.colors.primary }]}>
              {t.myBoats}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: theme.colors.white }]}
            onPress={() => navigateTo('../pages/emergency-contacts')}
          >
            <Ionicons
              name="call"
              size={28}
              color={theme.colors.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.colors.primary }]}>
              {t.contacts}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuRow}>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: theme.colors.white }]}
            onPress={() => navigateTo('../pages/previous-trips')}
          >
            <Ionicons
              name="time"
              size={28}
              color={theme.colors.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.colors.primary }]}>
              {t.previousTrips}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuButton,
              styles.logoutButton,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out"
              size={28}
              color={theme.colors.white}
              style={styles.menuIcon}
            />
            <Text style={[styles.logoutText, { color: theme.colors.white }]}>
              {t.logout}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Rubik-Regular',
  },
  button: {
    padding: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#9BA5B7',
    fontSize: 18,
    fontFamily: 'Rubik-Regular',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
  menuGrid: {
    paddingHorizontal: 20,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  menuButton: {
    borderRadius: 10,
    width: '48%',
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  emptyButton: {
    width: '48%',
    height: 110,
  },
  menuIcon: {
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
    textAlign: 'center',
  },
  logoutButton: {},
  logoutText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
    textAlign: 'center',
  },
})
