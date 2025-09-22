'use client'

import { useEffect, useState, useRef } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native'
import MapView, { Marker, type Region } from 'react-native-maps'
import * as Location from 'expo-location'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SOSOverlay from '../components/sos-overlay'
import { sendSms } from '@/services/sms-service'
import ContactSelectionOverlay from '../components/contact-selection'
import { useTheme } from '../context/theme-context'
import { useLanguage } from '../context/language-context'

// This is for the weather API
// IMPORTANT: You MUST update this with your app name and contact information!
// I.E "AppName/1.0 name@emailservice.com"
const USER_AGENT = 'Nautilus/1.0 max.d.finanger@gmail.com'

export default function OngoingTrip() {
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [showContactOverlay, setShowContactOverlay] = useState(false)
  const STORAGE_KEY = 'emergency_contacts'
  interface Contact {
    id: string
    name: string
    phone: string
    relationship: string
  }

  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([])

  const router = useRouter()
  const { boatId, boatName } = useLocalSearchParams<{
    boatId: string
    boatName: string
  }>()
  const [location, setLocation] = useState<Region | null>(null)
  const [locationName, setLocationName] = useState(t.loading || 'Laster...')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [weather, setWeather] = useState({
    temp: 0,
    condition: t.loading || 'Laster...',
    windSpeed: 0,
    windDirection: '',
    humidity: 0,
  })
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const startTimeRef = useRef(Date.now())
  const timerRef = useRef<number | null>(null)
  const [sosOverlayVisible, setSOSOverlayVisible] = useState(false)

  const formatElapsedTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}${t.hourShort || 't'} ${remainingMinutes}${t.minuteShort || 'm'}`
    } else {
      return `${minutes}${t.minuteShort || 'm'}`
    }
  }

  // Fetch weather data from the API
  const fetchWeatherData = async (
    lat: number,
    lon: number,
    altitude?: number
  ) => {
    try {
      setIsLoadingWeather(true)

      const cacheKey = `weather_${lat.toFixed(4)}_${lon.toFixed(4)}`

      const cachedData = await AsyncStorage.getItem(cacheKey)
      let lastModified = null
      let cachedWeather = null

      if (cachedData) {
        const parsedCache = JSON.parse(cachedData)
        const expiresAt = new Date(parsedCache.expires)

        if (expiresAt > new Date()) {
          setWeather(parsedCache.data)
          setIsLoadingWeather(false)
          return
        }

        lastModified = parsedCache.lastModified
        cachedWeather = parsedCache.data
      }

      // Address of the weather API to be feched with the users location to start with
      let url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`

      if (altitude) {
        url += `&altitude=${Math.round(altitude)}`
      }

      const headers: HeadersInit = {
        'User-Agent': USER_AGENT,
      }

      if (lastModified) {
        headers['If-Modified-Since'] = lastModified
      }

      console.log('Fetching weather from:', url)
      console.log('With headers:', headers)

      const response = await fetch(url, { headers })

      console.log('Response status:', response.status)

      if (response.status === 304 && cachedWeather) {
        setWeather(cachedWeather)
        setIsLoadingWeather(false)
        return
      }

      if (response.status === 403) {
        console.error(
          '403 Forbidden: Check your User-Agent header. Make sure to update the USER_AGENT constant with your app name and email.'
        )
        throw new Error(
          '403 Forbidden: Invalid User-Agent. Update USER_AGENT with your app name and email.'
        )
      }

      if (response.status !== 200 && response.status !== 203) {
        throw new Error(`Weather API returned status ${response.status}`)
      }

      const data = await response.json()

      const currentData = data.properties.timeseries[0]
      const details = currentData.data.instant.details
      const nextHour = currentData.data.next_1_hours

      const weatherData = {
        temp: Math.round(details.air_temperature),
        condition:
          nextHour && nextHour.summary
            ? translateWeatherSymbol(nextHour.summary.symbol_code)
            : t.unknown || 'Ukjent',
        windSpeed: Math.round(details.wind_speed),
        windDirection: getWindDirection(details.wind_from_direction),
        humidity: Math.round(details.relative_humidity),
      }

      const expires = response.headers.get('Expires')
      const lastModifiedHeader = response.headers.get('Last-Modified')

      if (expires && lastModifiedHeader) {
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: weatherData,
            expires,
            lastModified: lastModifiedHeader,
          })
        )
      }

      setWeather(weatherData)
    } catch (error) {
      console.error('Error fetching weather:', error)
      setWeather({
        temp: 0,
        condition: t.notAvailable || 'Ikke tilgjengelig',
        windSpeed: 0,
        windDirection: '',
        humidity: 0,
      })
    } finally {
      setIsLoadingWeather(false)
    }
  }

  // Translate weather symbols to where the user is located
  const translateWeatherSymbol = (symbolCode: string): string => {
    const symbolToTranslationKey: Record<string, keyof typeof t> = {
      clearsky_day: 'clear',
      clearsky_night: 'clear',
      clearsky_polartwilight: 'clear',
      fair_day: 'partlyCloudy',
      fair_night: 'partlyCloudy',
      fair_polartwilight: 'partlyCloudy',
      partlycloudy_day: 'partlyCloudy',
      partlycloudy_night: 'partlyCloudy',
      partlycloudy_polartwilight: 'partlyCloudy',
      cloudy: 'cloudy',
      rainshowers_day: 'rainShowers',
      rainshowers_night: 'rainShowers',
      rainshowers_polartwilight: 'rainShowers',
      rainshowersandthunder_day: 'rainShowersAndThunder',
      rainshowersandthunder_night: 'rainShowersAndThunder',
      rainshowersandthunder_polartwilight: 'rainShowersAndThunder',
      sleetshowers_day: 'sleetShowers',
      sleetshowers_night: 'sleetShowers',
      sleetshowers_polartwilight: 'sleetShowers',
      snowshowers_day: 'snowShowers',
      snowshowers_night: 'snowShowers',
      snowshowers_polartwilight: 'snowShowers',
      rain: 'rain',
      heavyrain: 'heavyRain',
      heavyrainandthunder: 'heavyRainAndThunder',
      sleet: 'sleet',
      snow: 'snow',
      snowandthunder: 'snowAndThunder',
      fog: 'fog',
      sleetshowersandthunder_day: 'sleetShowersAndThunder',
      sleetshowersandthunder_night: 'sleetShowersAndThunder',
      sleetshowersandthunder_polartwilight: 'sleetShowersAndThunder',
      snowshowersandthunder_day: 'snowShowersAndThunder',
      snowshowersandthunder_night: 'snowShowersAndThunder',
      snowshowersandthunder_polartwilight: 'snowShowersAndThunder',
      rainandthunder: 'rainAndThunder',
      sleetandthunder: 'sleetAndThunder',
      lightrainshowersandthunder_day: 'lightRainShowersAndThunder',
      lightrainshowersandthunder_night: 'lightRainShowersAndThunder',
      lightrainshowersandthunder_polartwilight: 'lightRainShowersAndThunder',
      heavyrainshowersandthunder_day: 'heavyRainShowersAndThunder',
      heavyrainshowersandthunder_night: 'heavyRainShowersAndThunder',
      heavyrainshowersandthunder_polartwilight: 'heavyRainShowersAndThunder',
      lightssleetshowersandthunder_day: 'lightSleetShowersAndThunder',
      lightssleetshowersandthunder_night: 'lightSleetShowersAndThunder',
      lightssleetshowersandthunder_polartwilight: 'lightSleetShowersAndThunder',
      heavysleetshowersandthunder_day: 'heavySleetShowersAndThunder',
      heavysleetshowersandthunder_night: 'heavySleetShowersAndThunder',
      heavysleetshowersandthunder_polartwilight: 'heavySleetShowersAndThunder',
      lightsnowshowersandthunder_day: 'lightSnowShowersAndThunder',
      lightsnowshowersandthunder_night: 'lightSnowShowersAndThunder',
      lightsnowshowersandthunder_polartwilight: 'lightSnowShowersAndThunder',
      heavysnowshowersandthunder_day: 'heavySnowShowersAndThunder',
      heavysnowshowersandthunder_night: 'heavySnowShowersAndThunder',
      heavysnowshowersandthunder_polartwilight: 'heavySnowShowersAndThunder',
      lightrainandthunder: 'lightRainAndThunder',
      lightsleetandthunder: 'lightSleetAndThunder',
      heavysleetandthunder: 'heavySleetAndThunder',
      lightsnowandthunder: 'lightSnowAndThunder',
      heavysnowandthunder: 'heavySnowAndThunder',
      lightrain: 'lightRain',
      lightsleet: 'lightSleet',
      heavysleet: 'heavySleet',
      lightsnow: 'lightSnow',
      heavysnow: 'heavySnow',
      lightrainshowers_day: 'lightRainShowers',
      lightrainshowers_night: 'lightRainShowers',
      lightrainshowers_polartwilight: 'lightRainShowers',
      heavyrainshowers_day: 'heavyRainShowers',
      heavyrainshowers_night: 'heavyRainShowers',
      heavyrainshowers_polartwilight: 'heavyRainShowers',
      lightsleetshowers_day: 'lightSleetShowers',
      lightsleetshowers_night: 'lightSleetShowers',
      lightsleetshowers_polartwilight: 'lightSleetShowers',
      heavysleetshowers_day: 'heavySleetShowers',
      heavysleetshowers_night: 'heavySleetShowers',
      heavysleetshowers_polartwilight: 'heavySleetShowers',
      lightsnowshowers_day: 'lightSnowShowers',
      lightsnowshowers_night: 'lightSnowShowers',
      lightsnowshowers_polartwilight: 'lightSnowShowers',
      heavysnowshowers_day: 'heavySnowShowers',
      heavysnowshowers_night: 'heavySnowShowers',
      heavysnowshowers_polartwilight: 'heavySnowShowers',
    }

    const translationKey = symbolToTranslationKey[symbolCode]

    return translationKey && t[translationKey] ? t[translationKey] : symbolCode
  }

  // Convert wind direction in degrees to compass direction
  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV']
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert(
            t.permissionDenied || 'Tillatelse avslått',
            t.locationPermissionNeeded ||
              'Vi trenger tilgang til din posisjon for å spore turen din.'
          )
          return
        }

        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        })

        updateLocation(initialLocation)

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          updateLocation
        )

        startTimeRef.current = Date.now()
        timerRef.current = setInterval(() => {
          setElapsedTime(Date.now() - startTimeRef.current)
        }, 60000)
      } catch (error) {
        console.error('Error starting location tracking:', error)
        Alert.alert(
          t.error || 'Feil',
          t.locationTrackingError || 'Kunne ikke starte posisjonssporing.'
        )
      }
    }

    // Update the UI with the users current location
    const updateLocation = async (location: Location.LocationObject) => {
      const { latitude, longitude, altitude } = location.coords

      setLocation({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      })

      fetchWeatherData(latitude, longitude, altitude || undefined)

      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        })

        if (reverseGeocode.length > 0) {
          const { name, city, region } = reverseGeocode[0]
          setLocationName(
            name || city || region || t.unknownLocation || 'Ukjent sted'
          )
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error)
      }
    }

    startLocationTracking()

    return () => {
      if (locationSubscription) {
        locationSubscription.remove()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [t])

  // Send the users location to the selected contact with a SMS.
  // Will only work if the users has saved contacts int the app
  const sendLocation = async () => {
    if (!location) {
      Alert.alert(
        t.error || 'Feil',
        t.noLocationAvailable || 'Ingen lokasjon tilgjengelig'
      )
      return
    }

    const storedContacts = await AsyncStorage.getItem(STORAGE_KEY)
    if (storedContacts) {
      setEmergencyContacts(JSON.parse(storedContacts))
    }
    setShowContactOverlay(true)
  }

  // Select users from list of stored contacts, and send a predefined message
  // with the users location, time and a link to Google Maps
  const handleContactSelect = async (contact: Contact) => {
    setShowContactOverlay(false)
    const currentTime = new Date()
    const formattedTime = currentTime.toLocaleTimeString('no-NO')
    const message = `${t.helloHereIsMyLocation || 'Hei, her er min lokasjon'}:
${t.latitude || 'Breddegrad'}: ${location?.latitude}
${t.longitude || 'Lengdegrad'}: ${location?.longitude}
${t.time || 'Tidspunkt'}: ${formattedTime}
https://maps.google.com/?q=${location?.latitude},${location?.longitude}`
    await sendSms(contact.phone, message)
  }

  const handleSOS = () => {
    setSOSOverlayVisible(true)
  }

  // Function to end the trip and navigate to the end trip page, along with
  // the possibility to send a message to the users contacts notifiying of ended trip
  const handleEndTrip = () => {
    Alert.alert(
      t.endTrip || 'Avslutt tur',
      t.confirmEndTrip || 'Er du sikker på at du vil avslutte turen?',
      [
        { text: t.cancel || 'Avbryt', style: 'cancel' },
        {
          text: t.end || 'Avslutt',
          onPress: () => {
            router.push('/pages/end-trip')
          },
        },
      ]
    )
  }

  // Function to get the weather icon based on the weather condition
  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase()
    if (condition.includes('klart') || condition.includes('clear')) {
      return 'sunny'
    } else if (
      condition.includes('skyet') ||
      condition.includes('lettskyet') ||
      condition.includes('cloudy') ||
      condition.includes('partly')
    ) {
      return 'partly-sunny'
    } else if (condition.includes('regn') || condition.includes('rain')) {
      return 'rainy'
    } else if (condition.includes('torden') || condition.includes('thunder')) {
      return 'thunderstorm'
    } else if (
      condition.includes('snø') ||
      condition.includes('sludd') ||
      condition.includes('snow') ||
      condition.includes('sleet')
    ) {
      return 'snow'
    } else if (condition.includes('tåke') || condition.includes('fog')) {
      return 'cloud'
    } else {
      return 'partly-sunny'
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.primary }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
          {boatName || t.ongoingTrip || 'Underveis 2.0'}
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={location || undefined}
          showsUserLocation={true}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={t.yourPosition || 'Din posisjon'}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker} />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={[styles.infoCard, { backgroundColor: '#0E3251' }]}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="navigate" size={20} color={theme.colors.white} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: '#9BA5B7' }]}>
                {t.location || 'Plassering'}
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.white }]}>
                {locationName}
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#0E3251' }]}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="time" size={20} color={theme.colors.white} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: '#9BA5B7' }]}>
                {t.time || 'Tid'}
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.white }]}>
                {formatElapsedTime(elapsedTime)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={[styles.infoCard, { backgroundColor: '#0E3251' }]}>
            <View style={styles.infoIconContainer}>
              <Ionicons
                name={getWeatherIcon()}
                size={20}
                color={theme.colors.white}
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: '#9BA5B7' }]}>
                {t.weather || 'Vær'}
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.white }]}>
                {isLoadingWeather
                  ? t.loading || 'Laster...'
                  : `${weather.condition} | ${weather.temp}°C`}
              </Text>
              <Text
                style={[styles.infoValueSmall, { color: theme.colors.white }]}
              >
                {!isLoadingWeather &&
                  `${t.wind || 'Vind'}: ${weather.windSpeed} m/s ${weather.windDirection}`}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
            <Text style={[styles.sosButtonText, { color: theme.colors.white }]}>
              SOS
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.sendLocationButton,
          { backgroundColor: theme.colors.accent },
        ]}
        onPress={sendLocation}
      >
        <Text
          style={[
            styles.sendLocationButtonText,
            { color: theme.colors.primary },
          ]}
        >
          {t.sendMyLocation || 'Send min lokasjon'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.endTripButton,
          { backgroundColor: theme.colors.secondary },
        ]}
        onPress={handleEndTrip}
      >
        <Text style={[styles.endTripButtonText, { color: theme.colors.white }]}>
          {t.endTrip || 'Avslutt tur'}
        </Text>
      </TouchableOpacity>
      <SOSOverlay
        visible={sosOverlayVisible}
        onClose={() => setSOSOverlayVisible(false)}
      />
      {showContactOverlay && (
        <ContactSelectionOverlay
          visible={showContactOverlay}
          contacts={emergencyContacts}
          onSelect={handleContactSelect}
          onClose={() => setShowContactOverlay(false)}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 10,
    margin: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  infoContainer: {
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoCard: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  infoValueSmall: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
    marginTop: 2,
  },
  sosButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButtonText: {
    fontSize: 24,
    fontFamily: 'Rubik-Bold',
  },
  endTripButton: {
    borderRadius: 25,
    padding: 16,
    margin: 10,
    alignItems: 'center',
  },
  endTripButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
  sendLocationButton: {
    borderRadius: 25,
    padding: 16,
    margin: 10,
    alignItems: 'center',
  },
  sendLocationButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
})
