import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmailPage: React.FC = () => {
  const { currentUser, logout, resendVerificationEmail, isEmailVerified } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if email is verified periodically
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    if (isEmailVerified) {
      navigate('/dashboard'); // or wherever you want to redirect
      return;
    }

    // Check verification status every 5 seconds
    const interval = setInterval(() => {
      currentUser.reload().then(() => {
        if (currentUser.emailVerified) {
          window.location.reload(); // Reload to update auth state
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, isEmailVerified, navigate]);

  const handleResendEmail = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resendVerificationEmail();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
      <h2>Verify Your Email</h2>
      
      <p>
        We've sent a verification email to <strong>{currentUser?.email}</strong>
      </p>
      
      <p>
        Please check your inbox and click the verification link to continue.
      </p>

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          {error}
        </div>
      )}
      
      {message && (
        <div style={{ color: 'green', margin: '10px 0' }}>
          {message}
        </div>
      )}

      <div style={{ margin: '20px 0' }}>
        <button onClick={handleResendEmail} disabled={loading}>
          {loading ? 'Sending...' : 'Resend Verification Email'}
        </button>
      </div>

      <div>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #ccc' }}>
          Sign Out
        </button>
      </div>

      <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        This page will automatically redirect once your email is verified.
      </p>
    </div>
  );
};

export default VerifyEmailPage;