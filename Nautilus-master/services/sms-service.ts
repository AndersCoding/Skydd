import { Linking, Alert } from 'react-native'

// Function to send an SMS using the users physical device
export const sendSms = async (phone: string, message: string) => {
  const url = `sms:${phone}?body=${encodeURIComponent(message)}`
  try {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      Alert.alert('Feil', 'SMS-funksjonaliteten støttes ikke på denne enheten.')
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    Alert.alert('Feil', 'Kunne ikke sende SMS.')
  }
}

// Update the sendSafetyTestSms function to accept the full translations object
export const sendSafetyTestSms = async (
  phoneNumber: string,
  finalRiskScore: number,
  passengers: number,
  t: any,
  noAnswers: string[]
) => {
  const noAnswersText =
    noAnswers.length > 0
      ? `\n\nPunkter du svarte nei på:\n- ${noAnswers.join('\n- ')}`
      : ''

  const message = `${t.safetyTestComplete || 'Safety test completed'}.\n${t.riskAssessment || 'Risk Assessment'}: ${finalRiskScore}\n${t.numberOfPeopleOnboard || 'Number of people onboard'}: ${passengers}${noAnswersText}`


  try {
    await sendSms(phoneNumber, message)
  } catch (error) {
    console.error('Feil ved sending av sikkerhetstest-SMS:', error)
    alert(t.smsSendError || 'Det oppstod en feil ved sending av SMS.')
  }
}
