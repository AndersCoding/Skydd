'use client'

import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/theme-context'
import {
  getBoatsByOwner,
  createBoat,
  deleteBoat,
  type Boat,
} from '@/services/boats-service'

export default function MyBoats() {
  const router = useRouter()
  const auth = getAuth()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [boats, setBoats] = useState<Boat[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBoat, setNewBoat] = useState({
    name: '',
    hp: 0,
    amountOfPeople: 0,
    id: '',
  })

  useEffect(() => {
    fetchBoats()
  }, [])

  // Fetch boats when opening page, if the user have registered any boats
  const fetchBoats = async () => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        setError('No authenticated user found')
        setLoading(false)
        return
      }

      // Fetch boats from the database
      const userBoats = await getBoatsByOwner(currentUser.uid)
      setBoats(userBoats)
    } catch (err) {
      console.error('Error fetching boats:', err)
      setError('Error fetching boats')
    } finally {
      setLoading(false)
    }
  }

  // Function to add a new boat. Only works if the user is authenticated/logged in
  const handleAddBoat = async () => {
    if (!auth.currentUser) return
    if (!newBoat.name) {
      Alert.alert('Feil', 'Båtnavn er påkrevd')
      return
    }

    try {
      setLoading(true)
      await createBoat(auth.currentUser.uid, {
        name: newBoat.name,
        hp: newBoat.hp || 0,
        amountOfPeople: newBoat.amountOfPeople || 0,
      })

      setNewBoat({ name: '', hp: 0, amountOfPeople: 0, id: '' })
      setShowAddForm(false)
      await fetchBoats()
    } catch (err) {
      console.error('Error adding boat:', err)
      setError('Error adding boat')
      setLoading(false)
    }
  }

  // Function to delete the registered boat(s). Only works if the user is authenticated/logged in
  const handleDeleteBoat = (boatId: string) => {
    if (!auth.currentUser) return

    Alert.alert(
      'Bekreft sletting',
      'Er du sikker på at du vil slette denne båten?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Slett',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteBoat(auth.currentUser!.uid, boatId)
              await fetchBoats()
            } catch (err) {
              console.error('Error deleting boat:', err)
              setError('Error deleting boat')
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  const renderBoatItem = ({ item }: { item: Boat }) => (
    <View style={[styles.boatItem, { backgroundColor: '#0E3251' }]}>
      <View style={styles.boatImageContainer}>
        <Image
          source={{
            uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sail-boat-xxl-JBuE2rXdlhvLmJpYQikw3V8cG0lh0h.png',
          }}
          style={[styles.boatImage, { backgroundColor: theme.colors.accent }]}
        />
      </View>

      <View style={styles.boatInfo}>
        <Text style={[styles.boatName, { color: theme.colors.white }]}>
          {item.name}
        </Text>
        <Text style={[styles.boatDetails, { color: '#9BA5B7' }]}>
          {item.hp} HK
        </Text>
      </View>

      <View style={styles.boatActions}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.colors.accent }]}
          onPress={() =>
            router.push({
              pathname: '/pages/edit-boat',
              params: { boatId: item.id },
            })
          }
        >
          <Ionicons name="create" size={20} color={theme.colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: theme.colors.failure },
          ]}
          onPress={() => handleDeleteBoat(item.id)}
        >
          <Ionicons name="trash" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  )

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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
          Mine båter
        </Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.failure }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.accent },
            ]}
            onPress={fetchBoats}
          >
            <Text
              style={[styles.retryButtonText, { color: theme.colors.primary }]}
            >
              Prøv igjen
            </Text>
          </TouchableOpacity>
        </View>
      ) : boats.length === 0 && !showAddForm ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="boat" size={64} color={theme.colors.accent} />
          <Text style={[styles.emptyText, { color: theme.colors.white }]}>
            Ingen båter lagt til
          </Text>
          <Text style={[styles.emptySubtext, { color: '#9BA5B7' }]}>
            Legg til din første båt for å komme i gang.
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
              Legg til båt
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={boats}
          renderItem={renderBoatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {showAddForm ? (
        <View style={[styles.addForm, { backgroundColor: '#0E3251' }]}>
          <Text style={[styles.formTitle, { color: theme.colors.white }]}>
            Legg til ny båt
          </Text>

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
              value={newBoat.name}
              onChangeText={(text) => setNewBoat({ ...newBoat, name: text })}
              placeholder="Båtnavn"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.white }]}>
              Registreringsnummer
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.white,
                  color: theme.colors.primary,
                },
              ]}
              value={newBoat.id.toString()}
              onChangeText={(text) => setNewBoat({ ...newBoat, id: text })}
              placeholder="Registreringsnummer"
              placeholderTextColor="#666"
              keyboardType="number-pad"
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
              value={newBoat.hp.toString()}
              onChangeText={(text) =>
                setNewBoat({ ...newBoat, hp: Number.parseInt(text) || 0 })
              }
              placeholder="HK"
              placeholderTextColor="#666"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.white }]}>
              Antall Plasser
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.white,
                  color: theme.colors.primary,
                },
              ]}
              value={newBoat.amountOfPeople.toString()}
              onChangeText={(text) =>
                setNewBoat({
                  ...newBoat,
                  amountOfPeople: Number.parseInt(text) || 0,
                })
              }
              placeholder="Antall Plasser"
              placeholderTextColor="#666"
              keyboardType="number-pad"
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
              onPress={handleAddBoat}
            >
              <Text
                style={[styles.saveButtonText, { color: theme.colors.white }]}
              >
                Lagre
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        boats.length > 0 && (
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add" size={24} color={theme.colors.white} />
            <Text style={[styles.addButtonText, { color: theme.colors.white }]}>
              Legg til båt
            </Text>
          </TouchableOpacity>
        )
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  boatItem: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  boatImageContainer: {
    marginRight: 16,
  },
  boatImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  boatInfo: {
    flex: 1,
  },
  boatName: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 4,
  },
  boatDetails: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
  },
  boatActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  addForm: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 20,
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
    marginTop: 20,
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
