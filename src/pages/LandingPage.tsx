import React from 'react';
import { Link } from 'react-router-dom';


const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-gray-100 border-b border-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div></div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-yellow-600 mb-8">
              UW Go
            </h1>
            
            {/* Placeholder Image */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              UW Go is a ride find and share service made exclusively for University of Waterloo students. 
              Connect with fellow students for convenient and reliable rides.
            </p>
            <div className="flex justify-center">
              <Link
                to="/auth"
                className="px-8 py-4 bg-yellow-500 text-gray-900 rounded-md hover:bg-yellow-400 font-medium text-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                Continue with UW Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;