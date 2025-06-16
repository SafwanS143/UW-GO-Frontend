export interface Ride {
  id: string;
  ownerUid: string;
  ownerEmail: string;
  departureTime: string; // ISO date string
  startLocation: string;
  destination: string;
  notes?: string;
  createdAt: string; // ISO date string
}

export interface CreateRideData {
  departureTime: string;
  startLocation: string;
  destination: string;
  notes?: string;
}

export interface User {
  email: string;
  createdAt: string;
}