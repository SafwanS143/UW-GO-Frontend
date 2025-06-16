import React from 'react';
import type { Ride } from '../types/ride';

interface RideListProps {
  rides: Ride[];
  currentUserId: string;
}

const RideList: React.FC<RideListProps> = ({ rides, currentUserId }) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleContactPoster = (email: string) => {
    window.location.href = `mailto:${email}?subject=UW Go Ride Inquiry`;
  };

  if (rides.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No rides available</h3>
        <p className="text-gray-500">Check back later for new ride postings from fellow students.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {rides.map((ride) => (
        <div key={ride.id} className="p-6 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  From: <span className="font-medium text-gray-900">{ride.startLocation}</span>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  To: <span className="font-medium text-gray-900">{ride.destination}</span>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-2">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{formatDateTime(ride.departureTime)}</span>
              </div>

              {ride.notes && (
                <div className="text-sm text-gray-600 mb-3">
                  <p className="bg-gray-50 p-2 rounded border-l-2 border-yellow-400">
                    <span className="font-medium">Notes: </span>
                    {ride.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center text-xs text-gray-500">
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Posted by: {ride.ownerEmail.split('@')[0]}
                {ride.ownerUid === currentUserId && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Your ride
                  </span>
                )}
              </div>
            </div>

            <div className="ml-4 flex-shrink-0">
              {ride.ownerUid !== currentUserId ? (
                <button
                  onClick={() => handleContactPoster(ride.ownerEmail)}
                  className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 font-medium text-sm flex items-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Poster
                </button>
              ) : (
                <div className="text-sm text-gray-500 text-center">
                  <p className="font-medium">Your Ride</p>
                  <p className="text-xs">Others can contact you</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RideList;