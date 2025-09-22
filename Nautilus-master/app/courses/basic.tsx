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
export default function BasicSeamanship() {
  const router = useRouter()
  const { theme } = useTheme()

  const lessons = [
    {
      id: 1,
      title: 'Grunnleggende sjøregler',
      description: 'Lær de viktigste reglene for sikker ferdsel på sjøen',
      duration: '15 min',
    },
    {
      id: 2,
      title: 'Navigasjon for nybegynnere',
      description: 'Forstå hvordan du leser kart og navigerer trygt',
      duration: '20 min',
    },
    {
      id: 3,
      title: 'Værforhold og sikkerhet',
      description: 'Hvordan tolke værmeldinger og ta trygge beslutninger',
      duration: '18 min',
    },
    {
      id: 4,
      title: 'Nødsituasjoner',
      description: 'Håndtering av uventede situasjoner på sjøen',
      duration: '25 min',
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
            Grunnleggende sjøvett
          </Text>
        </View>

        <View
          style={[
            styles.imageContainer,
            { backgroundColor: theme.colors.accent },
          ]}
        >
          <Image
            source={{
              uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sj%C3%B8vett-QN05obm6zvEtrSSa9oIB8ILKzUdC4o.png',
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
            Dette kurset gir deg grunnleggende kunnskap om sikker ferdsel på
            sjøen. Du vil lære om sjøvettregler, navigasjon, værforhold og
            håndtering av nødsituasjoner. Kurset er perfekt for nybegynnere og
            de som ønsker å friske opp kunnskapene sine.
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
