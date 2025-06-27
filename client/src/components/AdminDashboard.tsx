import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  residence: string;
  profile_logo: string | null;
  created_at: string;
  hours_ago: number;
  minutes_ago: number;
}

interface RegistrationData {
  recentRegistrations: User[];
  totalUsers: number;
  todayRegistrations: number;
  timeWindow: string;
  lastUpdated: string;
}

const AdminDashboard: React.FC = () => {
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrationAlerts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/auth/registration-alerts?hours=24&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch registration alerts');
      }

      const data = await response.json();
      setRegistrationData(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching registration alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrationAlerts();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRegistrationAlerts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="admin-dashboard loading">Loading registration alerts...</div>;
  }

  if (error) {
    return <div className="admin-dashboard error">Error: {error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🎉 Registration Alerts Dashboard</h1>
        <div className="stats-overview">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{registrationData?.totalUsers || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Today's Registrations</h3>
            <p className="stat-number">{registrationData?.todayRegistrations || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Last Updated</h3>
            <p className="stat-time">
              {registrationData?.lastUpdated ? 
                new Date(registrationData.lastUpdated).toLocaleTimeString() : 
                'N/A'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="recent-registrations">
        <h2>Recent Registrations (Last 24 Hours)</h2>
        {registrationData?.recentRegistrations && registrationData.recentRegistrations.length > 0 ? (
          <div className="registrations-list">
            {registrationData.recentRegistrations.map((user) => (
              <div key={user.id} className="registration-card">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.profile_logo ? (
                      <img src={user.profile_logo} alt={user.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <h4>{user.first_name} {user.last_name}</h4>
                    <p className="username">@{user.username}</p>
                    <p className="email">{user.email}</p>
                    <p className="location">{user.residence || 'Location not specified'}</p>
                  </div>
                </div>
                <div className="registration-time">
                  <p className="time-ago">
                    {user.minutes_ago < 60 
                      ? `${Math.round(user.minutes_ago)} minutes ago`
                      : `${Math.round(user.hours_ago)} hours ago`
                    }
                  </p>
                  <p className="exact-time">
                    {new Date(user.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-registrations">
            <p>No new registrations in the last 24 hours</p>
          </div>
        )}
      </div>

      <div className="dashboard-actions">
        <button onClick={fetchRegistrationAlerts} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard; 