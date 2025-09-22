'use client'

import { useEffect, useState } from 'react'
import { StyleSheet, View, Alert, Pressable } from 'react-native'
import MapView, { Marker, type Region } from 'react-native-maps'
import * as Location from 'expo-location'
import { useRouter, usePathname } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/theme-context'

interface MapProps {
  isPreview?: boolean
}

export default function Map({ isPreview = false }: MapProps) {
  const [location, setLocation] = useState<Region | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useTheme()

  const isMapPage = pathname === '/pages/map'

  // Request location permission and get the users current location when opening app
  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Allow location access to use the map.'
        )
        return
      }

      // Get the users current location with Expos Location API
      const userLocation = await Location.getCurrentPositionAsync({})
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      })
    })()
  }, [])

  const goToHome = () => {
    router.push('../home')
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={location || undefined}
        showsUserLocation={true}
        scrollEnabled={!isPreview}
        zoomEnabled={!isPreview}
        rotateEnabled={!isPreview}
        pitchEnabled={!isPreview}
      >
        {location && <Marker coordinate={location} title="You are here" />}
      </MapView>

      {!isPreview && (
        <Pressable
          style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
          onPress={goToHome}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 15,
  },
})
