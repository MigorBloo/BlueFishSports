import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import authService from '../services/authService';
import { LoginCredentials } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ForgotPassword from '../components/ForgotPassword';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const errorTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/landing');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    try {
      const response = await authService.login(credentials);
      login(response.accessToken, response.refreshToken, response.user);
      navigate('/landing');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials and try again.');
      errorTimeoutRef.current = setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box className="login-container">
      <Box className="login-grid">
        {/* Left side - Logo */}
        <Box className="logo-section">
          <Box className="logo-content">
            <img
              src="/assets/images/shared/BlueFish.webp"
              alt="BlueFish Sports Logo"
              style={{ width: '300px', height: 'auto' }}
            />
          </Box>
        </Box>

        {/* Right side - Login form */}
        <Box className="form-section">
          <Paper elevation={3} className="login-paper">
            <Typography variant="h4" className="login-title">
              Welcome Back
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} className="login-form">
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={credentials.email}
                onChange={(e) => {
                  setCredentials({ ...credentials, email: e.target.value });
                  setError('');
                }}
                sx={{ mt: 2 }}
              />
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={(e) => {
                  setCredentials({ ...credentials, password: e.target.value });
                  setError('');
                }}
                sx={{ mt: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="login-button"
                sx={{ mt: 3, mb: 2 }}
              >
                Let's Play
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Haven't registered yet?{' '}
                  <RouterLink to="/register" className="register-link">
                    Create an account
                  </RouterLink>
                </Typography>
                <Typography variant="body2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="forgot-password-link"
                  >
                    Forgot Password?
                  </button>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </Box>
  );
};

export default Login; 