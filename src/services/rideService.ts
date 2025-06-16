import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Ride, CreateRideData } from '../types/ride';

class RideService {
  private readonly COLLECTION_NAME = 'rides';

  async createRide(uid: string, email: string, rideData: CreateRideData): Promise<string> {
    try {
      // Check current active rides count
      const activeRides = await this.getUserActiveRides(uid);
      if (activeRides.length >= 3) {
        throw new Error('Maximum of 3 active rides allowed');
      }

      // Validate departure time is in the future
      const departureTime = new Date(rideData.departureTime);
      if (departureTime <= new Date()) {
        throw new Error('Departure time must be in the future');
      }

      // Validate required fields
      if (!rideData.startLocation.trim() || !rideData.destination.trim()) {
        throw new Error('Start location and destination are required');
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ownerUid: uid,
        ownerEmail: email,
        departureTime: rideData.departureTime,
        startLocation: rideData.startLocation.trim(),
        destination: rideData.destination.trim(),
        notes: rideData.notes?.trim() || '',
        createdAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error: any) {
      console.error('Error creating ride:', error);
      throw new Error(error.message || 'Failed to create ride');
    }
  }

  async getActiveRides(): Promise<Ride[]> {
    try {
      const now = new Date().toISOString();
      const q = query(
        collection(db, this.COLLECTION_NAME),
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
    } catch (error) {
      console.error('Error getting active rides:', error);
      throw new Error('Failed to load rides');
    }
  }

  async getUserActiveRides(uid: string): Promise<Ride[]> {
    try {
      const now = new Date().toISOString();
      const q = query(
        collection(db, this.COLLECTION_NAME),
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
    } catch (error) {
      console.error('Error getting user active rides:', error);
      throw new Error('Failed to load user rides');
    }
  }

  async deleteRide(rideId: string, uid: string): Promise<void> {
    try {
      // Note: In a production app, you'd want to verify ownership in Firestore security rules
      await deleteDoc(doc(db, this.COLLECTION_NAME, rideId));
    } catch (error) {
      console.error('Error deleting ride:', error);
      throw new Error('Failed to delete ride');
    }
  }

  // This would typically be called by a scheduled function
  async cleanupExpiredRides(): Promise<void> {
    try {
      const now = new Date().toISOString();
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('departureTime', '<=', now)
      );

      const querySnapshot = await getDocs(q);
      const deletePromises: Promise<void>[] = [];

      querySnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, this.COLLECTION_NAME, docSnapshot.id)));
      });

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error cleaning up expired rides:', error);
    }
  }
}

export const rideService = new RideService();