import React, { useState } from 'react';
import api from '../services/api';
import './ForgotPassword.css';

interface ForgotPasswordProps {
  onClose: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.post('/api/auth/request-password-reset', { email });
      const data = response.data;

      if (data.success) {
        setIsSuccess(true);
        setMessage(data.message);
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

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-modal">
        <div className="forgot-password-header">
          <h2>Forgot Password</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <p className="forgot-password-description">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            {message && (
              <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading || !email}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Check Your Email</h3>
            <p>{message}</p>
            <p className="email-note">
              If you don't see the email, check your spam folder.
            </p>
            <button className="close-button-primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 