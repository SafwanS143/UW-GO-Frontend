import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Ride, CreateRideData } from '../types/ride';

class RideService {
  private readonly RIDES_COLLECTION = 'rides';

  // Check if user is properly authenticated and verified
  private validateAuth(): void {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('You must be logged in to perform this action');
    }
    if (!user.emailVerified) {
      throw new Error('Please verify your email before posting rides');
    }
    if (!user.email?.endsWith('@uwaterloo.ca')) {
      throw new Error('Only UWaterloo students can use this service');
    }
  }

  async createRide(uid: string, email: string, rideData: CreateRideData): Promise<string> {
    try {
      // Validate authentication
      this.validateAuth();

      // Double-check the email domain
      if (!email.endsWith('@uwaterloo.ca')) {
        throw new Error('Only UWaterloo email addresses are allowed');
      }

      // Check current active rides count
      const activeRides = await this.getUserActiveRides(uid);
      if (activeRides.length >= 3) {
        throw new Error('You can only have a maximum of 3 active rides at once');
      }

      // Validate departure time is in the future (at least 1 hour from now)
      const departureTime = new Date(rideData.departureTime);
      const oneHourFromNow = new Date();
      oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
      
      if (departureTime <= oneHourFromNow) {
        throw new Error('Departure time must be at least 1 hour in the future');
      }

      // Validate required fields
      if (!rideData.startLocation?.trim() || !rideData.destination?.trim()) {
        throw new Error('Start location and destination are required');
      }

      // Validate field lengths
      if (rideData.startLocation.trim().length < 3) {
        throw new Error('Start location must be at least 3 characters long');
      }
      if (rideData.destination.trim().length < 3) {
        throw new Error('Destination must be at least 3 characters long');
      }
      if (rideData.notes && rideData.notes.length > 500) {
        throw new Error('Notes cannot exceed 500 characters');
      }

      // Create the ride document
      const docRef = await addDoc(collection(db, this.RIDES_COLLECTION), {
        ownerUid: uid,
        ownerEmail: email.toLowerCase(),
        departureTime: rideData.departureTime,
        startLocation: rideData.startLocation.trim(),
        destination: rideData.destination.trim(),
        notes: rideData.notes?.trim() || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error: any) {
      console.error('Error creating ride:', error);
      
      // Handle Firestore permission errors
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please ensure your email is verified and you are using a UWaterloo email.');
      }
      
      throw new Error(error.message || 'Failed to create ride');
    }
  }

  async getActiveRides(): Promise<Ride[]> {
    try {
      // Validate authentication
      this.validateAuth();

      const now = new Date().toISOString();
      const q = query(
        collection(db, this.RIDES_COLLECTION),
        where('departureTime', '>', now),
        orderBy('departureTime', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const rides: Ride[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Extra validation - ensure it's a UWaterloo email
        if (data.ownerEmail && data.ownerEmail.endsWith('@uwaterloo.ca')) {
          rides.push({
            id: doc.id,
            ownerUid: data.ownerUid,
            ownerEmail: data.ownerEmail,
            departureTime: data.departureTime,
            startLocation: data.startLocation,
            destination: data.destination,
            notes: data.notes || '',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          });
        }
      });

      return rides;
    } catch (error: any) {
      console.error('Error getting active rides:', error);
      
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please ensure your email is verified.');
      }
      
      throw new Error('Failed to load rides');
    }
  }

  async getUserActiveRides(uid: string): Promise<Ride[]> {
    try {
      // Validate authentication
      this.validateAuth();

      // Ensure user can only get their own rides
      if (auth.currentUser?.uid !== uid) {
        throw new Error('Unauthorized access to user rides');
      }

      const now = new Date().toISOString();
      const q = query(
        collection(db, this.RIDES_COLLECTION),
        where('ownerUid', '==', uid),
        where('departureTime', '>', now),
        orderBy('departureTime', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const rides: Ride[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        rides.push({
          id: doc.id,
          ownerUid: data.ownerUid,
          ownerEmail: data.ownerEmail,
          departureTime: data.departureTime,
          startLocation: data.startLocation,
          destination: data.destination,
          notes: data.notes || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });

      return rides;
    } catch (error: any) {
      console.error('Error getting user active rides:', error);
      
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please ensure your email is verified.');
      }
      
      throw new Error('Failed to load your rides');
    }
  }

  async deleteRide(rideId: string, uid: string): Promise<void> {
    try {
      // Validate authentication
      this.validateAuth();

      // Ensure user can only delete their own rides
      if (auth.currentUser?.uid !== uid) {
        throw new Error('You can only delete your own rides');
      }

      await deleteDoc(doc(db, this.RIDES_COLLECTION, rideId));
    } catch (error: any) {
      console.error('Error deleting ride:', error);
      
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. You can only delete your own rides.');
      }
      
      throw new Error('Failed to delete ride');
    }
  }

  async updateRide(rideId: string, uid: string, updateData: Partial<CreateRideData>): Promise<void> {
    try {
      // Validate authentication
      this.validateAuth();

      // Ensure user can only update their own rides
      if (auth.currentUser?.uid !== uid) {
        throw new Error('You can only update your own rides');
      }

      // Validate departure time if being updated
      if (updateData.departureTime) {
        const departureTime = new Date(updateData.departureTime);
        const oneHourFromNow = new Date();
        oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
        
        if (departureTime <= oneHourFromNow) {
          throw new Error('Departure time must be at least 1 hour in the future');
        }
      }

      // Prepare update data
      const dataToUpdate: any = {
        updatedAt: serverTimestamp()
      };

      if (updateData.startLocation?.trim()) {
        if (updateData.startLocation.trim().length < 3) {
          throw new Error('Start location must be at least 3 characters long');
        }
        dataToUpdate.startLocation = updateData.startLocation.trim();
      }

      if (updateData.destination?.trim()) {
        if (updateData.destination.trim().length < 3) {
          throw new Error('Destination must be at least 3 characters long');
        }
        dataToUpdate.destination = updateData.destination.trim();
      }

      if (updateData.departureTime) {
        dataToUpdate.departureTime = updateData.departureTime;
      }

      if (updateData.notes !== undefined) {
        if (updateData.notes.length > 500) {
          throw new Error('Notes cannot exceed 500 characters');
        }
        dataToUpdate.notes = updateData.notes.trim();
      }

      await updateDoc(doc(db, this.RIDES_COLLECTION, rideId), dataToUpdate);
    } catch (error: any) {
      console.error('Error updating ride:', error);
      
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. You can only update your own rides.');
      }
      
      throw new Error(error.message || 'Failed to update ride');
    }
  }

  // This would typically be called by a scheduled Cloud Function
  async cleanupExpiredRides(): Promise<void> {
    try {
      const now = new Date().toISOString();
      const q = query(
        collection(db, this.RIDES_COLLECTION),
        where('departureTime', '<=', now)
      );

      const querySnapshot = await getDocs(q);
      const deletePromises: Promise<void>[] = [];

      querySnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, this.RIDES_COLLECTION, docSnapshot.id)));
      });

      await Promise.all(deletePromises);
      console.log(`Cleaned up ${deletePromises.length} expired rides`);
    } catch (error) {
      console.error('Error cleaning up expired rides:', error);
      throw new Error('Failed to cleanup expired rides');
    }
  }

  // Get ride statistics (optional - for admin or user insights)
  async getRideStats(): Promise<{ totalActive: number; userActive: number }> {
    try {
      this.validateAuth();
      
      const user = auth.currentUser!;
      const activeRides = await this.getActiveRides();
      const userActiveRides = await this.getUserActiveRides(user.uid);

      return {
        totalActive: activeRides.length,
        userActive: userActiveRides.length
      };
    } catch (error: any) {
      console.error('Error getting ride stats:', error);
      throw new Error('Failed to get ride statistics');
    }
  }
}

export const rideService = new RideService();