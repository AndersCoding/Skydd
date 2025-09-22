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
import { useRouter } from 'expo-router'
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import {
  getUserByUid,
  updateUser,
  type User,
  deleteUserData,
} from '@/services/user-service'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/theme-context'
import DeleteAccountModal from '../components/delete-account'
import { deleteUserDirectly } from '@/services/database-service'

// Page for displaying the users personal information
export default function PersonalInfo() {
  const router = useRouter()
  const auth = getAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [userData, setUserData] = useState<User>({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    hasBoatingLicence: false,
  })
  const { theme } = useTheme()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          const data = await getUserByUid(currentUser.uid)
          setUserData(data)
        }
      } catch (err) {
        setError('Error fetching user data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [auth.currentUser])

  // Update user data when the user changes it
  const handleSave = async () => {
    if (!auth.currentUser) return

    try {
      setSaving(true)
      await updateUser(auth.currentUser.uid, userData)
      router.back()
    } catch (err) {
      setError('Error updating user data')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Update user data when the user changes it
  const handleUpdateField = (field: keyof User, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }))
  }

  // Function for deleting the users account
  const handleDeleteAccount = async (password: string) => {
    try {
      const user = auth.currentUser
      if (!user || !user.email) {
        throw new Error('Ingen bruker er logget inn')
      }

      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)

      const userId = user.uid
      console.log('Starting account deletion for user:', userId)

      try {
        console.log('Deleting user data...')
        try {
          await deleteUserData(userId)
          console.log('User data deleted successfully via deleteUserData')
        } catch (dataError) {
          console.error(
            'Error with deleteUserData, trying direct deletion:',
            dataError
          )

          await deleteUserDirectly(userId)
          console.log('User data deleted successfully via direct deletion')
        }

        console.log('Deleting auth user...')
        await user.delete()
        console.log('Auth user deleted successfully')

        Alert.alert('Konto slettet', 'Din konto har blitt slettet permanent.', [
          { text: 'OK', onPress: () => router.replace('/') },
        ])
      } catch (deleteError) {
        console.error('Error during deletion process:', deleteError)
        throw new Error(
          `Kunne ikke slette konto: ${deleteError instanceof Error ? deleteError.message : 'Ukjent feil'}`
        )
      }
    } catch (error) {
      console.error('Delete account error:', error)

      if (error instanceof Error) {
        if (error.message.includes('auth/wrong-password')) {
          throw new Error('Feil passord. Vennligst prøv igjen.')
        } else if (error.message.includes('auth/too-many-requests')) {
          throw new Error('For mange forsøk. Vennligst prøv igjen senere.')
        } else if (error.message.includes('auth/requires-recent-login')) {
          throw new Error(
            'Sesjonen har utløpt. Vennligst logg ut og inn igjen før du sletter kontoen.'
          )
        } else {
          throw new Error(`Kunne ikke slette konto: ${error.message}`)
        }
      } else {
        throw new Error('En ukjent feil oppstod')
      }
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
            Personlig informasjon
          </Text>
        </View>

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
              Fornavn
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.white,
                  color: theme.colors.primary,
                },
              ]}
              value={userData.firstName}
              onChangeText={(value) => handleUpdateField('firstName', value)}
              placeholder="Fornavn"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.white }]}>
              Etternavn
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.white,
                  color: theme.colors.primary,
                },
              ]}
              value={userData.lastName}
              onChangeText={(value) => handleUpdateField('lastName', value)}
              placeholder="Etternavn"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.white }]}>
              Epost
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.white,
                  color: theme.colors.primary,
                },
              ]}
              value={userData.email}
              onChangeText={(value) => handleUpdateField('email', value)}
              placeholder="Epost"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.white }]}>
              Fødselsdato
            </Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.white,
                    color: theme.colors.primary,
                  },
                ]}
                value={userData.birthDate}
                onChangeText={(value) => handleUpdateField('birthDate', value)}
                placeholder="DD.MM.YYYY"
                placeholderTextColor="#666"
              />
              <Ionicons
                name="chevron-down"
                size={24}
                color="#666"
                style={styles.dateIcon}
              />
            </View>
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

          <TouchableOpacity
            style={[
              styles.deleteAccountButton,
              { backgroundColor: theme.colors.failure },
            ]}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text
              style={[
                styles.deleteAccountButtonText,
                { color: theme.colors.white },
              ]}
            >
              Slett konto
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteAccount}
        theme={theme}
      />
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
  dateInputContainer: {
    position: 'relative',
  },
  dateIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
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
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  deleteAccountButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteAccountButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
})
