'use client'

import type React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../assets/css/theme'
import EmergencySlider from './emergency-slider'
import { useLanguage } from '../context/language-context'
import { useTheme } from '../context/theme-context'

interface SOSOverlayProps {
  visible: boolean
  onClose: () => void
}

// Modal for emergency calls
const SOSOverlay: React.FC<SOSOverlayProps> = ({ visible, onClose }) => {
  const { t } = useLanguage()
  const { theme: appTheme } = useTheme()

  const handleEmergencyCall = (number: string) => {
    console.log(`Emergency call initiated to ${number}`)
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: appTheme.colors.primary },
          ]}
        >
          <Text style={[styles.title, { color: appTheme.colors.white }]}>
            {t.emergencyCalls}
          </Text>

          <Text
            style={[styles.instructions, { color: 'rgba(255, 255, 255, 0.9)' }]}
          >
            {t.slideToCall}
          </Text>

          <View style={styles.slidersContainer}>
            <EmergencySlider
              number="112"
              label={t.police}
              onSlideComplete={() => handleEmergencyCall('112')}
            />

            <EmergencySlider
              number="120"
              label={t.coastGuardRadio}
              onSlideComplete={() => handleEmergencyCall('120')}
            />
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#0A2540',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  slidersContainer: {
    width: '100%',
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default SOSOverlay
