'use client'

import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface DeleteAccountModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: (password: string) => Promise<void>
  theme: any
}

// Modal for the deletion of the users account
export default function DeleteAccountModal({
  visible,
  onClose,
  onConfirm,
  theme,
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError('Vennligst skriv inn passordet ditt')
      return
    }

    try {
      setError(null)
      setIsDeleting(true)
      await onConfirm(password)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Det oppstod en feil under sletting av kontoen')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setError(null)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.white }]}>
              Slett konto
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Ionicons
              name="warning"
              size={48}
              color={theme.colors.failure}
              style={styles.warningIcon}
            />

            <Text style={[styles.warningText, { color: theme.colors.white }]}>
              Er du sikker på at du vil slette kontoen din?
            </Text>

            <Text
              style={[styles.descriptionText, { color: theme.colors.white }]}
            >
              Dette vil permanent slette all din data og kan ikke angres. For å
              bekrefte, vennligst skriv inn passordet ditt.
            </Text>

            <TextInput
              style={[
                styles.passwordInput,
                { backgroundColor: theme.colors.white },
              ]}
              placeholder="Passord"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error && (
              <Text style={[styles.errorText, { color: theme.colors.failure }]}>
                {error}
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { borderColor: theme.colors.white },
                ]}
                onPress={handleClose}
                disabled={isDeleting}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: theme.colors.white },
                  ]}
                >
                  Avbryt
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  { backgroundColor: theme.colors.failure },
                ]}
                onPress={handleConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.deleteButtonText,
                      { color: theme.colors.white },
                    ]}
                  >
                    Slett konto
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  warningIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
    textAlign: 'center',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  passwordInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
})
