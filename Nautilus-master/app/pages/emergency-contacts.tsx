'use client'

import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../context/theme-context'
import React from 'react'

type Contact = {
  id: string
  name: string
  phone: string
  relationship: string
}

const STORAGE_KEY = 'emergency_contacts'

export default function EmergencyContacts() {
  const router = useRouter()
  const { theme } = useTheme()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  })

  useEffect(() => {
    loadContacts()
  }, [])

  // Load contacts from AsyncStorage
  const loadContacts = async () => {
    try {
      setLoading(true)
      const storedContacts = await AsyncStorage.getItem(STORAGE_KEY)
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts))
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
      Alert.alert('Feil', 'Kunne ikke laste kontakter')
    } finally {
      setLoading(false)
    }
  }

  // Save contacts to AsyncStorage, when adding users
  const saveContacts = async (updatedContacts: Contact[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContacts))
    } catch (error) {
      console.error('Failed to save contacts:', error)
      Alert.alert('Feil', 'Kunne ikke lagre kontakter')
    }
  }

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Feil', 'Navn og telefonnummer er påkrevd')
      return
    }

    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
    }

    // Update contacts state and save to AsyncStorage
    const updatedContacts = [...contacts, contact]
    setContacts(updatedContacts)
    await saveContacts(updatedContacts)
    setNewContact({ name: '', phone: '', relationship: '' })
    setShowAddForm(false)
  }

  // Delete user from Firebase and Asyncstoraga
  const deleteContact = async (id: string) => {
    Alert.alert(
      'Bekreft sletting',
      'Er du sikker på at du vil slette denne kontakten?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Slett',
          style: 'destructive',
          onPress: async () => {
            const updatedContacts = contacts.filter(
              (contact) => contact.id !== id
            )
            setContacts(updatedContacts)
            await saveContacts(updatedContacts)
          },
        },
      ]
    )
  }

  // Function to call contact from users list of contacts
  const callContact = (phone: string) => {
    const phoneNumber = `tel:${phone}`
    Linking.openURL(phoneNumber).catch(() =>
      Alert.alert('Feil', 'Kunne ikke åpne telefonappen')
    )
  }

  const renderContactItem = ({ item }: { item: Contact }) => (
    <View style={[styles.contactItem, { backgroundColor: '#0E3251' }]}>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: theme.colors.white }]}>
          {item.name}
        </Text>
        <Text style={[styles.contactDetails, { color: '#9BA5B7' }]}>
          {item.relationship}
        </Text>
        <Text style={[styles.contactPhone, { color: theme.colors.accent }]}>
          {item.phone}
        </Text>
      </View>

      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: theme.colors.success }]}
          onPress={() => callContact(item.phone)}
        >
          <Ionicons name="call" size={20} color={theme.colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: theme.colors.failure },
          ]}
          onPress={() => deleteContact(item.id)}
        >
          <Ionicons name="trash" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderAddForm = () => (
    <View style={[styles.addFormTop, { backgroundColor: '#0E3251' }]}>
      <Text style={[styles.formTitle, { color: theme.colors.white }]}>
        Legg til ny kontakt
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.white }]}>Navn</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.white,
              color: theme.colors.primary,
            },
          ]}
          value={newContact.name}
          onChangeText={(text) => setNewContact({ ...newContact, name: text })}
          placeholder="Navn"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.white }]}>
          Telefon
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.white,
              color: theme.colors.primary,
            },
          ]}
          value={newContact.phone}
          onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
          placeholder="Telefonnummer"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.white }]}>
          Relasjon
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.white,
              color: theme.colors.primary,
            },
          ]}
          value={newContact.relationship}
          onChangeText={(text) =>
            setNewContact({ ...newContact, relationship: text })
          }
          placeholder="F.eks. familie, venn"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[
            styles.formButton,
            styles.cancelButton,
            { borderColor: theme.colors.white },
          ]}
          onPress={() => setShowAddForm(false)}
        >
          <Text
            style={[styles.cancelButtonText, { color: theme.colors.white }]}
          >
            Avbryt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.formButton,
            styles.saveButton,
            { backgroundColor: theme.colors.secondary },
          ]}
          onPress={addContact}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.white }]}>
            Lagre
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people" size={64} color={theme.colors.accent} />
      <Text style={[styles.emptyText, { color: theme.colors.white }]}>
        Ingen nødkontakter
      </Text>
      <Text style={[styles.emptySubtext, { color: '#9BA5B7' }]}>
        Legg til familie og venner som skal kontaktes i en nødsituasjon
      </Text>
      <TouchableOpacity
        style={[
          styles.addFirstButton,
          { backgroundColor: theme.colors.secondary },
        ]}
        onPress={() => setShowAddForm(true)}
      >
        <Text
          style={[styles.addFirstButtonText, { color: theme.colors.white }]}
        >
          Legg til kontakt
        </Text>
      </TouchableOpacity>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.primary }]}
      >
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
            Nødkontakter
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.white} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.primary }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
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
            Kontakter
          </Text>
          {!showAddForm && (
            <TouchableOpacity
              style={styles.headerAddButton}
              onPress={() => setShowAddForm(true)}
            >
              <Ionicons name="add" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {showAddForm && renderAddForm()}

          {!showAddForm && contacts.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {contacts.length > 0 && !showAddForm && (
                <Text style={[styles.listHeader, { color: '#9BA5B7' }]}>
                  Dine nødkontakter vil bli varslet i en nødsituasjon
                </Text>
              )}

              {contacts.map((contact) => (
                <View
                  key={contact.id}
                  style={[styles.contactItem, { backgroundColor: '#0E3251' }]}
                >
                  <View style={styles.contactInfo}>
                    <Text
                      style={[
                        styles.contactName,
                        { color: theme.colors.white },
                      ]}
                    >
                      {contact.name}
                    </Text>
                    <Text style={[styles.contactDetails, { color: '#9BA5B7' }]}>
                      {contact.relationship}
                    </Text>
                    <Text
                      style={[
                        styles.contactPhone,
                        { color: theme.colors.accent },
                      ]}
                    >
                      {contact.phone}
                    </Text>
                  </View>

                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={[
                        styles.callButton,
                        { backgroundColor: theme.colors.success },
                      ]}
                      onPress={() => callContact(contact.phone)}
                    >
                      <Ionicons
                        name="call"
                        size={20}
                        color={theme.colors.white}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        { backgroundColor: theme.colors.failure },
                      ]}
                      onPress={() => deleteContact(contact.id)}
                    >
                      <Ionicons
                        name="trash"
                        size={20}
                        color={theme.colors.white}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
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
    flex: 1,
  },
  headerAddButton: {
    padding: 8,
  },
  listHeader: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactItem: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 4,
  },
  contactDetails: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
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
  addFirstButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addFirstButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  addFormTop: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
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
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  formButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  saveButton: {},
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
})
