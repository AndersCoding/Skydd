'use client'

import { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { getUserByEmail, type User } from '../../services/user-service'
import { app } from '../../firebaseConfig'
import { useRouter } from 'expo-router'
import { theme } from '@/assets/css/theme'

interface LoginFormProps {
  onLoginSuccess: (user: User) => void
}

// Login form component
// This component handles user login and guest login
export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!app) {
      setError('Firebase not initialized')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const auth = getAuth(app)
      console.log('🔹 Logging in with:', email)

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      console.log('✅ Firebase Auth Success:', userCredential.user)

      const userDetails = await getUserByEmail(email)
      console.log('✅ Fetched user details:', userDetails)

      onLoginSuccess(userDetails)

      router.push('/pages/terms')
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err instanceof Error ? err.message : 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  // Guest login function
  const handleGuestLogin = async () => {
    if (!app) {
      setError('Firebase not initialized')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const auth = getAuth(app)
      console.log('🔹 Logging in as guest...')

      const userCredential = await signInWithEmailAndPassword(
        auth,
        'guest@guest.no',
        '123456'
      )
      console.log('✅ Guest login success:', userCredential.user)

      const userDetails = await getUserByEmail('guest@guest.no')
      console.log('✅ Guest user details:', userDetails)

      onLoginSuccess(userDetails)

      router.push('/pages/terms')
    } catch (err) {
      console.error('❌ Guest login error:', err)
      setError(err instanceof Error ? err.message : 'Failed to login as guest')
    } finally {
      setLoading(false)
    }
  }

  // If forgotten password, send a password reset email
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Vennligst skriv inn e-postadressen din først')
      return
    }

    try {
      setError(null)
      const auth = getAuth(app)
      await sendPasswordResetEmail(auth, email)
      Alert.alert(
        'E-post sendt',
        `En e-post med instruksjoner for å tilbakestille passordet ditt er sendt til ${email}`,
        [{ text: 'OK' }]
      )
    } catch (err) {
      console.error('❌ Password reset error:', err)
      setError(
        err instanceof Error
          ? `Kunne ikke sende e-post: ${err.message}`
          : 'Kunne ikke sende e-post for tilbakestilling av passord'
      )
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="black"
      />
      <TextInput
        style={styles.input}
        placeholder="Passord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="black"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logger inn...' : 'Logg inn'}
        </Text>
      </TouchableOpacity>

      <View style={styles.separator}>
        <View style={styles.line} />
        <Text style={styles.orText}>Eller</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          styles.guestButton,
          loading && styles.buttonDisabled,
        ]}
        onPress={handleGuestLogin}
        disabled={loading}
      >
        <Text style={styles.guestButtonText}>
          {loading ? 'Logger inn...' : 'Fortsett som gjest'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.forgotPasswordContainer}
        onPress={handleForgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Glemt passord?</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
  },
  input: {
    height: 48,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: theme.colors.secondary,
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  guestButton: {
    backgroundColor: 'white',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#E53E3E',
    marginBottom: 16,
    fontSize: 14,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#A0AEC0',
  },
  orText: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 10,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: theme.colors.accent,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})
