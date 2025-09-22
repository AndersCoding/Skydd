import * as Font from 'expo-font'

// Fonts used throughout the app
export const FONTS = {
  RUBIK: {
    REGULAR: 'Rubik-Regular',
    SEMI_BOLD: 'Rubik-SemiBold',
    BOLD: 'Rubik-Bold',
    EXTRA_BOLD: 'Rubik-ExtraBold',
  },
}

export async function loadFonts() {
  await Font.loadAsync({
    [FONTS.RUBIK.REGULAR]: require('../fonts/Rubik-Regular.ttf'),
    [FONTS.RUBIK.SEMI_BOLD]: require('../fonts/Rubik-SemiBold.ttf'),
    [FONTS.RUBIK.BOLD]: require('../fonts/Rubik-Bold.ttf'),
    [FONTS.RUBIK.EXTRA_BOLD]: require('../fonts/Rubik-ExtraBold.ttf'),
  })
}
