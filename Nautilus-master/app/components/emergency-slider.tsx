'use client'

import type React from 'react'
import { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Linking,
  Platform,
} from 'react-native'
import { theme } from '../../assets/css/theme'
import { useTheme } from '../context/theme-context'

interface EmergencySliderProps {
  number: string
  label: string
  onSlideComplete: () => void
}

// Slider for making an emergency call
// The user can choose to call either the police or the Kystradio, when in need of help
const EmergencySlider: React.FC<EmergencySliderProps> = ({
  number,
  label,
  onSlideComplete,
}) => {
  const { theme: appTheme } = useTheme()

  const SLIDE_DISTANCE = 200 // measured in pixels further down

  const position = useRef(new Animated.Value(0)).current

  const [callTriggered, setCallTriggered] = useState(false)

  const handleSlideComplete = () => {
    if (callTriggered) return

    setCallTriggered(true)
    onSlideComplete()

    // Press to call the number
    const phoneNumber =
      Platform.OS === 'android' ? `tel:${number}` : `telprompt:${number}`
    Linking.openURL(phoneNumber).catch((err) => {
      console.error('Error opening phone dialer:', err)
    })

    // If not used in full, reset back to starting position
    setTimeout(() => {
      Animated.timing(position, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCallTriggered(false)
      })
    }, 1000)
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => !callTriggered,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gestureState) => {
        const newPosition = Math.max(
          0,
          Math.min(gestureState.dx, SLIDE_DISTANCE)
        )
        position.setValue(newPosition)
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = SLIDE_DISTANCE * 0.9

        if (gestureState.dx >= threshold) {
          Animated.timing(position, {
            toValue: SLIDE_DISTANCE,
            duration: 100,
            useNativeDriver: true,
          }).start(handleSlideComplete)
        } else {
          Animated.spring(position, {
            toValue: 0,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }).start()
        }
      },
    })
  ).current

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={styles.backgroundTrack} />

        <View style={styles.labelContainer}>
          <Text style={[styles.labelText, { color: appTheme.colors.white }]}>
            {label}
          </Text>
        </View>

        <Animated.View
          style={[styles.thumb, { transform: [{ translateX: position }] }]}
          {...panResponder.panHandlers}
        >
          <Text style={styles.thumbText}>{number}</Text>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    marginVertical: 10,
  },
  track: {
    height: 60,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
  },
  labelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  labelText: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.fonts.semiBold,
    textAlign: 'center',
  },
  thumb: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  thumbText: {
    color: theme.colors.white,
    fontSize: 18,
    fontFamily: theme.fonts.bold,
  },
})

export default EmergencySlider
