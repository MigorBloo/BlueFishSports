import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import authService from '../services/authService';
import { RegisterCredentials } from '../types';
import './Register.css';

const countryList = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    residence: ''
  });
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<RegisterCredentials>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countdown effect for redirect
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      navigate('/login');
    }
  }, [isSuccess, countdown, navigate]);

  const validateForm = () => {
    const errors: Partial<RegisterCredentials> = {};
    if (!credentials.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(credentials.email)) errors.email = 'Email is invalid';
    
    if (!credentials.password) errors.password = 'Password is required';
    else if (credentials.password.length < 8) errors.password = 'Password must be at least 8 characters';
    
    if (!credentials.firstName) errors.firstName = 'First name is required';
    if (!credentials.lastName) errors.lastName = 'Last name is required';
    if (!credentials.username) errors.username = 'Username is required';
    if (!credentials.residence) errors.residence = 'Country of residence is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await authService.register(credentials);
      // Show success message and start countdown
      setIsSuccess(true);
      setCountdown(5);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If success, show success message
  if (isSuccess) {
    return (
      <Box className="register-container">
        <Box className="register-grid">
          {/* Left side - Logo */}
          <Box className="logo-section">
            <Box className="logo-content">
              <img
                src="/assets/images/shared/BlueFish.webp"
                alt="BlueFish Sports"
                style={{ width: '240px', marginBottom: '20px' }}
              />
              <Typography variant="h4" className="welcome-title">
                Welcome to BlueFish Sports
              </Typography>
              <Typography variant="body1" className="welcome-subtitle">
                Join our community of sports enthusiasts and compete in exciting sport prediction games, both in single event and season long contests!
              </Typography>
            </Box>
          </Box>

          {/* Right side - Success message */}
          <Box className="form-section">
            <Paper elevation={3} className="register-paper">
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Alert severity="success" sx={{ mb: 3, fontSize: '1.1rem' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    🎉 Registration Successful!
                  </Typography>
                </Alert>
                
                <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
                  Welcome to BlueFish Sports, <strong>{credentials.firstName}</strong>!
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📧 Check Your Email
                  </Typography>
                  <Typography variant="body2">
                    We've sent a verification email to <strong>{credentials.email}</strong>. 
                    Please click the verification link in your email to activate your account.
                  </Typography>
                </Alert>
                
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                  You will be redirected to the login page in:
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <CircularProgress 
                    size={40} 
                    sx={{ mr: 2, color: 'success.main' }} 
                    variant="determinate" 
                    value={(countdown / 5) * 100} 
                  />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {countdown}s
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Redirecting to login page...
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="register-container">
      <Box className="register-grid">
        {/* Left side - Logo */}
        <Box className="logo-section">
          <Box className="logo-content">
            <img
              src="/assets/images/shared/BlueFish.webp"
              alt="BlueFish Sports"
              style={{ width: '240px', marginBottom: '20px' }}
            />
            <Typography variant="h4" className="welcome-title">
              Welcome to BlueFish Sports
            </Typography>
            <Typography variant="body1" className="welcome-subtitle">
              Join our community of sports enthusiasts and compete in exciting sport prediction games, both in single event and season long contests!
            </Typography>
          </Box>
        </Box>

        {/* Right side - Registration form */}
        <Box className="form-section">
          <Paper elevation={3} className="register-paper">
            <Typography variant="h4" className="register-title">
              Create Account
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} className="register-form">
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                value={credentials.firstName}
                onChange={(e) =>
                  setCredentials({ ...credentials, firstName: e.target.value })
                }
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                sx={{ mt: 2 }}
              />

              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                value={credentials.lastName}
                onChange={(e) =>
                  setCredentials({ ...credentials, lastName: e.target.value })
                }
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                sx={{ mt: 2 }}
              />

              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                error={!!formErrors.username}
                helperText={formErrors.username}
                sx={{ mt: 2 }}
              />

              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                error={!!formErrors.email}
                helperText={formErrors.email}
                sx={{ mt: 2 }}
              />

              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                error={!!formErrors.password}
                helperText={formErrors.password}
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

              <TextField
                select
                required
                fullWidth
                id="residence"
                label="Country of Residence"
                name="residence"
                value={credentials.residence}
                onChange={(e) => setCredentials({ ...credentials, residence: e.target.value })}
                error={!!formErrors.residence}
                helperText={formErrors.residence}
                sx={{ mt: 2 }}
              >
                {countryList.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="register-button"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <RouterLink to="/login" className="login-link">
                    Sign in
                  </RouterLink>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Register; 