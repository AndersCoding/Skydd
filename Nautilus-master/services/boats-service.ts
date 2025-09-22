import {
  getDatabase,
  ref,
  get,
  set,
  remove,
  push,
  update,
} from 'firebase/database'

export interface Boat {
  id: string
  name: string
  hp: number
  amountOfPeople: number
  users?: { [userId: string]: boolean }
}

// Adding boat to the user, with userID as key
export const createBoat = async (
  userId: string,
  boatData: Omit<Boat, 'id'>
): Promise<Boat> => {
  try {
    const db = getDatabase()
    const boatsRef = ref(db, `users/${userId}/boats`)
    const newBoatRef = push(boatsRef)
    const newBoat: Boat = { ...boatData, id: newBoatRef.key as string }

    await set(newBoatRef, newBoat)
    return newBoat
  } catch (error: any) {
    throw new Error()
  }
}

// Get-method to fetch boat by ID
export const getBoatById = async (
  userId: string,
  boatId: string
): Promise<Boat> => {
  try {
    const db = getDatabase()
    const boatRef = ref(db, `users/${userId}/boats/${boatId}`)
    const snapshot = await get(boatRef)

    if (!snapshot.exists()) {
      throw new Error('Boat not found')
    }

    return { id: boatId, ...snapshot.val() }
  } catch (error) {
    throw error
  }
}

// Method to fetch all boats for the user
export const getBoatsByOwner = async (userId: string): Promise<Boat[]> => {
  try {
    const db = getDatabase()
    const boatsRef = ref(db, `users/${userId}/boats`)
    const snapshot = await get(boatsRef)

    if (!snapshot.exists()) {
      return []
    }

    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...(data as Omit<Boat, 'id'>),
    }))
  } catch (error) {
    console.error('Error fetching boats by owner:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch boats: ${error.message}`)
    } else {
      throw new Error('An unknown error occurred while fetching boats')
    }
  }
}

// Method for updating boat information
export const updateBoat = async (
  userId: string,
  boatId: string,
  boatData: Partial<Omit<Boat, 'id'>>
): Promise<Boat> => {
  try {
    const db = getDatabase()
    const boatRef = ref(db, `users/${userId}/boats/${boatId}`)

    await update(boatRef, boatData)
    const updatedBoat = await getBoatById(userId, boatId)
    return updatedBoat
  } catch (error) {
    console.error('Error updating boat:', error)
    throw error
  }
}

// Method for deleting boat from users account
export const deleteBoat = async (
  userId: string,
  boatId: string
): Promise<void> => {
  try {
    const db = getDatabase()
    const boatRef = ref(db, `users/${userId}/boats/${boatId}`)
    await remove(boatRef)
  } catch (error) {
    console.error('Error deleting boat:', error)
    throw error
  }
}

// Method for adding user to boat
export const addUserToBoat = async (
  ownerId: string,
  boatId: string,
  userId: string
): Promise<void> => {
  try {
    const db = getDatabase()
    const userRef = ref(db, `users/${ownerId}/boats/${boatId}/users/${userId}`)
    await set(userRef, true)
  } catch (error) {
    console.error('Error adding user to boat:', error)
    throw error
  }
}

// Method for removing user from boat
export const removeUserFromBoat = async (
  ownerId: string,
  boatId: string,
  userId: string
): Promise<void> => {
  try {
    const db = getDatabase()
    const userRef = ref(db, `users/${ownerId}/boats/${boatId}/users/${userId}`)
    await remove(userRef)
  } catch (error) {
    console.error('Error removing user from boat:', error)
    throw error
  }
}
