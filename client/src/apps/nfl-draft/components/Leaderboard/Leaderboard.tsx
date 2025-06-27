import React, { useState, useEffect } from 'react';
import nflDraftService from '../../services/nflDraftService';
import { LeaderboardEntry } from '../../types';
import './Leaderboard.css';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTotalPoints } from '../../contexts/TotalPointsContext';
import { useNavigate } from 'react-router-dom';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { totalPoints } = useTotalPoints();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Leaderboard: Starting fetch with totalPoints:', totalPoints);
        
        // Fetch leaderboard data
        const response = await nflDraftService.getLeaderboard();
        console.log('Leaderboard: Raw response from server:', response);
        
        // Ensure we have valid data to work with
        if (!Array.isArray(response)) {
          console.error('Leaderboard: Invalid response format:', response);
          setError('Invalid data format received from server');
          return;
        }
        
        // Log each entry before sorting
        console.log('Leaderboard: Entries before sorting:', response.map(entry => ({
          id: entry.id,
          username: entry.username,
          total_points: entry.total_points,
          correct_selections: entry.correct_selections,
          percentage_score: entry.percentage_score
        })));
        
        // Sort by total points in descending order
        const sortedLeaderboard = response.sort((a, b) => b.total_points - a.total_points);
        console.log('Leaderboard: After sorting:', sortedLeaderboard.map(entry => ({
          id: entry.id,
          username: entry.username,
          total_points: entry.total_points
        })));
        
        // Add rank to each entry without modifying scores
        const rankedLeaderboard = sortedLeaderboard.map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

        console.log('Leaderboard: Final processed data:', rankedLeaderboard);
        setLeaderboard(rankedLeaderboard);
        setError(null);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [totalPoints, user?.id]);

  if (loading) {
    return (
      <div className="table-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-wrapper">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const currentUserEntry = user ? leaderboard.find(entry => entry.id === user.id) : null;

  return (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="header-cell">Rank</th>
                <th className="header-cell">User</th>
                <th className="header-cell">Correct Selections</th>
                <th className="header-cell">Total Points</th>
                <th className="header-cell">% Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr 
                  key={entry.id}
                  className={entry.id === user?.id ? 'current-user-row' : ''}
                >
                  <td>
                    <span className={`rank-${entry.rank}`}>
                      #{entry.rank}
                    </span>
                  </td>
                  <td>
                    <div
                      className="user-info-cell"
                      style={{ cursor: entry.id !== user?.id ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (entry.id !== user?.id) {
                          navigate(`/nfl-draft/results/${entry.username}`);
                        }
                      }}
                    >
                      <div className="avatar">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="username">
                        {entry.username}
                      </span>
                    </div>
                  </td>
                  <td className={entry.correct_selections > 0 ? 'score-cell' : ''}>
                    {entry.correct_selections}
                  </td>
                  <td className={entry.total_points > 0 ? 'score-cell' : ''}>
                    {entry.total_points}
                  </td>
                  <td className={entry.percentage_score > 0 ? 'score-cell' : ''}>
                    {entry.percentage_score}%
                  </td>
                </tr>
              ))}
              {/* Frozen bottom row for current user */}
              {currentUserEntry && (
                <tr className="frozen-bottom-row">
                  <td>
                    <span className={`rank-${currentUserEntry.rank}`}>
                      #{currentUserEntry.rank}
                    </span>
                  </td>
                  <td>
                    <div className="user-info-cell">
                      <div className="avatar">
                        {currentUserEntry.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="username">
                        {currentUserEntry.username}
                      </span>
                    </div>
                  </td>
                  <td className={currentUserEntry.correct_selections > 0 ? 'score-cell' : ''}>
                    {currentUserEntry.correct_selections}
                  </td>
                  <td className={currentUserEntry.total_points > 0 ? 'score-cell' : ''}>
                    {currentUserEntry.total_points}
                  </td>
                  <td className={currentUserEntry.percentage_score > 0 ? 'score-cell' : ''}>
                    {currentUserEntry.percentage_score}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
    </div>
  );
};

export default Leaderboard; 