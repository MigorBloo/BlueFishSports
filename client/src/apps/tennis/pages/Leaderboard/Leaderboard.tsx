// client/src/apps/tennis/pages/Leaderboard/Leaderboard.tsx
import React, { useState, useEffect } from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import './Leaderboard.css';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LeaderboardEntry {
  rank: number;
  username: string;
  total_points: number;
  points_behind_leader: number;
  movement_points: number;
  movement_rank: number;
  previous_rank: number;
  user_id?: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      console.log('Fetching leaderboard data...');
      try {
        const response = await api.get('/api/tennis/leaderboard');
        console.log('Leaderboard response:', response.data);
        setLeaderboardData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Detailed error in leaderboard fetch:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers
          }
        });
        setError(err.response?.data?.error || 'Failed to fetch leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const getMovementClass = (movement: number) => {
    if (movement > 0) return 'movement-up';
    if (movement < 0) return 'movement-down';
    return 'movement-same';
  };

  const getMovementSymbol = (movement: number) => {
    if (movement > 0) return '↑';
    if (movement < 0) return '↓';
    return '→';
  };

  const handleUsernameClick = (username: string) => {
    navigate(`/tennis/user-results/${username}`);
  };

  return (
    <div className="leaderboard-page">
      <NavigationBar />
      <div className="page-container">
        <div className="content-container">
          <h1 className="page-header">Leaderboard</h1>
          <div className="leaderboard-table-container">
            {isLoading ? (
              <div className="loading-message">Loading leaderboard data...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Total Points</th>
                    <th>Points Behind Leader</th>
                    <th>Movement Points</th>
                    <th>Movement Rank</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((entry) => (
                    <tr
                      key={entry.username}
                      className={entry.username === user?.username ? 'current-user' : ''}
                      style={{ cursor: entry.username !== user?.username ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (entry.username !== user?.username) {
                          handleUsernameClick(entry.username);
                        }
                      }}
                    >
                      <td>{entry.rank}</td>
                      <td>{entry.username}</td>
                      <td>{entry.total_points}</td>
                      <td>{entry.points_behind_leader}</td>
                      <td>{entry.movement_points}</td>
                      <td>{entry.movement_rank}</td>
                      <td className={getMovementClass(entry.movement_rank)}>
                        {getMovementSymbol(entry.movement_rank)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;