import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { rideService } from '../services/rideService';
import RideForm from '../components/RideForm';
import RideList from '../components/RideList';
import type { Ride } from '../types/ride';

const DashboardPage: React.FC = () => {
  const [showRideForm, setShowRideForm] = useState(false);
  const [rides, setRides] = useState<Ride[]>([]);
  const [userRideCount, setUserRideCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRides = async () => {
      if (!currentUser) return;
      
      try {
        // Create user profile if it doesn't exist
        const userData = await userService.getUserData(currentUser.uid);
        if (!userData) {
          await userService.createUserProfile(currentUser.uid, currentUser.email || '');
        }

        // Load active rides
        const activeRides = await rideService.getActiveRides();
        setRides(activeRides);

        // Count user's active rides
        const userActiveRides = await rideService.getUserActiveRides(currentUser.uid);
        setUserRideCount(userActiveRides.length);

      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadRides();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      setError('Failed to log out');
    }
  };

  const handleRidePosted = () => {
    setShowRideForm(false);
    // Refresh the rides list
    window.location.reload();
  };

  const canPostRide = userRideCount < 3;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-600">UW Go</h1>
              <span className="ml-4 text-sm text-gray-500">
                Welcome, {currentUser?.email?.split('@')[0]}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Active rides: {userRideCount}/3
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Post Ride Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Post a Ride</h2>
              {!canPostRide && (
                <span className="text-sm text-red-600">
                  Maximum rides reached (3/3)
                </span>
              )}
            </div>
            
            {showRideForm ? (
              <div>
                <RideForm 
                  onSuccess={handleRidePosted}
                  onCancel={() => setShowRideForm(false)}
                />
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Share a ride with fellow UW students. You can have up to 3 active rides at once.
                </p>
                <button
                  onClick={() => setShowRideForm(true)}
                  disabled={!canPostRide}
                  className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {canPostRide ? 'Post New Ride' : 'Max Rides Reached'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Available Rides Section */}
        <div>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Available Rides</h2>
              <p className="text-gray-600 mt-1">
                Find rides posted by other UW students
              </p>
            </div>
            
            <RideList rides={rides} currentUserId={currentUser?.uid || ''} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;