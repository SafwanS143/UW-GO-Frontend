import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmailPage: React.FC = () => {
  const { currentUser, logout, resendVerificationEmail, checkEmailVerification } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    // If already verified, redirect to dashboard
    if (currentUser.emailVerified) {
      navigate('/dashboard');
      return;
    }

    // Check verification status every 5 seconds
    const interval = setInterval(async () => {
      setCheckingVerification(true);
      try {
        const isVerified = await checkEmailVerification();
        if (isVerified) {
          setMessage('Email verified! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      } finally {
        setCheckingVerification(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, checkEmailVerification, navigate]);

  const handleResendEmail = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resendVerificationEmail();
      setMessage('Verification email sent! Please check your inbox and spam folder.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNow = async () => {
    setError('');
    setCheckingVerification(true);

    try {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        setMessage('Email verified! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setMessage('Email not yet verified. Please check your inbox and click the verification link.');
      }
    } catch (err: any) {
      setError('Failed to check verification status. Please try again.');
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      setError('Failed to log out');
    }
  };

  const userEmail = currentUser?.email || '';
  const isUWEmail = userEmail.endsWith('@uwaterloo.ca');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg 
              className="h-6 w-6 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We need to verify your UWaterloo email address
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                We've sent a verification email to:
              </p>
              <p className="mt-1 font-medium text-gray-900 break-all">
                {userEmail}
              </p>
              
              {!isUWEmail && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">
                    ⚠️ This email is not a UWaterloo email. Only @uwaterloo.ca emails are allowed.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Next Steps:
                </h3>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>Return to this page - it will automatically redirect you</li>
                </ol>
              </div>

              {checkingVerification && (
                <div className="text-center">
                  <div className="inline-flex items-center text-sm text-gray-600">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking verification status...
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm">{message}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleCheckNow}
                disabled={checkingVerification}
                className="w-full bg-yellow-500 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {checkingVerification ? 'Checking...' : 'I\'ve verified my email'}
              </button>

              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <button
                onClick={handleLogout}
                className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Sign Out
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                This page will automatically redirect once your email is verified.
                <br />
                Having trouble? Check your spam folder or try resending the email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;