'use client'

import type React from 'react'
import { createContext, useState, useContext, useEffect } from 'react'
import { theme as defaultTheme } from '../../assets/css/theme'

type ThemeMode = 'default' | 'dark' | 'colorBlind'

interface ThemeContextProps {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  theme: typeof defaultTheme
  isDarkMode: boolean
  isColorBlindMode: boolean
  toggleDarkMode: () => void
  toggleColorBlindMode: () => void
}

const ThemeContext = createContext<ThemeContextProps>({
  themeMode: 'default',
  setThemeMode: () => {},
  theme: defaultTheme,
  isDarkMode: false,
  isColorBlindMode: false,
  toggleDarkMode: () => {},
  toggleColorBlindMode: () => {},
})

// Context file for managing the darkmode theme in the app
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('default')
  const [theme, setTheme] = useState(defaultTheme)

  const isDarkMode = themeMode === 'dark'
  const isColorBlindMode = themeMode === 'colorBlind'

  const toggleDarkMode = () => {
    setThemeMode(isDarkMode ? 'default' : 'dark')
  }

  const toggleColorBlindMode = () => {
    setThemeMode(isColorBlindMode ? 'default' : 'colorBlind')
  }

  useEffect(() => {
    let updatedTheme = { ...defaultTheme }

    if (themeMode === 'dark') {
      updatedTheme = {
        ...updatedTheme,
        colors: {
          ...updatedTheme.colors,
          primary: '#000000',
          secondary: '#f2a15f',
          accent: '#4a6c8c',
          white: '#ffffff',
        },
      }
    } else if (themeMode === 'colorBlind') {
      updatedTheme = {
        ...updatedTheme,
        colors: {
          ...updatedTheme.colors,
          primary: '#0b2c41',
          secondary: '#f5c242',
          accent: '#ffffff',
          success: '#00b894',
          warning: '#0984e3',
          failure: '#636e72',
        },
      }
    }

    setTheme(updatedTheme)
  }, [themeMode])

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        theme,
        isDarkMode,
        isColorBlindMode,
        toggleDarkMode,
        toggleColorBlindMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export default ThemeProvider
