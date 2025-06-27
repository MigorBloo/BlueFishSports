const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function testAuthEndpoints() {
  try {
    // Test registration
    console.log('Testing registration...');
    const registerResponse = await axios.post(`${API_URL}/register`, {
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser'
    });
    console.log('Registration successful:', registerResponse.data);

    // Test login
    console.log('\nTesting login...');
    const loginResponse = await axios.post(`${API_URL}/login`, {
      email: 'test@example.com',
      password: 'Test123!'
    });
    console.log('Login successful:', loginResponse.data);

    // Test profile retrieval
    console.log('\nTesting profile retrieval...');
    const profileResponse = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${loginResponse.data.token}`
      }
    });
    console.log('Profile retrieval successful:', profileResponse.data);

  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

testAuthEndpoints(); 