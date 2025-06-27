import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../../services/api';
import './UserResults.css';
import tournamentData from '../../Data/tournaments.json';

interface UserResultsData {
  summary: {
    gold_points: number;
    silver_points: number;
    bronze_points: number;
    total_points: number;
  };
  results: Array<{
    tournament: string;
    gold_selection: string;
    gold_result: string;
    gold_points: number;
    silver_selection: string;
    silver_result: string;
    silver_points: number;
    bronze_selection: string;
    bronze_result: string;
    bronze_points: number;
    total_points: number;
  }>;
}

const UserResults: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<UserResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserResults = async () => {
      try {
        console.log('Fetching results for username:', username);
        const response = await api.get(`/api/tennis/user-results/${username}`);
        console.log('Received data:', response.data);
        setData(response.data);
      } catch (err) {
        setError('Failed to load user results');
        console.error('Error fetching user results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserResults();
  }, [username]);

  // Add function to determine surface type
  const getSurfaceType = (tournamentName: string): string => {
    // Find the tournament in the tournamentData array
    const tournament = tournamentData.find(
      (t: any) => t.Tournament === tournamentName
    );
    if (!tournament) return 'row-hard'; // Default if not found

    switch ((tournament.Surface || '').toLowerCase()) {
      case 'clay':
        return 'row-clay';
      case 'grass':
        return 'row-grass';
      case 'hard':
        return 'row-hard';
      default:
        return 'row-hard';
    }
  };

  // Map tournament name to date for sorting
  const tournamentDateMap: Record<string, string> = {};
  tournamentData.forEach((t: any) => {
    tournamentDateMap[t.Tournament] = t.Date;
  });

  function parseTournamentDate(dateStr: string): Date {
    // Expects "DD.MM.YYYY"
    const [day, month, year] = dateStr.split('.');
    return new Date(`${year}-${month}-${day}`);
  }

  // Sort results by tournament date
  const sortedResults = [...data?.results || []].sort((a, b) => {
    const dateA = parseTournamentDate(tournamentDateMap[a.tournament] || '01.01.2100');
    const dateB = parseTournamentDate(tournamentDateMap[b.tournament] || '01.01.2100');
    return dateA.getTime() - dateB.getTime();
  });

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return <div className="no-results">No results found</div>;

  return (
    <div className="user-results-page">
      <div className="content-container">
        <h1 className="user-results-heading">{username} Results</h1>
        <div className="summary-table-container">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Gold Points</th>
                <th>Silver Points</th>
                <th>Bronze Points</th>
                <th>Total Points</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.summary.gold_points}</td>
                <td>{data.summary.silver_points}</td>
                <td>{data.summary.bronze_points}</td>
                <td>{data.summary.total_points}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Tournament</th>
                <th>Gold Selection</th>
                <th>Gold Result</th>
                <th>Gold Points</th>
                <th>Silver Selection</th>
                <th>Silver Result</th>
                <th>Silver Points</th>
                <th>Bronze Selection</th>
                <th>Bronze Result</th>
                <th>Bronze Points</th>
                <th>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result, index) => (
                <tr key={index} className={getSurfaceType(result.tournament)}>
                  <td>{result.tournament}</td>
                  <td>{result.gold_selection}</td>
                  <td>{result.gold_result}</td>
                  <td>{result.gold_points}</td>
                  <td>{result.silver_selection}</td>
                  <td>{result.silver_result}</td>
                  <td>{result.silver_points}</td>
                  <td>{result.bronze_selection}</td>
                  <td>{result.bronze_result}</td>
                  <td>{result.bronze_points}</td>
                  <td>{result.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserResults; 