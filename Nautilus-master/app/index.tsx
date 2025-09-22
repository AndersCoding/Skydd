'use client'

import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import LoginForm from './components/login-form'
import RegisterForm from './components/register-form'
import { useRouter } from 'expo-router'
import type { User } from '../services/user-service'
import { FONTS } from '@/assets/fonts/fonts'

// Index page for the Skydd-app
// Lets users log in or register
export default function Index() {
  const nautilusLogo = require('../assets/images/Nautilus_logo.png')

  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)

  const handleLoginSuccess = (user: User) => {
    console.log('Login success, user:', user)
  }

  const handleRegisterSuccess = (user: User) => {
    console.log('Registration success, user:', user)
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Image source={nautilusLogo} style={styles.logo} />
          </View>

          <Text style={styles.skyddText}>SKYDD</Text>

          {isRegistering ? (
            <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
          ) : (
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          )}

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsRegistering(!isRegistering)}
          >
            <Text style={styles.toggleButtonText}>
              {isRegistering
                ? 'Har du en konto? Logg inn'
                : 'Trenger du en konto? Registrer deg'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0B2C41',
  },
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  skyddText: {
    position: 'absolute',
    fontSize: 98,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.RUBIK.EXTRA_BOLD,
    color: 'white',
    marginBottom: 0,
    top: 50,
  },
  toggleButton: {
    marginTop: 40,
    alignContent: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    color: 'white',
    textAlign: 'center',
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
    color: '#FFFFFF',
    fontSize: 14,
    marginHorizontal: 10,
  },
  guestButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: 'bold',
  },
})
