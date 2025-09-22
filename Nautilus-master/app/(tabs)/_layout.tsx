'use client'

import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text, StyleSheet } from 'react-native'
import { useLanguage } from '../context/language-context'
import { useTheme } from '../context/theme-context'

function TabLabel({
  focused,
  children,
}: {
  focused: boolean
  children: string
}) {
  const { theme } = useTheme()

  return (
    <Text
      style={[
        styles.tabLabel,
        focused
          ? [styles.activeTabLabel, { color: theme.colors.white }]
          : [styles.inactiveTabLabel, { color: theme.colors.accent }],
      ]}
    >
      {children}
    </Text>
  )
}

// Layout for the tabs
export default function TabsLayout() {
  const { t } = useLanguage()
  const { theme } = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.white,
        tabBarInactiveTintColor: theme.colors.accent,
        tabBarStyle: {
          backgroundColor: theme.colors.primary,
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
          height: 92.5,
        },
        tabBarLabel: ({ focused, children }) => (
          <TabLabel focused={focused}>{children as string}</TabLabel>
        ),
      }}
    >
      <Tabs.Screen
        name="education"
        options={{
          title: t.courses,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="home"
        options={{
          title: t.home,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    paddingBottom: 12,
    fontFamily: 'Rubik-Regular',
  },
  activeTabLabel: {
    fontFamily: 'Rubik-SemiBold',
  },
  inactiveTabLabel: {},
})
