'use client'

import type React from 'react'
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLanguage } from '../context/language-context'
import { useTheme } from '../context/theme-context'

type Contact = {
  id: string
  name: string
  phone: string
  relationship: string
}

interface ContactSelectionOverlayProps {
  visible: boolean
  contacts: Contact[]
  onSelect: (contact: Contact) => void
  onClose: () => void
}

// Selection of users stored contacts
const ContactSelectionOverlay: React.FC<ContactSelectionOverlayProps> = ({
  visible,
  contacts,
  onSelect,
  onClose,
}) => {
  const { t } = useLanguage()
  const { theme: appTheme } = useTheme()

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
            {t.selectContact}
          </Text>

          {contacts.length === 0 ? (
            <Text style={[styles.emptyText, { color: appTheme.colors.white }]}>
              {t.noContactsFound}
            </Text>
          ) : (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => onSelect(item)}
                >
                  <Text
                    style={[
                      styles.contactName,
                      { color: appTheme.colors.white },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.contactPhone}>{item.phone}</Text>
                </TouchableOpacity>
              )}
            />
          )}

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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#0A2540',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#A0AEC0',
  },
  contactName: {
    fontSize: 18,
    color: '#fff',
  },
  contactPhone: {
    fontSize: 16,
    color: '#9BA5B7',
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 20,
  },
})

export default ContactSelectionOverlay
