'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { loadFonts } from '../../assets/fonts/fonts'
import { theme } from '../../assets/css/theme'

const OriginalText = Text

export const StyledText: React.FC<React.ComponentProps<typeof Text>> = ({
  style,
  ...props
}) => {
  const fontFamily = theme.fonts.regular
  return <OriginalText style={[{ fontFamily }, style]} {...props} />
}

interface StyleProviderProps {
  children: React.ReactNode
}

// Universal style provider for the apps font
export const StyleProvider: React.FC<StyleProviderProps> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts()
        setFontsLoaded(true)
      } catch (e) {
        console.warn('Error loading fonts:', e)
        setFontsLoaded(true)
      }
    }

    prepare()
  }, [])

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer} />
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
})

export default StyleProvider
