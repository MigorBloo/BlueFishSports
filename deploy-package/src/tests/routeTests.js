const axios = require('axios');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../../.env.development')
});

const API_BASE_URL = 'http://localhost:5000/api';
console.log('Database Config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***' : 'not set'
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false
});

async function testAuthRoutes() {
  console.log('\nTesting Auth Routes:');
  
  // Test registration
  try {
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser'
    });
    console.log('Registration:', registerResponse.status === 201 ? '✅ Success' : '❌ Failed');
    console.log('Response:', registerResponse.data);
  } catch (error) {
    console.log('Registration:', '❌ Failed');
    console.log('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }

  // Test login
  try {
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!'
    });
    console.log('Login:', loginResponse.status === 200 ? '✅ Success' : '❌ Failed');
    console.log('Response:', loginResponse.data);
    return loginResponse.data.token;
  } catch (error) {
    console.log('Login:', '❌ Failed');
    console.log('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return null;
  }
}

async function testNflDraftRoutes(token) {
  if (!token) {
    console.log('\nSkipping NFL Draft routes tests - No authentication token available');
    return;
  }

  console.log('\nTesting NFL Draft Routes:');
  const headers = { Authorization: `Bearer ${token}` };

  // Test prospects
  try {
    const prospectsResponse = await axios.get(`${API_BASE_URL}/nfl-draft/prospects`, { headers });
    console.log('Get Prospects:', prospectsResponse.status === 200 ? '✅ Success' : '❌ Failed');
    console.log('Response:', prospectsResponse.data);
  } catch (error) {
    console.log('Get Prospects:', '❌ Failed');
    console.log('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }

  // Test expert picks
  try {
    const expertPicksResponse = await axios.get(`${API_BASE_URL}/nfl-draft/expert-picks`, { headers });
    console.log('Get Expert Picks:', expertPicksResponse.status === 200 ? '✅ Success' : '❌ Failed');
    console.log('Response:', expertPicksResponse.data);
  } catch (error) {
    console.log('Get Expert Picks:', '❌ Failed');
    console.log('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }

  // Test teams
  try {
    const teamsResponse = await axios.get(`${API_BASE_URL}/nfl-draft/teams`, { headers });
    console.log('Get Teams:', teamsResponse.status === 200 ? '✅ Success' : '❌ Failed');
    console.log('Response:', teamsResponse.data);
  } catch (error) {
    console.log('Get Teams:', '❌ Failed');
    console.log('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
}

async function runTests() {
  console.log('Starting Route Tests...');
  
  // Test database connection first
  try {
    const client = await pool.connect();
    console.log('Database Connection:', '✅ Success');
    client.release();
  } catch (error) {
    console.log('Database Connection:', '❌ Failed -', error.message);
    return;
  }

  const token = await testAuthRoutes();
  await testNflDraftRoutes(token);
}

runTests().catch(console.error); 