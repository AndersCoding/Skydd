import {
  getDatabase,
  ref,
  get,
  set,
  remove,
  query,
  orderByChild,
  equalTo,
  push,
} from 'firebase/database'

export interface RiskAssessment {
  id: string
  boatId: string
  userId: string
  boatName: string
  date: string
  time: string
  score: number
  passengers: number
  checklistResponses: { [key: string]: boolean }
}

// Create risk assessment for user
export const createRiskAssessment = async (
  assessmentData: Omit<RiskAssessment, 'id'>
): Promise<RiskAssessment> => {
  try {
    const db = getDatabase()

    const formattedDate = formatDateConsistently(assessmentData.date)
    const dataWithFormattedDate = {
      ...assessmentData,
      date: formattedDate,
    }

    const userAssessmentsRef = ref(
      db,
      `users/${dataWithFormattedDate.userId}/riskAssessments`
    )
    const newAssessmentRef = push(userAssessmentsRef)
    const assessmentId = newAssessmentRef.key as string

    const newAssessment: RiskAssessment = {
      ...dataWithFormattedDate,
      id: assessmentId,
    }

    await set(newAssessmentRef, newAssessment)

    const globalAssessmentRef = ref(db, `riskAssessments/${assessmentId}`)
    await set(globalAssessmentRef, newAssessment)

    return newAssessment
  } catch (error: any) {
    console.error('Error creating risk assessment:', error)
    throw new Error(
      error.message || 'An error occurred while creating the risk assessment'
    )
  }
}

// Formatting the dato to be consistent and shown correctly
const formatDateConsistently = (dateString: string): string => {
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateString)) {
    return dateString
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    return dateString.replace(/\//g, '.')
  }

  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    }
  } catch (e) {
    console.error('Error parsing date:', e)
  }

  return dateString
}

// Get-method for fetching risk assessment by id
export const getRiskAssessmentById = async (
  assessmentId: string
): Promise<RiskAssessment> => {
  try {
    const db = getDatabase()
    let assessmentRef = ref(db, `riskAssessments/${assessmentId}`)
    let snapshot = await get(assessmentRef)

    if (!snapshot.exists()) {
      assessmentRef = ref(db, `riskAssesments/${assessmentId}`)
      snapshot = await get(assessmentRef)

      if (!snapshot.exists()) {
        throw new Error('Risk assessment not found')
      }
    }

    return { id: assessmentId, ...snapshot.val() }
  } catch (error) {
    console.error('Error fetching risk assessment:', error)
    throw error
  }
}

// Method for fetching all risk assessments for the user
export const getRiskAssessmentsByUser = async (
  userId: string
): Promise<RiskAssessment[]> => {
  try {
    const db = getDatabase()
    const userAssessmentsRef = ref(db, `users/${userId}/riskAssessments`)
    const snapshot = await get(userAssessmentsRef)

    if (!snapshot.exists()) {
      return []
    }

    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...(data as Omit<RiskAssessment, 'id'>),
    }))
  } catch (error) {
    console.error('Error fetching risk assessments by user:', error)
    throw error
  }
}

// Get-method for fetching risk assessments for the boat
export const getRiskAssessmentsByBoat = async (
  boatId: string
): Promise<RiskAssessment[]> => {
  try {
    const db = getDatabase()
    let assessmentsRef = ref(db, 'riskAssessments')
    let assessmentQuery = query(
      assessmentsRef,
      orderByChild('boatId'),
      equalTo(boatId)
    )
    let snapshot = await get(assessmentQuery)

    if (!snapshot.exists()) {
      assessmentsRef = ref(db, 'riskAssesments')
      assessmentQuery = query(
        assessmentsRef,
        orderByChild('boatId'),
        equalTo(boatId)
      )
      snapshot = await get(assessmentQuery)

      if (!snapshot.exists()) {
        return []
      }
    }

    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...(data as Omit<RiskAssessment, 'id'>),
    }))
  } catch (error) {
    console.error('Error fetching risk assessments by boat:', error)
    throw error
  }
}

// Method for deleting risk assessment from user
export const deleteRiskAssessment = async (
  userId: string,
  assessmentId: string
): Promise<void> => {
  try {
    const db = getDatabase()

    const userAssessmentRef = ref(
      db,
      `users/${userId}/riskAssessments/${assessmentId}`
    )
    await remove(userAssessmentRef)

    const globalAssessmentRef = ref(db, `riskAssessments/${assessmentId}`)
    await remove(globalAssessmentRef)

    /*const legacyAssessmentRef = ref(db, `riskAssesments/${assessmentId}`)
    await remove(legacyAssessmentRef)*/
  } catch (error) {
    console.error('Error deleting risk assessment:', error)
    throw error
  }
}
