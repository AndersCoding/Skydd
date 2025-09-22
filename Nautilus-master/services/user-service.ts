import {
  getDatabase,
  ref,
  get,
  set,
  remove,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '@/firebaseConfig'
import { getBoatsByOwner } from './boats-service'

export interface User {
  email: string
  firstName: string
  lastName: string
  birthDate: string
  hasBoatingLicence: boolean
}

// Create user in the firebase database, with email and password.
// FirebaseConsole will display the userData on its website, available for admins
export const createUser = async (
  email: string,
  password: string,
  userData: Omit<User, 'email'>
): Promise<{ uid: string; user: User }> => {
  try {
    const { user: authUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    const db = getDatabase()
    const userRef = ref(db, `users/${authUser.uid}`)

    const userDataWithEmail = {
      email,
      ...userData,
      boats: {},
    }

    await set(userRef, userDataWithEmail)

    return {
      uid: authUser.uid,
      user: userDataWithEmail,
    }
  } catch (error: any) {
    console.error('Error creating user:', error)
    throw new Error(
      error.message || 'An error occurred while creating the user'
    )
  }
}

// Get-method to fetch user by id
export const getUserByUid = async (uid: string): Promise<User> => {
  try {
    const db = getDatabase()
    const userRef = ref(db, `users/${uid}`)
    const snapshot = await get(userRef)

    if (!snapshot.exists()) {
      throw new Error('User not found')
    }

    const userData = snapshot.val()
    delete userData.boats
    return userData
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// Get-method to fetch user by email
export const getUserByEmail = async (email: string): Promise<User> => {
  try {
    const db = getDatabase()
    const usersRef = ref(db, 'users')
    const userQuery = query(usersRef, orderByChild('email'), equalTo(email))
    const snapshot = await get(userQuery)

    if (!snapshot.exists()) {
      throw new Error('User not found')
    }

    const userData = Object.values(snapshot.val())[0] as User
    delete (userData as any).boats
    return userData
  } catch (error) {
    console.error('Error fetching user by email:', error)
    throw error
  }
}

// Update user in the firebase database
export const updateUser = async (
  uid: string,
  userData: Partial<User>
): Promise<User> => {
  try {
    const db = getDatabase()
    const userRef = ref(db, `users/${uid}`)

    const snapshot = await get(userRef)
    if (!snapshot.exists()) {
      throw new Error('User not found')
    }

    const currentData = snapshot.val()
    const updatedData = {
      ...currentData,
      ...userData,
    }

    delete updatedData.boats

    await set(userRef, updatedData)
    return updatedData
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Method for deleting user from the database
export const deleteUser = async (uid: string): Promise<void> => {
  try {
    const db = getDatabase()
    const userRef = ref(db, `users/${uid}`)
    await remove(userRef)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Function to log in as guest
// Instead of anomymous login, we use a guest account with a set email and password
export const loginAsGuest = async (): Promise<User> => {
  try {
    const { user } = await signInWithEmailAndPassword(
      auth,
      'guest@guest.no',
      '123456'
    )

    if (!user) {
      throw new Error('Guest login failed')
    }

    const guestUser: User = {
      email: 'guest@guest.no',
      firstName: 'Guest',
      lastName: 'User',
      birthDate: '',
      hasBoatingLicence: false,
    }

    return guestUser
  } catch (error) {
    console.error('Error logging in as guest:', error)
    throw error
  }
}

// Method for deleting the users data
export const deleteUserData = async (userId: string): Promise<void> => {
  const db = getDatabase()

  try {
    console.log('Deleting risk assessments for user:', userId)
    const riskAssessmentsRef = ref(db, 'risk_assessments')
    const assessmentsQuery = query(
      riskAssessmentsRef,
      orderByChild('userId'),
      equalTo(userId)
    )
    const assessmentsSnapshot = await get(assessmentsQuery)

    if (assessmentsSnapshot.exists()) {
      const assessments = assessmentsSnapshot.val()
      console.log('Found risk assessments:', Object.keys(assessments).length)

      for (const assessmentId in assessments) {
        console.log('Deleting assessment:', assessmentId)
        await remove(ref(db, `risk_assessments/${assessmentId}`))
      }
    } else {
      console.log('No risk assessments found for user')
    }
  } catch (error) {
    console.error('Error deleting risk assessments:', error)
    throw error
  }

  try {
    console.log('Deleting boats for user:', userId)
    const boats = await getBoatsByOwner(userId)
    console.log('Found boats:', boats.length)

    for (const boat of boats) {
      console.log('Deleting boat:', boat.id)
      await remove(ref(db, `users/${userId}/boats/${boat.id}`))
    }
  } catch (error) {
    console.error('Error deleting boats:', error)
    throw error
  }

  try {
    console.log('Deleting user data for user:', userId)
    await deleteUser(userId)
    console.log('User data deleted successfully')
  } catch (error) {
    console.error('Error deleting user data:', error)
    throw error
  }
}
