import { getDatabase, ref, remove } from 'firebase/database'

// Services for the firebase databse
// Only used for deleting user
export const deleteUserDirectly = async (userId: string): Promise<void> => {
  try {
    const db = getDatabase()
    const userRef = ref(db, `users/${userId}`)

    console.log('Directly deleting user data for:', userId)
    await remove(userRef)
    console.log('User data directly deleted successfully')
  } catch (error) {
    console.error('Error directly deleting user data:', error)
    throw error
  }
}
