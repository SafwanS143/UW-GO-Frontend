import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from '../types/ride';

class UserService {
  async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw new Error('Failed to get user data');
    }
  }

  async createUserProfile(uid: string, email: string): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), {
        email,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }
}

export const userService = new UserService();