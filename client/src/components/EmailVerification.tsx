import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './EmailVerification.css';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }
    setToken(tokenParam);
    
    // Auto-verify the email when component mounts
    verifyEmail(tokenParam);
  }, [searchParams]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/auth/verify-email/${verificationToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setMessage(data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'An error occurred during verification.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="email-verification-container">
        <div className="email-verification-card">
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <h2>Invalid Verification Link</h2>
            <p>The email verification link is invalid or has expired.</p>
            <button 
              className="primary-button"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        {isLoading ? (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <h2>Verifying Your Email</h2>
            <p>Please wait while we verify your email address...</p>
          </div>
        ) : isSuccess ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Email Verified Successfully!</h2>
            <p>{message}</p>
            <p className="redirect-note">
              You will be redirected to the login page in a few seconds...
            </p>
            <button 
              className="primary-button"
              onClick={() => navigate('/login')}
            >
              Go to Login Now
            </button>
          </div>
        ) : (
          <div className="error-message">
            <div className="error-icon">❌</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <div className="verification-actions">
              <button 
                className="secondary-button"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
              <button 
                className="primary-button"
                onClick={() => verifyEmail(token)}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification; 