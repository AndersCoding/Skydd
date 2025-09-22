'use client'

import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { getBoatById, updateBoat, type Boat } from '@/services/boats-service'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/theme-context'

export default function EditBoat() {
  const router = useRouter()
  const { boatId } = useLocalSearchParams<{ boatId: string }>()
  const auth = getAuth()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [boatData, setBoatData] = useState<Boat>({
    id: '',
    name: '',
    hp: 0,
    amountOfPeople: 0,
  })

  // Fetch boats when opening page
  useEffect(() => {
    const fetchBoatData = async () => {
      if (!boatId) {
        setError('No boat ID provided')
        setLoading(false)
        return
      }

      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          setError('No authenticated user found')
          setLoading(false)
          return
        }

        const data = await getBoatById(currentUser.uid, boatId)
        setBoatData(data)
      } catch (err) {
        setError('Error fetching boat data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBoatData()
  }, [auth.currentUser, boatId])

  const handleSave = async () => {
    if (!auth.currentUser || !boatId) return

    try {
      setSaving(true)
      await updateBoat(auth.currentUser.uid, boatId, {
        name: boatData.name,
        hp: boatData.hp,
        amountOfPeople: boatData.amountOfPeople,
      })
      Alert.alert('Suksess', 'Båtinformasjonen ble oppdatert', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err) {
      setError('Error updating boat data')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Upadte boat data
  const handleUpdateField = (
    field: keyof Omit<Boat, 'id'>,
    value: string | number
  ) => {
    setBoatData((prev) => ({ ...prev, [field]: value }))
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={theme.colors.white}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
            Rediger båt
          </Text>
        </View>

        <View style={styles.boatSection}>
          <Image
            source={{
              uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sail-boat-xxl-JBuE2rXdlhvLmJpYQikw3V8cG0lh0h.png',
            }}
            style={[styles.boatImage, { backgroundColor: theme.colors.accent }]}
          />
          <TouchableOpacity
            style={[
              styles.changePhotoButton,
              { backgroundColor: theme.colors.white },
            ]}
          >
            <Text
              style={[styles.changePhotoText, { color: theme.colors.primary }]}
            >
              Endre bilde
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.white }]}>
              Båtnavn
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.white,
                  color: theme.colors.primary,
                },
              ]}
              value={boatData.name}
              onChangeText={(value) => handleUpdateField('name', value)}
              placeholder="Båtnavn"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.white }]}>
              Hestekrefter (HK)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.white,
                  color: theme.colors.primary,
                },
              ]}
              value={boatData.hp.toString()}
              onChangeText={(value) =>
                handleUpdateField('hp', Number.parseInt(value) || 0)
              }
              placeholder="HK"
              placeholderTextColor="#666"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.white }]}>
              Antall plasser
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.white,
                  color: theme.colors.primary,
                },
              ]}
              value={boatData.amountOfPeople.toString()}
              onChangeText={(value) =>
                handleUpdateField('amountOfPeople', Number.parseInt(value) || 0)
              }
              placeholder="Antall plasser"
              placeholderTextColor="#666"
              keyboardType="number-pad"
            />
          </View>

          {error && (
            <Text style={[styles.errorText, { color: theme.colors.failure }]}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text
              style={[styles.saveButtonText, { color: theme.colors.white }]}
            >
              {saving ? 'Lagrer...' : 'Lagre endringer'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  boatSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  boatImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
    marginBottom: 16,
    textAlign: 'center',
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
})
