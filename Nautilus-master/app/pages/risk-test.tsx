'use client'

import { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native'
import { riskQuestions, type RiskQuestion } from '@/services/Irisk-test'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getAuth } from 'firebase/auth'
import { app } from '@/firebaseConfig'
import { getBoatById, type Boat } from '@/services/boats-service'
import { createRiskAssessment } from '@/services/risk-assesment-service'
import { getUserByUid, type User } from '@/services/user-service'
import { useTheme } from '../context/theme-context'
import { useLanguage } from '../context/language-context'
import { sendSafetyTestSms } from '@/services/sms-service'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ContactSelectionOverlay from '../components/contact-selection'

type Contact = {
  id: string
  name: string
  phone: string
  relationship: string
}

// The risk test where the user takes the test to assess their safety on sea
export default function RiskTest() {
  const router = useRouter()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: boolean }>({})
  const [isComplete, setIsComplete] = useState(false)
  const [dynamicQuestions, setDynamicQuestions] = useState<RiskQuestion[]>([])
  const [originalQuestions, setOriginalQuestions] =
    useState<RiskQuestion[]>(riskQuestions)
  const scrollViewRef = useRef<ScrollView>(null)
  const [passengers, setPassengers] = useState<number>(1)
  const [isSaving, setIsSaving] = useState(false)
  const [assessmentSaved, setAssessmentSaved] = useState(false)
  const [showPassengerAdjust, setShowPassengerAdjust] = useState(false)
  const [questionHeights, setQuestionHeights] = useState<{
    [key: number]: number
  }>({})
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [tooManyPassengers, setTooManyPassengers] = useState(false)
  const [questionHistory, setQuestionHistory] = useState<number[]>([0])
  const { boatId } = useLocalSearchParams<{ boatId: string }>()
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null)

  const [smsContactOverlayVisible, setSmsContactOverlayVisible] =
    useState(false)
  const [smsContacts, setSmsContacts] = useState<Contact[]>([])

  const [passengerQuestionBgColor, setPassengerQuestionBgColor] = useState(
    theme.colors.primary
  )

  useEffect(() => {
    const fetchData = async () => {
      if (boatId) {
        try {
          const auth = getAuth(app)
          const user = auth.currentUser
          if (user) {
            const boat = await getBoatById(user.uid, boatId as string)
            setSelectedBoat(boat)
            const userData = await getUserByUid(user.uid)
            setCurrentUser(userData)

            const questions = [...riskQuestions]
            if (userData.hasBoatingLicence) {
              const licenseQuestionIndex = questions.findIndex(
                (q) => q.isLicenseQuestion
              )
              if (licenseQuestionIndex !== -1) {
                setUserAnswers((prev) => ({
                  ...prev,
                  [licenseQuestionIndex]: true,
                }))
              }
            }
            setDynamicQuestions(questions)
            setOriginalQuestions(questions)
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
    }
    fetchData()
  }, [boatId])

  const checkAllQuestionsAnswered = () => {
    return dynamicQuestions.every(
      (_, index) => userAnswers[index] !== undefined
    )
  }

  const isLastQuestion = () => {
    return currentQuestionIndex === dynamicQuestions.length - 1
  }

  // Takes users answer and updates the state of the score
  const handleAnswer = (answer: boolean) => {
    const currentQuestion = dynamicQuestions[currentQuestionIndex]

    if (currentQuestion.isPassengerQuestion) {
      setUserAnswers((prevAnswers) => ({
        ...prevAnswers,
        [currentQuestionIndex]: true,
      }))

      if (answer) {
        setShowPassengerAdjust(true)
        return
      } else {
        setPassengers(1)
        setTooManyPassengers(false)

        if (isLastQuestion() && checkAllQuestionsAnswered()) {
          setIsComplete(true)
        } else {
          moveToNextQuestion()
        }
        return
      }
    } else {
      setUserAnswers((prevAnswers) => ({
        ...prevAnswers,
        [currentQuestionIndex]: answer,
      }))
    }

    if (!answer && currentQuestion.followUpQuestion) {
      setDynamicQuestions((prevQuestions) => {
        const updatedQuestions = [
          ...prevQuestions.slice(0, currentQuestionIndex + 1),
          ...currentQuestion.followUpQuestion!.map((q) => ({
            ...q,
            questionKey: q.questionKey,
          })),
          ...prevQuestions.slice(currentQuestionIndex + 1),
        ]
        return updatedQuestions
      })
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1
        setCurrentQuestionIndex(nextIndex)
        setQuestionHistory((prev) => [...prev, nextIndex])
        setTimeout(() => {
          let scrollPosition = 0
          for (let i = 0; i < nextIndex; i++) {
            scrollPosition += questionHeights[i] || 70
          }
          scrollPosition = Math.max(0, scrollPosition - 20)
          scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: true })
        }, 50)
      }, 200)
    } else {
      if (isLastQuestion()) {
        setTimeout(() => {
          if (checkAllQuestionsAnswered()) {
            setIsComplete(true)
          } else {
            moveToNextQuestion()
          }
        }, 100)
      } else {
        moveToNextQuestion()
      }
    }
  }

  // After current question is answered move to the next question
  const moveToNextQuestion = () => {
    setTimeout(() => {
      if (currentQuestionIndex < dynamicQuestions.length - 1) {
        const nextIndex = currentQuestionIndex + 1
        setCurrentQuestionIndex(nextIndex)
        setQuestionHistory((prev) => [...prev, nextIndex])
        setTimeout(() => {
          const scrollToIndex = Math.max(0, nextIndex - 1)
          let scrollPosition = 0
          for (let i = 0; i < scrollToIndex; i++) {
            scrollPosition += questionHeights[i] || 70
          }
          scrollPosition = Math.max(0, scrollPosition - 20)
          scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: true })
        }, 50)
      } else {
        if (checkAllQuestionsAnswered()) {
          setIsComplete(true)
        } else {
          const firstUnansweredIndex = dynamicQuestions.findIndex(
            (_, index) => userAnswers[index] === undefined
          )
          if (firstUnansweredIndex !== -1) {
            setCurrentQuestionIndex(firstUnansweredIndex)
            setQuestionHistory((prev) => [...prev, firstUnansweredIndex])
            setTimeout(() => {
              let scrollPosition = 0
              for (let i = 0; i < firstUnansweredIndex; i++) {
                scrollPosition += questionHeights[i] || 70
              }
              scrollPosition = Math.max(0, scrollPosition - 20)
              scrollViewRef.current?.scrollTo({
                y: scrollPosition,
                animated: true,
              })
            }, 50)
          } else {
            setIsComplete(true)
          }
        }
      }
    }, 200)
  }

  const goToPreviousQuestion = () => {
    if (questionHistory.length > 1) {
      const newHistory = [...questionHistory]
      newHistory.pop()
      const previousIndex = newHistory[newHistory.length - 1]
      setQuestionHistory(newHistory)
      setCurrentQuestionIndex(previousIndex)
      setTimeout(() => {
        let scrollPosition = 0
        for (let i = 0; i < previousIndex; i++) {
          scrollPosition += questionHeights[i] || 70
        }
        scrollPosition = Math.max(0, scrollPosition - 20)
        scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: true })
      }, 50)
    }
  }

  const handleQuestionClick = (index: number) => {
    if (userAnswers[index] !== undefined) {
      setCurrentQuestionIndex(index)
      const historyIndex = questionHistory.indexOf(index)
      if (historyIndex !== -1) {
        setQuestionHistory(questionHistory.slice(0, historyIndex + 1))
      } else {
        setQuestionHistory((prev) => [...prev, index])
      }
      setTimeout(() => {
        let scrollPosition = 0
        for (let i = 0; i < index; i++) {
          scrollPosition += questionHeights[i] || 70
        }
        scrollPosition = Math.max(0, scrollPosition - 20)
        scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: true })
      }, 50)
    }
  }

  // Enter number of passengers
  const handlePassengerChange = (increment: boolean) => {
    const maxPassengers = selectedBoat?.amountOfPeople || 1

    setPassengers((prev) => {
      const newValue = increment ? prev + 1 : Math.max(1, prev - 1)
      const isTooMany = newValue > maxPassengers
      setTooManyPassengers(isTooMany)

      // Update the background color based on passenger count
      if (isTooMany) {
        setPassengerQuestionBgColor(theme.colors.failure)
      } else {
        setPassengerQuestionBgColor(theme.colors.success)
      }

      return newValue
    })
  }

  const confirmPassengerCount = () => {
    setShowPassengerAdjust(false)
    if (isLastQuestion() && checkAllQuestionsAnswered()) {
      setIsComplete(true)
    } else {
      moveToNextQuestion()
    }
  }

  // Formula to calculate the total risk score
  const calculateTotalRiskScore = () => {
    return dynamicQuestions.reduce((total, question, index) => {
      if (userAnswers[index] !== undefined) {
        return total + question.calculateRisk(userAnswers[index])
      }
      return total
    }, 0)
  }

  const finalRiskScore = tooManyPassengers
    ? calculateTotalRiskScore() + 100
    : calculateTotalRiskScore()

  // Assess the risk level of the user, based on the score
  const getRiskLevel = (score: number) => {
    if (tooManyPassengers)
      return { level: t.critical || 'Kritisk', color: '#8B0000' }
    if (score <= 3)
      return { level: t.low || 'Lav', color: theme.colors.success }
    if (score <= 8) return { level: t.moderate || 'Moderat', color: 'orange' }
    if (score <= 15)
      return { level: t.high || 'Høy', color: theme.colors.failure }
    return { level: t.extreme || 'Ekstrem', color: '#8B0000' }
  }

  const riskAssessment = getRiskLevel(finalRiskScore)

  // Save users score after test
  const saveRiskAssessment = async () => {
    if (assessmentSaved) return
    try {
      setIsSaving(true)
      const auth = getAuth(app)
      const currentUser = auth.currentUser
      if (!currentUser || !selectedBoat) {
        Alert.alert(
          t.error || 'Feil',
          t.couldNotSaveRiskAssessment ||
            'Kunne ikke lagre risikovurdering. Prøv igjen senere.'
        )
        return
      }
      const now = new Date()
      const date = now.toLocaleDateString('no-NO')
      const time = now.toLocaleTimeString('no-NO', {
        hour: '2-digit',
        minute: '2-digit',
      })
      await createRiskAssessment({
        userId: currentUser.uid,
        boatId: selectedBoat.id,
        boatName: selectedBoat.name,
        date,
        time,
        score: finalRiskScore,
        passengers,
        checklistResponses: userAnswers,
      })
      setAssessmentSaved(true)
    } catch (error) {
      console.error('Error saving risk assessment:', error)
      Alert.alert(
        t.error || 'Feil',
        `${t.couldNotSaveRiskAssessment || 'Kunne ikke lagre risikovurdering'}: ${error instanceof Error ? error.message : t.unknownError || 'Ukjent feil'}`
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Start the trip, after finished the test. If to many passengers, it will show an alert
  const startTrip = () => {
    if (tooManyPassengers) {
      Alert.alert(
        t.tooManyPassengers || 'For mange passasjerer',
        `${t.boatCapacityLimitMessage || 'Denne båten har kun plass til'} ${selectedBoat?.amountOfPeople} ${t.people || 'personer'}. ${t.reducePassengersToStart || 'Reduser antall passasjerer for å starte turen.'}`
      )
      return
    }
    if (!assessmentSaved) {
      saveRiskAssessment()
    }
    router.push({
      pathname: '/pages/ongoing-trip',
      params: {
        boatId: boatId,
        boatName: selectedBoat?.name || t.boatTrip || 'Båttur',
      },
    })
  }

  useEffect(() => {
    if (isComplete && !assessmentSaved && !isSaving) {
      saveRiskAssessment()
    }
  }, [isComplete])

  // Open the contact selection, where user can send risk score to a contact
  const openSmsContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('emergency_contacts')
      if (storedContacts) {
        setSmsContacts(JSON.parse(storedContacts))
      }
      setSmsContactOverlayVisible(true)
    } catch (error) {
      console.error('Feil ved henting av kontakter:', error)
    }
  }

  // Message will contain user score, number of passengers, and questions answered
  const handleContactSelectSms = async (contact: Contact) => {
    setSmsContactOverlayVisible(false)
    const noAnswers = dynamicQuestions
      .map((question, index) => ({ question, index }))
      .filter(
        ({ question, index }) => userAnswers[index] === false && index !== 0
      )
      .map(
        ({ question }) =>
          t[question.questionKey as keyof typeof t] || question.questionKey
      )
    await sendSafetyTestSms(
      contact.phone,
      finalRiskScore,
      passengers,
      t,
      noAnswers
    )
  }

  if (isComplete) {
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
        </View>
        <View style={styles.resultContainer}>
          <Text style={[styles.resultTitle, { color: theme.colors.white }]}>
            {t.riskAssessment || 'Risikovurdering'}
          </Text>
          {selectedBoat && (
            <Text style={[styles.boatInfo, { color: theme.colors.white }]}>
              {t.boat || 'Båt'}: {selectedBoat.name} ({selectedBoat.hp}{' '}
              {t.hp || 'HK'})
            </Text>
          )}
          <View
            style={[
              styles.scoreContainer,
              { backgroundColor: riskAssessment.color },
            ]}
          >
            <Text style={[styles.scoreText, { color: theme.colors.white }]}>
              {tooManyPassengers ? '!' : finalRiskScore}
            </Text>
          </View>
          <Text style={[styles.riskLevelText, { color: riskAssessment.color }]}>
            {riskAssessment.level} {t.risk || 'risiko'}
          </Text>
          {tooManyPassengers ? (
            <Text style={styles.criticalWarning}>
              {t.warning || 'ADVARSEL'}:{' '}
              {t.tooManyPassengersWarning ||
                'For mange passasjerer! Denne båten har kun plass til'}{' '}
              {selectedBoat?.amountOfPeople} {t.people || 'personer'}.
            </Text>
          ) : (
            <Text
              style={[styles.resultDescription, { color: theme.colors.white }]}
            >
              {finalRiskScore === 0
                ? t.excellent || 'Utmerket! Du er godt forberedt for turen.'
                : `${t.yourTotalRiskScore || 'Din totale risiko-score er'} ${finalRiskScore}. ${
                    riskAssessment.level === (t.low || 'Lav')
                      ? t.wellPreparedButCheck ||
                        'Du er godt forberedt, men sjekk punktene du svarte nei på.'
                      : riskAssessment.level === (t.moderate || 'Moderat')
                        ? t.considerImprovingSafety ||
                          'Vurder å forbedre sikkerheten før du drar ut.'
                        : t.stronglyRecommendImproving ||
                          'Det anbefales sterkt å forbedre sikkerheten før du drar ut.'
                  }`}
            </Text>
          )}
          <Text style={[styles.passengersInfo, { color: theme.colors.white }]}>
            {t.numberOfPeopleOnboard || 'Antall personer ombord'}: {passengers}{' '}
            {tooManyPassengers
              ? `(${t.max || 'maks'} ${selectedBoat?.amountOfPeople})`
              : ''}
          </Text>
          <TouchableOpacity
            onPress={openSmsContacts}
            style={{
              backgroundColor: theme.colors.accent,
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 16,
                fontFamily: theme.fonts.semiBold,
              }}
            >
              {t.sendSms || 'Send SMS med testresultat'}
            </Text>
          </TouchableOpacity>
          <View style={{ width: '100%', gap: 12 }}>
            <TouchableOpacity
              style={{
                backgroundColor: tooManyPassengers
                  ? '#666'
                  : theme.colors.secondary,
                paddingVertical: 12,
                paddingHorizontal: 30,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={startTrip}
              disabled={tooManyPassengers}
            >
              <Text
                style={{
                  color: theme.colors.white,
                  fontSize: 16,
                  fontFamily: theme.fonts.semiBold,
                }}
              >
                {tooManyPassengers
                  ? t.cannotStartTrip || 'Kan ikke starte tur'
                  : t.startTrip || 'Start tur'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.returnButton, { borderColor: theme.colors.white }]}
              onPress={() => router.push('/home')}
            >
              <Text
                style={[styles.returnButtonText, { color: theme.colors.white }]}
              >
                {t.backToHome || 'Tilbake til hjem'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {smsContactOverlayVisible && (
          <ContactSelectionOverlay
            visible={smsContactOverlayVisible}
            contacts={smsContacts}
            onSelect={handleContactSelectSms}
            onClose={() => setSmsContactOverlayVisible(false)}
          />
        )}
      </SafeAreaView>
    )
  }

  if (showPassengerAdjust) {
    const maxPassengers = selectedBoat?.amountOfPeople || 1
    const isOverLimit = passengers > maxPassengers
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
        </View>
        <View style={styles.passengerAdjustContainer}>
          <Text
            style={[styles.passengerAdjustTitle, { color: theme.colors.white }]}
          >
            {t.howManyPeopleOnboard || 'Hvor mange personer er ombord?'}
          </Text>
          {selectedBoat && (
            <Text
              style={[styles.boatCapacityInfo, { color: theme.colors.white }]}
            >
              {t.thisBoatHasMaxCapacity || 'Denne båten har plass til maks'}{' '}
              {selectedBoat.amountOfPeople} {t.people || 'personer'}
            </Text>
          )}
          <View style={styles.passengersInputContainer}>
            <TouchableOpacity
              style={[
                styles.passengerButton,
                { backgroundColor: theme.colors.secondary },
              ]}
              onPress={() => handlePassengerChange(false)}
            >
              <Text
                style={[
                  styles.passengerButtonText,
                  { color: theme.colors.white },
                ]}
              >
                −
              </Text>
            </TouchableOpacity>
            <View
              style={[
                styles.passengerCountContainer,
                {
                  backgroundColor: isOverLimit ? '#FFCCCC' : theme.colors.white,
                },
                isOverLimit && { borderColor: '#FF6347', borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  styles.passengerCount,
                  { color: isOverLimit ? '#FF0000' : theme.colors.primary },
                ]}
              >
                {passengers}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.passengerButton,
                { backgroundColor: theme.colors.secondary },
              ]}
              onPress={() => handlePassengerChange(true)}
            >
              <Text
                style={[
                  styles.passengerButtonText,
                  { color: theme.colors.white },
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
          {isOverLimit && (
            <Text style={styles.warningText}>
              {t.warning || 'Advarsel'}:{' '}
              {t.tooManyPassengersForThisBoat ||
                'For mange passasjerer for denne båten!'}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={confirmPassengerCount}
          >
            <Text
              style={[styles.confirmButtonText, { color: theme.colors.white }]}
            >
              {t.confirm || 'Bekreft'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
      </View>
      <Text style={[styles.title, { color: theme.colors.white }]}>
        {t.safetyTestFor || 'Sikkerhetstest for'}{' '}
        {selectedBoat ? selectedBoat.name : t.boatTrip || 'båttur'}
      </Text>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.questionList}>
          {dynamicQuestions.map((question, index) => {
            const isFollowUp = question.questionKey.startsWith('--')
            const isAnswered = userAnswers[index] !== undefined
            const isCurrent = index === currentQuestionIndex
            const answeredYes = isAnswered && userAnswers[index] === true
            const answeredNo = isAnswered && userAnswers[index] === false
            const isLicenseQuestion =
              question.isLicenseQuestion && currentUser?.hasBoatingLicence
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.questionItem,
                  isFollowUp ? styles.followUpQuestion : null,
                  answeredYes
                    ? [
                        styles.answeredYesQuestion,
                        {
                          backgroundColor:
                            question.isPassengerQuestion && tooManyPassengers
                              ? theme.colors.failure
                              : theme.colors.success,
                        },
                      ]
                    : null,
                  answeredNo
                    ? [
                        styles.answeredNoQuestion,
                        { backgroundColor: theme.colors.failure },
                      ]
                    : null,
                  isCurrent ? styles.currentQuestion : null,
                  isLicenseQuestion ? styles.autoAnsweredQuestion : null,
                ]}
                testID={`question-${index}`}
                onLayout={(event) => {
                  const { height } = event.nativeEvent.layout
                  setQuestionHeights((prev) => ({ ...prev, [index]: height }))
                }}
                onPress={() => handleQuestionClick(index)}
                disabled={!isAnswered || isCurrent}
              >
                <Text
                  style={[
                    styles.questionText,
                    isFollowUp ? styles.followUpText : null,
                    isAnswered ? styles.answeredText : null,
                    isLicenseQuestion ? styles.autoAnsweredText : null,
                    { color: '#FFF' },
                  ]}
                >
                  {t[question.questionKey as keyof typeof t] ||
                    question.questionKey}
                  {isLicenseQuestion
                    ? ` (${t.retrievedFromProfile || 'Hentet fra profil'})`
                    : ''}
                </Text>
                {isAnswered && !isCurrent && (
                  <Text style={styles.tapToEditText}>
                    {t.tapToChangeAnswer || 'Trykk for å endre svar'}
                  </Text>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
      <View style={{ height: 5 }} />

      <View style={styles.progressIndicator}>
        <Text style={[styles.progressText, { color: theme.colors.white }]}>
          {t.question || 'Spørsmål'} {currentQuestionIndex + 1} {t.of || 'av'}{' '}
          {dynamicQuestions.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentQuestionIndex + 1) / dynamicQuestions.length) * 100}%`,
                backgroundColor: theme.colors.accent,
              },
            ]}
          />
        </View>
      </View>

      <View style={{ height: 10 }} />

      <View
        style={[styles.buttonContainer, { borderColor: theme.colors.accent }]}
      >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={() => handleAnswer(true)}
        >
          <Text style={[styles.buttonText, { color: theme.colors.white }]}>
            ✔ {t.yes || 'Ja'}
          </Text>
        </TouchableOpacity>
        <View style={{ width: 20 }} />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={() => handleAnswer(false)}
        >
          <Text style={[styles.buttonText, { color: theme.colors.white }]}>
            ✖ {t.no || 'Nei'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: 24,
    fontFamily: 'Rubik-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingTop: 10,
  },
  questionList: {
    width: '90%',
    alignSelf: 'center',
  },
  questionItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#1E3A56',
  },
  followUpQuestion: {
    backgroundColor: '#143D59',
    marginLeft: 10,
    paddingTop: 20,
  },
  answeredYesQuestion: {
    borderColor: '#006400',
  },
  answeredNoQuestion: {
    borderColor: '#8B0000',
  },
  autoAnsweredQuestion: {
    backgroundColor: '#4682B4',
    borderColor: '#4169E1',
  },
  followUpText: {
    color: 'white',
  },
  answeredText: {
    fontWeight: 'bold',
  },
  autoAnsweredText: {
    fontStyle: 'italic',
  },
  currentQuestion: {
    backgroundColor: 'orange',
    borderColor: '#FFC107',
    paddingTop: 20,
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
  },
  tapToEditText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Rubik-Regular',
    fontStyle: 'italic',
    marginTop: 8,
  },
  progressIndicator: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#143D59',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  backNavButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    paddingVertical: 20,
    borderTopWidth: 1,
    alignSelf: 'center',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontFamily: 'Rubik-Bold',
    marginBottom: 20,
  },
  scoreContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 36,
    fontFamily: 'Rubik-Bold',
  },
  riskLevelText: {
    fontSize: 24,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 20,
  },
  resultDescription: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  criticalWarning: {
    fontSize: 18,
    fontFamily: 'Rubik-Bold',
    color: '#FF6347',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
    padding: 10,
    borderWidth: 2,
    borderColor: '#FF6347',
    borderRadius: 8,
  },
  passengersInfo: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 30,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  startTripButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  startTripButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
  returnButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  returnButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
  boatInfo: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  passengersContainer: {
    marginBottom: 30,
    width: '100%',
  },
  passengersLabel: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 10,
    textAlign: 'center',
  },
  passengersInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  passengerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerButtonText: {
    fontSize: 24,
    fontFamily: 'Rubik-Bold',
  },
  passengerCountContainer: {
    width: 60,
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  tooManyPassengers: {
    backgroundColor: '#FFCCCC',
    borderWidth: 1,
    borderColor: '#FF6347',
  },
  passengerCount: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
  tooManyPassengersText: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  passengerAdjustContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  passengerAdjustTitle: {
    fontSize: 22,
    fontFamily: 'Rubik-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  boatCapacityInfo: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  warningText: {
    color: '#FF6347',
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    width: '80%',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
})
