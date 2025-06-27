import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');

  const handleUsernameEdit = () => {
    setIsEditing(true);
  };

  const handleUsernameSave = async () => {
    if (!user || !newUsername.trim()) return;
    setIsSaving(true);
    try {
      // Replace with your update logic (API call, etc.)
      const updatedUser = { ...user, username: newUsername.trim() };
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update username. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUsernameCancel = () => {
    setNewUsername(user?.username || '');
    setIsEditing(false);
  };

  return (
    <div className="user-profile-container">
      <div className="profile-paper">
        <h1 className="profile-title">
          {user?.username || 'User'}
        </h1>
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
        </div>
        <div className="profile-info">
          <div className="info-label">Email</div>
          <div className="info-value">{user?.email}</div>
          <div className="info-label">Username</div>
          <div className="info-value-container">
            {isEditing ? (
              <div className="edit-container">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="username-input"
                />
                <div className="edit-buttons">
                  <button
                    onClick={handleUsernameSave}
                    disabled={isSaving}
                    className="save-username-button"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleUsernameCancel}
                    className="cancel-username-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="username-display">
                <span>{user?.username}</span>
                <button
                  onClick={handleUsernameEdit}
                  className="edit-username-button"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 