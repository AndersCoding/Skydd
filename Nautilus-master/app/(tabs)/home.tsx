'use client'

import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { auth } from '@/firebaseConfig'
import { getUserByEmail, type User } from '@/services/user-service'
import { type Boat, getBoatsByOwner } from '@/services/boats-service'
import { useLanguage } from '../context/language-context'
import { useTheme } from '../context/theme-context'

import Map from '../pages/map'

export default function Home() {
  const router = useRouter()
  const { t } = useLanguage()
  const { theme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [boats, setBoats] = useState<Boat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    // Fetch users and boats from the firebase database
    const fetchUserAndBoats = async () => {
      try {
        const currentUser = auth.currentUser

        if (currentUser) {
          const userDetails = await getUserByEmail(currentUser.email || '')
          console.log('User Details from DB:', userDetails)

          if (isMounted) {
            setUser(userDetails)
            console.log('Setting user state:', userDetails)
          }

          const userBoats = await getBoatsByOwner(currentUser.uid)
          if (isMounted) {
            setBoats(userBoats)
          }
        } else {
          if (isMounted) {
            setTimeout(() => {
              if (isMounted) {
                router.replace('/')
              }
            }, 0)
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Error fetching user details or boats')
          console.error('Error fetching user details or boats:', err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchUserAndBoats()

    return () => {
      isMounted = false
    }
  }, [router])

  useEffect(() => {
    console.log('Updated user state:', user)
  }, [user])

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.primary }]}
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
        style={[styles.container, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={[styles.errorText, { color: theme.colors.failure }]}>
          {error}
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.startContainer}>
          <Text style={[styles.startText, { color: theme.colors.white }]}>
            {t.readyForTrip}
          </Text>
          <Pressable
            style={[
              styles.startButton,
              { backgroundColor: theme.colors.white },
            ]}
            onPress={() => router.push('/pages/select-boat')}
          >
            <Text
              style={[styles.startButtonText, { color: theme.colors.primary }]}
            >
              {t.start}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
          {t.map}
        </Text>
        <Pressable
          onPress={() => router.push('/pages/map')}
          style={styles.mapPreviewContainer}
        >
          <Map isPreview={true} />
        </Pressable>

        <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
          {t.viewOurCourses}
        </Text>
        <Pressable
          onPress={() => router.push('/(tabs)/education')}
          style={styles.imagePlaceholder}
        >
          <Image
            source={{
              uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sj%C3%B8vett-QN05obm6zvEtrSSa9oIB8ILKzUdC4o.png',
            }}
            style={styles.boatImage}
            resizeMode="cover"
          />
        </Pressable>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Rubik-Bold',
    textAlign: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  startContainer: {
    backgroundColor: '#143D59',
    padding: 20,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 100,
  },
  startText: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 10,
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
  },
  startButtonText: {
    fontSize: 18,
    fontFamily: 'Rubik-Bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    marginTop: 20,
    marginBottom: 10,
  },
  mapPreviewContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  boatImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholder: {
    height: 150,
    width: '100%',
    borderRadius: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  placeholderText: {
    fontFamily: 'Rubik-Regular',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
    marginTop: 10,
    textAlign: 'center',
  },
})
