import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// List of admin usernames/emails - you can modify this
const ADMIN_USERS = [
 'BlooMig', // Replace with your actual username
  'igmasa12@gmail.com' // Replace with your actual email
];

interface AdminRouteProps {
  element: React.ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ element }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user is admin
  const isAdmin = ADMIN_USERS.includes(user.username?.toLowerCase()) || 
                  ADMIN_USERS.includes(user.email?.toLowerCase());
  
  if (!isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1>🚫 Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }
  
  return element;
};

export default AdminRoute; 