import React, { useEffect, useState } from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import './Results.css';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import tournamentData from '../../Data/tournaments.json';
import weeklyResults from '../../Data/WeeklyResultTennis.json';
import { useParams, useNavigate } from 'react-router-dom';

interface TournamentResult {
  tournament: string;
  tournament_date: string;
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
  is_locked: boolean;
}

const Results: React.FC = () => {
  const { user_id } = useParams<{ user_id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<TournamentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewedUserName, setViewedUserName] = useState<string>('');
  const [summary, setSummary] = useState<{
    total_gold_points: number;
    total_silver_points: number;
    total_bronze_points: number;
    total_points: number;
  } | null>(null);

  // Get all tournaments from the schedule
  const allTournaments = React.useMemo(() => {
    return tournamentData.map((t: any) => ({
      tournament: t.Tournament,
      date: t.Date
    })).sort((a, b) => {
      // Sort by date
      const [dayA, monthA, yearA] = a.date.split('.');
      const [dayB, monthB, yearB] = b.date.split('.');
      const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
      const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
      return dateA.getTime() - dateB.getTime(); // Earliest first
    });
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/tennis/results/${user_id || user?.id}`);
        setResults(response.data);
        // Fetch the viewed user's name if viewing another user's results
        if (user_id && user_id !== user?.id) {
          const userResponse = await api.get(`/api/users/${user_id}`);
          setViewedUserName(userResponse.data.name);
        }
      } catch (err) {
        console.log('No results found, showing empty tournament list');
        setResults([]); // Set empty results instead of error
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user_id, user?.id]);

  useEffect(() => {
    // Fetch summary for either the current user or the viewed user
    const userId = user_id || user?.id;
    if (!userId) return;
    
    api.get(`/api/tennis/results/summary/${userId}`)
      .then(res => setSummary(res.data))
      .catch(err => {
        console.log('No summary found, setting to 0');
        setSummary({
          total_gold_points: 0,
          total_silver_points: 0,
          total_bronze_points: 0,
          total_points: 0
        });
      });
  }, [user_id, user?.id]);

  // Create a map of results by tournament for easy lookup
  const resultsByTournament = React.useMemo(() => {
    const map = new Map<string, TournamentResult>();
    results.forEach(result => {
      map.set(result.tournament, result);
    });
    return map;
  }, [results]);

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

  if (loading) {
    return <div className="loading-message">Loading...</div>;
  }

  const isViewingOwnResults = !user_id || user_id === user?.id;

  return (
    <div className="results-page">
      <NavigationBar />
      <div className="page-container">
        <div className="content-container">
          <h2 className="results-subheading">
            {isViewingOwnResults ? 'Your Results' : `Results for ${viewedUserName}`}
          </h2>
          {!isViewingOwnResults && (
            <button 
              className="back-button"
              onClick={() => navigate('/tennis/leaderboard')}
            >
              Back to Leaderboard
            </button>
          )}
          
          {/* Add Summary Table */}
          {summary && (
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
                    <td>{summary.total_gold_points}</td>
                    <td>{summary.total_silver_points}</td>
                    <td>{summary.total_bronze_points}</td>
                    <td>{summary.total_points}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

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
                {allTournaments.map((tournament, index) => {
                  const result = resultsByTournament.get(tournament.tournament);
                  const rowClass = getSurfaceType(tournament.tournament);
                  return (
                    <tr key={index} className={rowClass}>
                      <td>{tournament.tournament}</td>
                      <td className="selection-cell" title={result?.gold_selection || ''}>{result?.gold_selection || '-'}</td>
                      <td>{result?.gold_result || '-'}</td>
                      <td>{result?.gold_selection ? (result?.gold_points ?? 0) : '-'}</td>
                      <td className="selection-cell" title={result?.silver_selection || ''}>{result?.silver_selection || '-'}</td>
                      <td>{result?.silver_result || '-'}</td>
                      <td>{result?.silver_selection ? (result?.silver_points ?? 0) : '-'}</td>
                      <td className="selection-cell" title={result?.bronze_selection || ''}>{result?.bronze_selection || '-'}</td>
                      <td>{result?.bronze_result || '-'}</td>
                      <td>{result?.bronze_selection ? (result?.bronze_points ?? 0) : '-'}</td>
                      <td className="total-points">{
                        (result?.gold_selection || result?.silver_selection || result?.bronze_selection)
                          ? (result?.total_points ?? 0)
                          : '-'
                      }</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;

function getPlayerResultAndPoints(player: string) {
  const found = weeklyResults.find(
    (entry: any) =>
      entry.Player &&
      entry.Player.trim().toLowerCase() === player.trim().toLowerCase()
  );
  if (found) {
    return { result: found.Result, points: found.Points };
  }
  return { result: '-', points: 0 };
} 