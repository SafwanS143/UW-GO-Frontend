import React from 'react';
import { Link } from 'react-router-dom';

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold text-yellow-600">Auth Page</h1>
      <p className="text-gray-600 mt-2">Login/Signup with UW Account will be here.</p>
      <Link to="/" className="mt-4 px-4 py-2 bg-yellow-500 text-gray-900 rounded-md hover:bg-yellow-400">
        Go Back to Landing Page
      </Link>
    </div>
  );
}

export default AuthPage;