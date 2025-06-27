import React from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import UserProfile from '../../components/UserProfile/UserProfile';
import './UserProfilePage.css';

const UserProfilePage: React.FC = () => {
  return (
    <div className="user-profile-page">
      <NavigationBar />
      <div className="page-container">
        <UserProfile />
      </div>
    </div>
  );
};

export default UserProfilePage; 