'use client'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useLanguage } from '../context/language-context'
import { useTheme } from '../context/theme-context'

// Display courses the user can take to increase their knowledge of safety at sea
export default function Education() {
  const router = useRouter()
  const { t } = useLanguage()
  const { theme } = useTheme()

  const courses: {
    id: number
    titleKey: keyof typeof t
    image: string
    route: string
    backgroundColor: string
  }[] = [
    /*{
      id: 1,
      titleKey: 'basicSeamanship',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sj%C3%B8vett-QN05obm6zvEtrSSa9oIB8ILKzUdC4o.png',
      route: '/courses/basic',
      backgroundColor: '#1E3A56',
    },*/
    {
      id: 2,
      titleKey: 'navigationAtSea',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/navigasjon-lIWTautKChv1TDSIWIG6PuJBqZz3yc.png',
      route: '/courses/navigation',
      backgroundColor: '#0085B5',
    },
    {
      id: 3,
      titleKey: 'lanternAtSea',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ba%CC%8Attyper-Gz10Hqwc165YD9iTvXNB9Kc1n1iATV.png',
      route: '/courses/boats',
      backgroundColor: '#00B567',
    },
    /*
    {
      id: 4,
      titleKey: 'safetyAtSea',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sikkerhet-ZvsoHtlU8fPdfQEgd5Ucz0sutqogi6.png',
      route: '/courses/safety',
      backgroundColor: '#B50027',
    },*/
  ]

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
          {t.courses}
        </Text>

        <View style={styles.courseList}>
          {courses.map((course) => (
            <Pressable
              key={course.id}
              style={[
                styles.courseCard,
                { backgroundColor: course.backgroundColor },
              ]}
              onPress={() => router.push(course.route as any)}
            >
              <View style={styles.courseContent}>
                <Image
                  source={{ uri: course.image }}
                  style={styles.courseImage}
                  resizeMode="contain"
                />
                <Text
                  style={[styles.courseTitle, { color: theme.colors.white }]}
                >
                  {t[course.titleKey]}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Rubik-Bold',
    marginTop: 50,
    marginBottom: 20,
    textAlign: 'center',
  },
  courseList: {
    gap: 16,
    marginTop: 10,
  },
  courseCard: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  courseContent: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
  },
  courseImage: {
    width: '100%',
    height: 100,
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    textAlign: 'center',
  },
})
