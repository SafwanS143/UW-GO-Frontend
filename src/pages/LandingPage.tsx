import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div></div>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-8">
            UW Go
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            UW Go is a ride find and share service made exclusively for University of Waterloo students. 
            Connect with fellow students for convenient and reliable rides.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              to="/find-ride"
              className="px-8 py-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium text-lg shadow-md hover:shadow-lg transition-all"
            >
              Find Ride
            </Link>
            <Link
              to="/post-ride"
              className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-md hover:bg-gray-50 font-medium text-lg shadow-md hover:shadow-lg transition-all"
            >
              Post Ride
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage; 