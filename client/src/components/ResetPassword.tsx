import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './ResetPassword.css';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setMessage('Invalid reset link. Please request a new password reset.');
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.post('/api/auth/reset-password', { 
        token,
        password: newPassword 
      });
      const data = response.data;

      if (data.success) {
        setIsSuccess(true);
        setMessage(data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'An error occurred. Please try again.');
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
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <h2>Invalid Reset Link</h2>
            <p>The password reset link is invalid or has expired.</p>
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
    <div className="reset-password-container">
      <div className="reset-password-card">
        {!isSuccess ? (
          <>
            <div className="reset-password-header">
              <h2>Reset Your Password</h2>
              <p>Enter your new password below.</p>
            </div>

            <form onSubmit={handleSubmit} className="reset-password-form">
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-container">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading}
                  >
                    {showNewPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <small>Password must be at least 6 characters long</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {message && (
                <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate('/login')}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isLoading || !newPassword || !confirmPassword}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Password Reset Successfully</h2>
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
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 