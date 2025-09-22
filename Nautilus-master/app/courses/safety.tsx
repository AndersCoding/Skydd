'use client'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/theme-context'

// Courses for the user to learn more about safety at sea, as wanted
// by Nautilus. They will later provide URL to the correct course
export default function Safety() {
  const router = useRouter()
  const { theme } = useTheme()

  const lessons = [
    {
      id: 1,
      title: 'Sikkerhetsutstyr',
      description: 'Nødvendig sikkerhetsutstyr for båtliv',
      duration: '18 min',
    },
    {
      id: 2,
      title: 'Nødprosedyrer',
      description: 'Hva du skal gjøre i nødsituasjoner',
      duration: '22 min',
    },
    {
      id: 3,
      title: 'Førstehjelp til sjøs',
      description: 'Grunnleggende førstehjelp for båtbrukere',
      duration: '25 min',
    },
    {
      id: 4,
      title: 'Redningsaksjoner',
      description: 'Hvordan gjennomføre og delta i redningsaksjoner',
      duration: '20 min',
    },
  ]

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
            Sikkerhet på sjøen
          </Text>
        </View>

        <View style={[styles.imageContainer, { backgroundColor: '#B50027' }]}>
          <Image
            source={{
              uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sikkerhet-ZvsoHtlU8fPdfQEgd5Ucz0sutqogi6.png',
            }}
            style={styles.courseImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
            Om kurset
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.white }]}>
            Dette kurset fokuserer på sikkerhet til sjøs. Du vil lære om
            nødvendig sikkerhetsutstyr, nødprosedyrer, førstehjelp og
            redningsaksjoner. Kurset gir deg kunnskapen du trenger for å
            forebygge ulykker og handle riktig hvis noe skulle skje på sjøen.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
            Leksjoner
          </Text>

          {lessons.map((lesson) => (
            <Pressable
              key={lesson.id}
              style={[
                styles.lessonCard,
                { backgroundColor: theme.colors.accent },
              ]}
              onPress={() => console.log(`Navigate to lesson ${lesson.id}`)}
            >
              <View style={styles.lessonContent}>
                <View>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDescription}>
                    {lesson.description}
                  </Text>
                </View>
                <View style={styles.lessonMeta}>
                  <Text style={styles.lessonDuration}>
                    <Ionicons name="time-outline" size={14} color="black" />{' '}
                    {lesson.duration}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="black" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.startButton,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={() => console.log('Start first lesson')}
          >
            <Text
              style={[styles.startButtonText, { color: theme.colors.white }]}
            >
              START KURS
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Rubik-Bold',
    marginLeft: 10,
  },
  imageContainer: {
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    lineHeight: 22,
  },
  lessonCard: {
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  lessonContent: {
    padding: 16,
  },
  lessonTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    color: 'black',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    color: 'black',
    opacity: 0.8,
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  lessonDuration: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    color: 'black',
    opacity: 0.7,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 20,
    fontFamily: 'Rubik-Bold',
  },
})
