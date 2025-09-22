'use client'

import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { getAuth } from 'firebase/auth'
import { Ionicons } from '@expo/vector-icons'
import { getRiskAssessmentsByUser } from '@/services/risk-assesment-service'
import { useTheme } from '../context/theme-context'
import { useLanguage } from '../context/language-context'
import { riskQuestions } from '@/services/Irisk-test'
import { getBoatById, type Boat } from '@/services/boats-service'

type TripItem = {
  id: string
  boatId: string
  boatName: string
  date: string
  time: string
  riskScore: number
  passengers: number
  checklistResponses: { [key: string]: boolean }
  boatDetails?: Boat | null
}

// Page for displaying the users previous trips
export default function PreviousTrips() {
  const router = useRouter()
  const auth = getAuth()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<TripItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          setError('No authenticated user found')
          setLoading(false)
          return
        }

        const assessments = await getRiskAssessmentsByUser(currentUser.uid)

        const tripItems = assessments.map(
          (assessment): TripItem => ({
            id: assessment.id,
            boatId: assessment.boatId,
            boatName: assessment.boatName,
            date: assessment.date,
            time: assessment.time,
            riskScore: assessment.score,
            passengers: assessment.passengers || 1,
            checklistResponses: assessment.checklistResponses,
          })
        )
        tripItems.sort((a, b) => {
          const dateA = parseDateString(a.date, a.time)
          const dateB = parseDateString(b.date, b.time)
          return dateB.getTime() - dateA.getTime()
        })

        setTrips(tripItems)
      } catch (err) {
        console.error('Error fetching trips:', err)
        setError('Error fetching previous trips')
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  const parseDateString = (dateStr: string, timeStr: string): Date => {
    try {
      let day, month, year

      if (dateStr.includes('.')) {
        ;[day, month, year] = dateStr.split('.')
      } else if (dateStr.includes('/')) {
        ;[day, month, year] = dateStr.split('/')
      } else {
        return new Date(dateStr + ' ' + timeStr)
      }
      day = day || '01'
      month = month || '01'
      year = year || '2000'

      return new Date(`${year}-${month}-${day} ${timeStr || '00:00'}`)
    } catch (error) {
      console.error('Error parsing date:', error)
      return new Date()
    }
  }

  // Color code for risk assessment. If high, red, if moderate, orange, if low, green
  const getRiskColor = (score: number) => {
    if (score <= 3) return theme.colors.success
    if (score <= 8) return 'orange'
    return theme.colors.failure
  }

  // Get risk level based on score of risktest
  const getRiskLevel = (score: number) => {
    if (score <= 3) return t.low || 'Lav'
    if (score <= 8) return t.moderate || 'Moderat'
    if (score <= 15) return t.high || 'Høy'
    return t.extreme || 'Ekstrem'
  }

  // Handle trip item press to show modal with trip details
  const handleTripPress = async (trip: TripItem) => {
    try {
      if (!trip.boatDetails) {
        const currentUser = auth.currentUser
        if (currentUser && trip.boatId) {
          try {
            const boatDetails = await getBoatById(currentUser.uid, trip.boatId)
            trip = { ...trip, boatDetails }
          } catch (err) {
            console.log('Boat might have been deleted:', err)
            // Set boatDetails to null but don't show an error
            trip = { ...trip, boatDetails: null }
          }
        }
      }

      setSelectedTrip(trip)
      setModalVisible(true)
    } catch (err) {
      console.error('Error handling trip press:', err)
      // Don't show error message to user
    }
  }

  const renderTripItem = ({ item }: { item: TripItem }) => (
    <TouchableOpacity
      style={[styles.tripItem, { backgroundColor: '#0E3251' }]}
      onPress={() => handleTripPress(item)}
    >
      <View style={styles.tripHeader}>
        <Text style={[styles.boatName, { color: theme.colors.white }]}>
          {item.boatName}
        </Text>
        <View
          style={[
            styles.riskBadge,
            { backgroundColor: getRiskColor(item.riskScore) },
          ]}
        >
          <Text style={[styles.riskScore, { color: theme.colors.white }]}>
            {item.riskScore}
          </Text>
        </View>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#9BA5B7" />
          <Text style={[styles.detailText, { color: '#9BA5B7' }]}>
            {item.date}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#9BA5B7" />
          <Text style={[styles.detailText, { color: '#9BA5B7' }]}>
            {item.time}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="people" size={16} color="#9BA5B7" />
          <Text style={[styles.detailText, { color: '#9BA5B7' }]}>
            {item.passengers}{' '}
            {item.passengers === 1 ? 'passasjer' : 'passasjerer'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  // Get question based on index of riskQuestions
  const getQuestionText = (index: number) => {
    if (index < riskQuestions.length) {
      const questionKey = riskQuestions[index].questionKey
      return t[questionKey as keyof typeof t] || questionKey
    }
    const followUpIndex = index - riskQuestions.length
    let currentIndex = 0

    for (const question of riskQuestions) {
      if (question.followUpQuestion && question.followUpQuestion.length > 0) {
        for (const followUp of question.followUpQuestion) {
          if (currentIndex === followUpIndex) {
            return (
              t[followUp.questionKey as keyof typeof t] || followUp.questionKey
            )
          }
          currentIndex++
        }
      }
    }
    return `Spørsmål ${index + 1}`
  }

  // Check if the number of passengers exceeds the boats capacity
  const isPassengerCountExceeded = (trip: TripItem) => {
    if (!trip.boatDetails) return false
    return trip.passengers > trip.boatDetails.amountOfPeople
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
          {'Tidligere turer'}
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
            onPress={() => router.back()}
          >
            <Text
              style={[styles.retryButtonText, { color: theme.colors.primary }]}
            >
              {t.goBack || 'Gå tilbake'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="boat" size={64} color={theme.colors.accent} />
          <Text style={[styles.emptyText, { color: theme.colors.white }]}>
            {'Ingen tidligere turer'}
          </Text>
          <Text style={[styles.emptySubtext, { color: '#9BA5B7' }]}>
            {
              'Dine tidligere turer vil vises her når du har gjennomført din første tur.'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false)
        }}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.white} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.colors.white }]}>
                {'Turdetaljer'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedTrip && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.tripHeaderDetail}>
                  <Text
                    style={[
                      styles.boatNameDetail,
                      { color: theme.colors.white },
                    ]}
                  >
                    {selectedTrip.boatName}
                  </Text>
                  <View
                    style={[
                      styles.dateTimeContainer,
                      { backgroundColor: '#0E3251' },
                    ]}
                  >
                    <View style={styles.dateTimeRow}>
                      <Ionicons name="calendar" size={16} color="#9BA5B7" />
                      <Text style={[styles.dateTimeText, { color: '#9BA5B7' }]}>
                        {selectedTrip.date}
                      </Text>
                    </View>
                    <View style={styles.dateTimeRow}>
                      <Ionicons name="time" size={16} color="#9BA5B7" />
                      <Text style={[styles.dateTimeText, { color: '#9BA5B7' }]}>
                        {selectedTrip.time}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.riskScoreContainer,
                    { backgroundColor: '#0E3251' },
                  ]}
                >
                  <Text
                    style={[styles.sectionTitle, { color: theme.colors.white }]}
                  >
                    {t.riskAssessment || 'Risikovurdering'}
                  </Text>
                  <View style={styles.riskScoreRow}>
                    <View
                      style={[
                        styles.scoreCircle,
                        {
                          backgroundColor: getRiskColor(selectedTrip.riskScore),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.scoreTextDetail,
                          { color: theme.colors.white },
                        ]}
                      >
                        {selectedTrip.riskScore}
                      </Text>
                    </View>
                    <View style={styles.riskLevelContainer}>
                      <Text
                        style={[
                          styles.riskLevelText,
                          { color: getRiskColor(selectedTrip.riskScore) },
                        ]}
                      >
                        {getRiskLevel(selectedTrip.riskScore)}{' '}
                        {t.risk || 'risiko'}
                      </Text>

                      <View style={styles.passengersContainer}>
                        <Text
                          style={[
                            styles.passengersText,
                            {
                              color: isPassengerCountExceeded(selectedTrip)
                                ? theme.colors.failure
                                : theme.colors.white,
                            },
                          ]}
                        >
                          {selectedTrip.passengers}{' '}
                          {selectedTrip.passengers === 1
                            ? 'passasjer'
                            : 'passasjerer'}
                          {selectedTrip.boatDetails ? (
                            <Text style={{ color: theme.colors.white }}>
                              {' '}
                              (maks {selectedTrip.boatDetails.amountOfPeople})
                            </Text>
                          ) : (
                            <Text style={{ color: theme.colors.white }}>
                              {' '}
                              (Du har slettet denne båten)
                            </Text>
                          )}
                        </Text>

                        {isPassengerCountExceeded(selectedTrip) && (
                          <Text style={styles.warningText}>
                            {
                              'Advarsel: Antall passasjerer overstiger båtens kapasitet!'
                            }
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.checklistContainer,
                    { backgroundColor: '#0E3251' },
                  ]}
                >
                  <Text
                    style={[styles.sectionTitle, { color: theme.colors.white }]}
                  >
                    {'Sikkerhetsjekkliste'}
                  </Text>

                  {Object.entries(selectedTrip.checklistResponses).map(
                    ([index, answer]) => {
                      if (answer === null) return null

                      return (
                        <View key={index} style={styles.checklistItem}>
                          <View
                            style={[
                              styles.answerIndicator,
                              {
                                backgroundColor: answer
                                  ? theme.colors.success
                                  : theme.colors.failure,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.checklistText,
                              { color: theme.colors.white },
                            ]}
                          >
                            {getQuestionText(Number(index))}
                          </Text>
                          <Ionicons
                            name={answer ? 'checkmark-circle' : 'close-circle'}
                            size={24}
                            color={
                              answer
                                ? theme.colors.success
                                : theme.colors.failure
                            }
                          />
                        </View>
                      )
                    }
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  },
  tripItem: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  boatName: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
  riskBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskScore: {
    fontSize: 12,
    fontFamily: 'Rubik-Bold',
  },
  tripDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  tripHeaderDetail: {
    marginBottom: 20,
  },
  boatNameDetail: {
    fontSize: 24,
    fontFamily: 'Rubik-Bold',
    marginBottom: 10,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTimeText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
  },
  riskScoreContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 15,
  },
  riskScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  scoreTextDetail: {
    fontSize: 24,
    fontFamily: 'Rubik-Bold',
  },
  riskLevelContainer: {
    flex: 1,
  },
  riskLevelText: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 5,
  },
  passengersContainer: {
    marginBottom: 5,
  },
  passengersText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'Rubik-Medium',
    color: '#FF6347',
    marginTop: 4,
  },
  checklistContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  answerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
  },
})
