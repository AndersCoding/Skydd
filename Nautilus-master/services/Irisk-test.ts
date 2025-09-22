export type RiskQuestion = {
  questionKey: string // Key for translation
  calculateRisk: (answer: boolean) => number
  followUpQuestion?: RiskQuestion[]
  isPassengerQuestion?: boolean
  isLicenseQuestion?: boolean
}

// The list of questions, along with risk-score, used in the risk test
// Questions are provided by Nautilus
export const riskQuestions: RiskQuestion[] = [
  {
    questionKey: 'areThereMorePeopleOnboard',
    calculateRisk: (answer: boolean) => (answer ? 0 : 0),
    isPassengerQuestion: true,
  },
  {
    questionKey: 'haveYouReportedWhereYouAreGoing',
    calculateRisk: (answer) => (answer ? 0 : 1),
  },
  {
    questionKey: 'doesEveryoneHaveLifeJackets',
    calculateRisk: (answer) => (answer ? 0 : 2),
  },
  {
    questionKey: 'doYouKnowWhoToCallForHelp',
    calculateRisk: (answer) => (answer ? 0 : 2),
  },
  {
    questionKey: 'haveYouCheckedWeatherForecast',
    calculateRisk: (answer) => (answer ? 0 : 1),
  },
  {
    questionKey: 'doYouHaveEnoughPhoneBattery',
    calculateRisk: (answer) => (answer ? 0 : 1),
  },
  {
    questionKey: 'doYouHaveWaterOnboard',
    calculateRisk: (answer) => (answer ? 0 : 1),
  },
  {
    questionKey: 'isThereEnoughFuel',
    calculateRisk: (answer) => (answer ? 0 : 2),
  },
  {
    questionKey: 'doYouKnowWhatToDoIfEngineStops',
    calculateRisk: (answer) => (answer ? 0 : 2),
  },
  {
    questionKey: 'doYouKnowWhatToDoIfSomeoneOverboard',
    calculateRisk: (answer) => (answer ? 0 : 3),
  },
  {
    questionKey: 'doYouKnowWhatToDoIfFireOnboard',
    calculateRisk: (answer) => (answer ? 0 : 3),
  },
  {
    questionKey: 'doYouHaveFlashlightOnboard',
    calculateRisk: (answer) => (answer ? 0 : 1),
  },
  {
    questionKey: 'areYouFamiliarWithArea',
    calculateRisk: (answer) => (answer ? 0 : 2),
  },
  {
    questionKey: 'doYouHaveAccessToMaps',
    calculateRisk: (answer) => (answer ? 0 : 2),
  },
  {
    questionKey: 'isThereAnchorOnboard',
    calculateRisk: (answer) => (answer ? 0 : 1),
  },
  {
    questionKey: 'isBailingScoopAvailable',
    calculateRisk: (answer) => (answer ? 0 : 1),
  },
  {
    questionKey: 'doYouHaveBoatingLicense',
    calculateRisk: (answer) => (answer ? 0 : 1),
    isLicenseQuestion: true,
    followUpQuestion: [
      // These questions are shown if the answer is "No"
      {
        questionKey: 'areYouFamiliarWithNavigationRules',
        calculateRisk: (answer) => (answer ? 0 : 2),
      },
      {
        questionKey: 'isBoatUnder8Meters',
        calculateRisk: (answer) => (answer ? 0 : 2),
      },
      {
        questionKey: 'isEngineUnder25HP',
        calculateRisk: (answer) => (answer ? 0 : 2),
      },
      {
        questionKey: 'areYouUnder16YearsMax10HP',
        calculateRisk: (answer) => (answer ? 0 : 5),
      },
    ],
  },
]
