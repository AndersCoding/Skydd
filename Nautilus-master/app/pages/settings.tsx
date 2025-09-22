'use client'

import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Modal,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useLanguage } from '../context/language-context'
import { useTheme } from '../context/theme-context'

// Settings page
export default function Settings() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    pushNotifications: false,
    weatherAlerts: false,
  })
  const { language, setLanguage, t } = useLanguage()
  const {
    theme,
    isDarkMode,
    isColorBlindMode,
    toggleDarkMode,
    toggleColorBlindMode,
  } = useTheme()
  const [languageModalVisible, setLanguageModalVisible] = useState(false)

  const toggleSetting = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  // Language options
  const languages = [
    { label: 'Norsk', value: 'no' as const },
    { label: 'English', value: 'en' as const },
    { label: 'Svenska', value: 'sv' as const },
  ]

  const getLanguageLabel = (value: string) => {
    const lang = languages.find((l) => l.value === value)
    return lang ? lang.label : 'Norsk'
  }

  // Function to select which language to use
  const handleLanguageChange = (langValue: string) => {
    setLanguage(langValue as any)
    setLanguageModalVisible(false)
  }

  const colorBlindModeTranslations = {
    en: 'Color Blind Mode',
    no: 'Fargeblindmodus',
    sv: 'Färgblindläge',
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.primary }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
          {t.settings}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
            {t.notifications}
          </Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: '#9BA5B7' }]}>
              {t.pushNotifications}
            </Text>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => toggleSetting('pushNotifications')}
              trackColor={{ false: '#767577', true: theme.colors.accent }}
              thumbColor={theme.colors.white}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: '#9BA5B7' }]}>
              {t.weatherAlerts}
            </Text>
            <Switch
              value={settings.weatherAlerts}
              onValueChange={() => toggleSetting('weatherAlerts')}
              trackColor={{ false: '#767577', true: theme.colors.accent }}
              thumbColor={theme.colors.white}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
            {t.accessibility}
          </Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: '#9BA5B7' }]}>
              {t.darkMode}
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#767577', true: theme.colors.accent }}
              thumbColor={theme.colors.white}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: '#9BA5B7' }]}>
              {
                colorBlindModeTranslations[
                  language as keyof typeof colorBlindModeTranslations
                ]
              }
            </Text>
            <Switch
              value={isColorBlindMode}
              onValueChange={toggleColorBlindMode}
              trackColor={{ false: '#767577', true: theme.colors.accent }}
              thumbColor={theme.colors.white}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.white }]}>
            {t.language}
          </Text>
          <TouchableOpacity
            style={[
              styles.languageSelector,
              { backgroundColor: theme.colors.accent },
            ]}
            onPress={() => setLanguageModalVisible(true)}
          >
            <Text
              style={[
                styles.languageSelectorText,
                { color: theme.colors.primary },
              ]}
            >
              {getLanguageLabel(language)}
            </Text>
            <Ionicons
              name="chevron-down"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.white }]}>
              {t.language || 'Velg språk'}
            </Text>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.value}
                style={[
                  styles.languageOption,
                  { backgroundColor: theme.colors.white },
                  language === lang.value && [
                    styles.selectedLanguageOption,
                    { backgroundColor: theme.colors.secondary },
                  ],
                ]}
                onPress={() => handleLanguageChange(lang.value)}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    { color: theme.colors.primary },
                    language === lang.value && [
                      styles.selectedLanguageOptionText,
                      { color: theme.colors.white },
                    ],
                  ]}
                >
                  {lang.label}
                </Text>
                {language === lang.value && (
                  <Ionicons
                    name="checkmark"
                    size={24}
                    color={theme.colors.white}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Rubik-SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
  },
  languageSelector: {
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageSelectorText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedLanguageOption: {},
  languageOptionText: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
  },
  selectedLanguageOptionText: {
    fontFamily: 'Rubik-SemiBold',
  },
})
