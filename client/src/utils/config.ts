// Get the API URL from environment variable or use default
export const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Use HTTPS for production
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.bluefishsports.com';
  }
  return 'http://localhost:5001';
}; 