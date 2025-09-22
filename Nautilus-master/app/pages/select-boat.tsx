'use client'

import React from 'react'
import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { Ionicons } from '@expo/vector-icons'
import { getBoatsByOwner, type Boat } from '@/services/boats-service'
import { useTheme } from '../context/theme-context'
import { useLanguage } from '../context/language-context'

// Select which boat to include in the risk assessment
export default function SelectBoatForRisk() {
  const router = useRouter()
  const auth = getAuth()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [boats, setBoats] = useState<Boat[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isGuestUser, setIsGuestUser] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused, fetching boats...')
      fetchBoats()

      const currentUser = auth.currentUser
      if (currentUser && currentUser.email === 'guest@guest.no') {
        setIsGuestUser(true)
      }
      return () => {}
    }, [])
  )

  // Get boats from the database and users stored boats
  const fetchBoats = async () => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        setError('No authenticated user found')
        setLoading(false)
        return
      }
      const userBoats = await getBoatsByOwner(currentUser.uid)
      setBoats(userBoats)
    } catch (err) {
      console.error('Error fetching boats:', err)
      setError('Error fetching boats')
    } finally {
      setLoading(false)
    }
  }

  // Select the boat to use in the risk assessment
  const handleSelectBoat = (boat: Boat) => {
    router.push({
      pathname: '/pages/risk-test',
      params: { boatId: boat.id },
    })
  }

  const handleUpdateBoat = (boat: Boat) => {
    if (isGuestUser) {
    } else {
      router.push({
        pathname: '/pages/edit-boat',
        params: { boatId: boat.id },
      })
    }
  }

  const getBoatIcon = (boatName: string) => {
    if (
      boatName.toLowerCase().includes('sail') ||
      boatName.toLowerCase().includes('seil')
    ) {
      return 'boat'
    } else {
      return 'boat'
    }
  }

  const getBoatType = (boatName: string) => {
    if (
      boatName.toLowerCase().includes('sail') ||
      boatName.toLowerCase().includes('seil')
    ) {
      return t.sailboat || 'Seilbåt'
    } else {
      return t.motorboat || 'Motorbåt'
    }
  }

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.white} />
      </View>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.primary }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
          {t.selectBoat || 'Velg båt'}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.mainHeading, { color: theme.colors.white }]}>
          {t.whichBoatToUse || 'Hvilken båt skal du kjøre?'}
        </Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.failure }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[
                styles.retryButton,
                { backgroundColor: theme.colors.accent },
              ]}
              onPress={fetchBoats}
            >
              <Text
                style={[
                  styles.retryButtonText,
                  { color: theme.colors.primary },
                ]}
              >
                {t.tryAgain || 'Prøv igjen'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : boats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="boat" size={64} color={theme.colors.accent} />
            <Text style={[styles.emptyText, { color: theme.colors.white }]}>
              {t.noBoatsAdded || 'Ingen båter lagt til'}
            </Text>
            <Text style={[styles.emptySubtext, { color: '#9BA5B7' }]}>
              {t.addBoatBeforeRiskAssessment ||
                'Du må legge til en båt før du kan starte en risikovurdering.'}
            </Text>
          </View>
        ) : (
          <View style={styles.boatListContainer}>
            {boats.map((boat) => (
              <TouchableOpacity
                key={boat.id}
                style={[
                  styles.boatCard,
                  { backgroundColor: theme.colors.white },
                ]}
                onPress={() => handleSelectBoat(boat)}
              >
                <View style={styles.boatIconContainer}>
                  <Ionicons size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.boatDetails}>
                  <Text
                    style={[styles.boatName, { color: theme.colors.primary }]}
                  >
                    {boat.name}
                  </Text>
                  <Text style={styles.boatInfo}>
                    {getBoatType(boat.name)} | {boat.hp} {t.hp || 'HK'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => handleUpdateBoat(boat)}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.buttonContainer}>
          {!isGuestUser && (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: theme.colors.white }]}
              onPress={() => router.push('/pages/my-boats')}
            >
              <Text
                style={[styles.addButtonText, { color: theme.colors.white }]}
              >
                {t.addNewBoat || 'Legg til ny båt'}
              </Text>
            </TouchableOpacity>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  mainHeading: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
    textAlign: 'center',
    marginBottom: 24,
  },
  boatListContainer: {
    marginBottom: 20,
  },
  boatCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  boatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  boatDetails: {
    flex: 1,
  },
  boatName: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  boatInfo: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
  },
  menuButton: {
    padding: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
    gap: 12,
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 25,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  nextButton: {
    borderRadius: 25,
    padding: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 24,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0A2A47',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#143D59',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
    marginTop: 4,
  },
})
