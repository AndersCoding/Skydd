'use client'

import { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native'
import { createUser, type User } from '../../services/user-service'
import { theme } from '@/assets/css/theme'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

interface RegisterFormProps {
  onRegisterSuccess: (user: User) => void
}

// Register new user form
export default function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [hasBoatingLicence, setHasBoatingLicence] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const { user } = await createUser(email, password, {
        firstName,
        lastName,
        birthDate,
        hasBoatingLicence,
      })

      onRegisterSuccess(user)

      router.push('/pages/terms' as any)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Set date for date of birth. Now works with Android and iOS
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }

    if (selectedDate) {
      setDate(selectedDate)

      const day = selectedDate.getDate().toString().padStart(2, '0')
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0')
      const year = selectedDate.getFullYear()

      const formattedDate = `${day}.${month}.${year}`
      setBirthDate(formattedDate)
    }
  }

  // Picker for date of birth
  const showDatepicker = () => {
    setShowDatePicker(true)
  }

  // Set maximum date to today
  const getMaxDate = () => {
    return new Date()
  }

  // Set minimum date to 100 years ago
  const getMinDate = () => {
    const today = new Date()
    return new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate()
    )
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Epost"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Passord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Fornavn"
        value={firstName}
        onChangeText={setFirstName}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Etternavn"
        placeholderTextColor="#888"
        value={lastName}
        onChangeText={setLastName}
      />

      <TouchableOpacity
        style={[styles.input, styles.dateInput]}
        onPress={showDatepicker}
      >
        <Text style={birthDate ? styles.dateText : styles.placeholderText}>
          {birthDate || 'Fødselsdag'}
        </Text>
        <Ionicons name="calendar" size={20} color={theme.colors.secondary} />
      </TouchableOpacity>

      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDatePicker}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Avbryt</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Velg dato</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.modalButton}
                >
                  <Text style={[styles.modalButtonText, styles.doneButton]}>
                    Ferdig
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                maximumDate={getMaxDate()}
                minimumDate={getMinDate()}
                style={styles.datePicker}
                textColor={theme.colors.white}
              />
            </View>
          </SafeAreaView>
        </Modal>
      )}

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={getMaxDate()}
          minimumDate={getMinDate()}
        />
      )}

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Har du båtførerbevis?</Text>
        <Switch
          value={hasBoatingLicence}
          onValueChange={setHasBoatingLicence}
          trackColor={{ false: '#767577', true: theme.colors.secondary }}
          thumbColor={hasBoatingLicence ? theme.colors.accent : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Registering...' : 'Registrer'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    top: 50,
  },
  input: {
    height: 48,
    borderColor: theme.colors.accent,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    color: 'black',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  dateText: {
    color: 'black',
    fontSize: 14,
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    color: theme.colors.white,
    fontSize: 14,
  },
  button: {
    backgroundColor: theme.colors.secondary,
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: theme.colors.failure,
    marginBottom: 16,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingBottom: 20,
    marginHorizontal: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#143D59',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  modalButton: {
    padding: 4,
  },
  modalButtonText: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
  doneButton: {
    fontWeight: 'bold',
  },
  datePicker: {
    height: 200,
    backgroundColor: theme.colors.primary,
  },
})
