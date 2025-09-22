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
export default function Navigation() {
  const router = useRouter()
  const { theme } = useTheme()

  const navigationRules = [
    {
      id: 1,
      title: 'Motsatte kurser',
      description:
        'Når to maskindrevne fartøy styrer motsatte eller nesten motsatte kurser og at det kan oppstå fare for sammenstøt, skal begge vike til styrbord så de kan passere hverandre på babord side.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/motsatte-kurser-IiR4r2meomSNdoV0nuajDQhdV3NKt0.png',
    },
    {
      id: 2,
      title: 'Innhenting',
      description:
        'Et hvilket som helst fartøy som innhenter et annet fartøy, skal holde av veien for det fartøyet som blir innhentet.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Innhente-iclQ7YJcb2y7MKQEppHXNznSZY7XaT.png',
    },
    {
      id: 3,
      title: 'Kryssende kurser',
      description:
        'Når to maskindrevne fartøy styrer kurser som krysser hverandre på en slik måte at det kan oppstå fare for sammenstøt, skal det fartøyet som har det andre på sin styrbord side holde av veien, og unngå å gå forenom det andre fartøyet.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kryssende-ZxkcIROJaeQ5Nlm2cT5HOPQjKL92YF.png',
    },
    {
      id: 4,
      title: 'Trange løp',
      description:
        'Et fartøy som seiler i en trang lei eller et trangt løp skal, når det lar seg gjøre uten fare, holde seg så nær som mulig til den av leias eller løpets yttergrense som det har på sin styrbords side.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kanal-4HO9OdzaswNVJIHK63Fy5TX1Z2X1Gz.png',
    },
    {
      id: 5,
      title: 'Fiskefartøy',
      description:
        'Et maskindrevet fartøy skal holde av veien for et fartøy som holder på med å fiske.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fiske-q49b2Vx913VZi12GwrNGDSgZmPy34h.png',
    },
    {
      id: 6,
      title: 'Lystfartøy og nyttetrafikk',
      description:
        'Lystfartøy og åpne båter som drives frem med årer, seil eller maskin, skal holde av veien for større fartøy, rutegående ferger og annen nyttetrafikk.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/st%C3%B8rre-fart%C3%B8y-o3y4oYMun8JQoVQK730dnxPn1FWDxA.png',
    },
    {
      id: 7,
      title: 'Seil og motor',
      description:
        'Et maskindrevet fartøy skal holde av veien for et seilfartøy, men hvis seilfartøyet har større fart og innhenter det maskindreven fartøyet, skal seilfartøyet holde av veien for det maskindrevne fartøyet.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kryssende-seilba%CC%8At-CQ2XPVJGqgHNDx6n6llvckDzbBuhJ8.png',
    },
    {
      id: 8,
      title: 'Seilfartøy med vind fra forskjellig side',
      description:
        'Når to seilfartøy fartøy seiler med vinden inn på forskjellig side, skal det fartøy som har vinden inn om babord, holde av veien for det andre.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/seilba%CC%8At-medvind-xJMSQnD5RrgF7R3nffaT7c917Bp2wE.png',
    },
    {
      id: 9,
      title: 'Seilfartøy med vind fra samme side',
      description:
        'Når begge seilfartøyene seiler med vinden inn på samme side, skal det fartøy som er nærmest opp i vinden, holde av veien for det som er i le.',
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/seilba%CC%8At-medvind2-TSB1R7Q4EM3aEchV2PpjzqwaUDcCDJ.png',
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
            Navigasjon på sjøen
          </Text>
        </View>

        <View style={[styles.imageContainer, { backgroundColor: '#0085B5' }]}>
          <Image
            source={{
              uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/navigasjon-lIWTautKChv1TDSIWIG6PuJBqZz3yc.png',
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
            Dette kurset gir deg kunnskap om navigasjon på sjøen. Du vil lære om
            kompass, sjøkart, GPS og andre navigasjonsverktøy. Kurset dekker
            både tradisjonelle metoder og moderne elektronisk navigasjon, og gir
            deg ferdighetene du trenger for å navigere trygt under ulike
            forhold.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
            Vikeregler på sjøen
          </Text>

          {navigationRules.map((rule) => (
            <View
              key={rule.id}
              style={[
                styles.ruleCard,
                { backgroundColor: theme.colors.accent },
              ]}
            >
              <View style={styles.ruleImageContainer}>
                <Image
                  source={{ uri: rule.image }}
                  style={styles.ruleImage}
                  resizeMode="contain"
                  onError={(e) =>
                    console.log('Image loading error:', e.nativeEvent.error)
                  }
                />
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleDescription}>{rule.description}</Text>
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
    height: 120,
    width: '100%',
    backgroundColor: '#0085B5',
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
})
