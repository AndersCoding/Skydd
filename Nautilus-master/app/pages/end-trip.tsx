'use client'

import { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sendSms } from '@/services/sms-service'
import ContactSelectionOverlay from '../components/contact-selection'
import { useTheme } from '../context/theme-context'
import { useLanguage } from '../context/language-context'

export default function EndTrip() {
  const { theme } = useTheme()
  const { t } = useLanguage()
  const router = useRouter()
  const [showContactOverlay, setShowContactOverlay] = useState(false)
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const STORAGE_KEY = 'emergency_contacts'

  interface Contact {
    id: string
    name: string
    phone: string
    relationship: string
  }

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const storedContacts = await AsyncStorage.getItem(STORAGE_KEY)
        if (storedContacts) {
          setEmergencyContacts(JSON.parse(storedContacts))
        }
      } catch (error) {
        console.error('Error loading contacts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContacts()
  }, [])

  // Logic to send SMS to users contact, but only if they have contacts stored
  const handleSendCompletionMessage = async () => {
    if (emergencyContacts.length === 0) {
      Alert.alert(
        'Ingen kontakter',
        'Du har ingen lagrede kontakter. Legg til kontakter i innstillingene.'
      )
      return
    }

    setShowContactOverlay(true)
  }

  const handleContactSelect = async (contact: Contact) => {
    setShowContactOverlay(false)

    // Send timestamped message to the selected contact
    try {
      const currentTime = new Date()
      const formattedTime = currentTime.toLocaleTimeString('no-NO', {
        hour: '2-digit',
        minute: '2-digit',
      })

      const message = `Tur er fullført, vi er på land. Tidspunkt: ${formattedTime}`
      await sendSms(contact.phone, message)

      Alert.alert('Melding sendt', 'Melding sendt til ' + contact.name, [
        {
          text: 'OK',
          onPress: () => {},
        },
      ])
    } catch (error) {
      console.error('Error sending SMS:', error)
      Alert.alert('Feil', 'Kunne ikke sende SMS')
    }
  }

  // Router to back to homepage
  const handleGoHome = () => {
    router.replace('/(tabs)/home')
  }

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.primary }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.white }]}>
            {'Laster...'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.primary }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
          {'Tur fullført'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="checkmark-circle"
            size={80}
            color={theme.colors.accent}
          />
        </View>

        <Text style={[styles.completionTitle, { color: theme.colors.white }]}>
          {'Turen er fullført!'}
        </Text>

        <Text
          style={[styles.completionSubtitle, { color: theme.colors.accent }]}
        >
          {'Velkommen tilbake på land'}
        </Text>

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: theme.colors.accent }]}
          onPress={handleSendCompletionMessage}
        >
          <Ionicons
            name="send"
            size={20}
            color={theme.colors.primary}
            style={styles.buttonIcon}
          />
          <Text
            style={[styles.sendButtonText, { color: theme.colors.primary }]}
          >
            {'Send melding om fullført tur'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.homeButton,
            { backgroundColor: theme.colors.secondary },
          ]}
          onPress={handleGoHome}
        >
          <Ionicons
            name="home"
            size={20}
            color={theme.colors.white}
            style={styles.buttonIcon}
          />
          <Text style={[styles.homeButtonText, { color: theme.colors.white }]}>
            {'Tilbake til hjem'}
          </Text>
        </TouchableOpacity>
      </View>

      {showContactOverlay && (
        <ContactSelectionOverlay
          visible={showContactOverlay}
          contacts={emergencyContacts}
          onSelect={handleContactSelect}
          onClose={() => setShowContactOverlay(false)}
        />
      )}
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
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 24,
    fontFamily: 'Rubik-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    marginBottom: 40,
    textAlign: 'center',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 25,
    padding: 16,
    marginBottom: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 25,
    padding: 16,
  },
  homeButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
})
