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

// Course for learning about navigation lights on boats
export default function LanterneCourse() {
  const router = useRouter()
  const { theme } = useTheme()

  const navigationLights = [
    {
      id: 1,
      title: 'Babord side',
      description:
        'Babord (venstre) side av båten viser et rødt lys. Dette er synlig fra babord side og forover.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/babord%20side-ZcvAHvEB6gvOTvWznPyRAD9xtmQGgL.png',
    },
    {
      id: 2,
      title: 'Styrbord side',
      description:
        'Styrbord (høyre) side av båten viser et grønt lys. Dette er synlig fra styrbord side og forover.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/styrbord%20side-hBHymfDNUFyXEQrXR3iVUGyJVB0AJr.png',
    },
    {
      id: 3,
      title: 'Akterlanterne',
      description:
        'Akterenden (bak) av båten viser et hvitt lys. Dette er synlig bakfra.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Akter%20side-vkwIlcCK1zPPDptXIb0XdOLDgsyyol.png',
    },
    {
      id: 4,
      title: 'Topplanterne',
      description:
        'Topplanternen er et hvitt lys som er synlig fra alle retninger. Den er plassert høyere enn sidelanternene.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ovenfra%2C%20retning%20mot%20deg-I8CoiyBudB3Z3yRqBH80VYW5teY9zV.png',
    },
    {
      id: 5,
      title: 'Avstand til nyttetrafikk',
      description:
        'Hold god avstand til større fartøy og nyttetrafikk. Disse har begrenset manøvreringsevne og trenger mer plass.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hold%20god%20avstand%20til%20nyttetrafikk-uUbrVwKbR5HRWGbiCrj5XTJea85oAJ.png',
    },
  ]

  const lanterneRegler = [
    {
      id: 1,
      title: 'Når skal lanternene brukes?',
      description:
        'Lanternene skal være tent fra solnedgang til soloppgang, og i perioder med nedsatt sikt som tåke, kraftig regn eller snø.',
    },
    {
      id: 2,
      title: 'Synlighet',
      description:
        'Lanternene skal være synlige på følgende avstander: Toppanterne: minst 2 nautiske mil. Side- og akterlanterne: minst 1 nautisk mil.',
    },
    {
      id: 3,
      title: 'Tolkning av lanternene',
      description:
        'Ved å observere hvilke lanterne(r) du kan se på et annet fartøy, kan du bestemme fartøyets kurs og posisjon i forhold til deg selv.',
    },
    {
      id: 4,
      title: 'Vikeplikt',
      description:
        'Lanternene hjelper deg å avgjøre hvem som har vikeplikt i ulike situasjoner. For eksempel, hvis du ser både grønt og rødt lys, er båten på kollisjonskurs med deg.',
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
            Lanterner på sjøen
          </Text>
        </View>

        <View style={[styles.imageContainer, { backgroundColor: '#00B567' }]}>
          <Image
            source={{
              uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ba%CC%8Attyper-Gz10Hqwc165YD9iTvXNB9Kc1n1iATV.png',
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
            Dette kurset gir deg kunnskap om lanterner og navigasjonslys på
            sjøen. Du vil lære om de ulike typene lanterner, deres betydning, og
            hvordan du skal tolke dem for sikker navigasjon. Korrekt bruk og
            forståelse av lanterner er avgjørende for å unngå kollisjoner og
            navigere trygt, spesielt i mørket eller ved dårlig sikt.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
            Navigasjonslanterner
          </Text>

          {navigationLights.map((light) => (
            <View
              key={light.id}
              style={[
                styles.ruleCard,
                { backgroundColor: theme.colors.accent },
              ]}
            >
              <View style={styles.ruleImageContainer}>
                <Image
                  source={{ uri: light.image }}
                  style={styles.ruleImage}
                  resizeMode="contain"
                  onError={(e) =>
                    console.log('Image loading error:', e.nativeEvent.error)
                  }
                />
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>{light.title}</Text>
                <Text style={styles.ruleDescription}>{light.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
            Viktige regler om lanterner
          </Text>

          {lanterneRegler.map((rule) => (
            <View
              key={rule.id}
              style={[styles.infoCard, { backgroundColor: '#0E3251' }]}
            >
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: theme.colors.white }]}>
                  {rule.title}
                </Text>
                <Text
                  style={[
                    styles.infoDescription,
                    { color: theme.colors.white },
                  ]}
                >
                  {rule.description}
                </Text>
              </View>
            </View>
          ))}
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
  ruleCard: {
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  ruleImageContainer: {
    height: 200,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  ruleImage: {
    width: '100%',
    height: '100%',
  },
  ruleContent: {
    padding: 16,
  },
  ruleTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    color: 'black',
    marginBottom: 8,
  },
  ruleDescription: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    color: 'black',
    lineHeight: 20,
  },
  infoCard: {
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  infoContent: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    lineHeight: 20,
    opacity: 0.9,
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
