import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { UserSelection as UserSelectionType, ActualResult as ActualResultType } from '../../types';
import NBADraftService from '../../services/NBADraftService';
import { useTotalPoints } from '../../contexts/TotalPointsContext';
import { calculateAllScores } from '../../utils/scoreCalculator';
import './ActualResult.css';
import { TotalPointsProvider } from '../../contexts/TotalPointsContext';

interface ActualResult {
  pick: number;
  team: string;
  player: string;
  position: string;
  trade: boolean;
}

interface UserSelection {
  pick: number;
  team: string;
  player: string;
  position: string;
  trade: boolean;
}

interface ActualResultProps {
  username?: string;
}

const ActualResult: React.FC<ActualResultProps> = ({ username }) => {
  const { user } = useAuth();
  const { setTotalPoints } = useTotalPoints();
  const [actualResults, setActualResults] = useState<ActualResult[]>([]);
  const [userSelections, setUserSelections] = useState<UserSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<Map<number, number>>(new Map());
  const [localTotalPoints, setLocalTotalPoints] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user && !username) {
        setError('Please log in to view scores');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('ActualResult: Fetching data for user:', username || user?.id);
        
        const [results, selections] = await Promise.all([
          NBADraftService.getActualResults(),
          username
            ? NBADraftService.getUserSelectionsByUsername(username)
            : NBADraftService.getUserSelections(user!.id)
        ]);

        console.log('ActualResult: Fetched results:', results);
        console.log('ActualResult: Fetched selections:', selections);

        setActualResults(results);
        setUserSelections(selections);
        
        // Only calculate scores if we have valid data
        if (results && selections) {
          try {
            const calculatedScores = calculateAllScores(selections, results);
            console.log('ActualResult: Calculated scores:', calculatedScores);
            setScores(calculatedScores);
            
            // Calculate total points
            const total = Array.from(calculatedScores.values()).reduce((sum, score) => sum + score, 0);
            console.log('ActualResult: Setting total points:', total);
            setLocalTotalPoints(total);
            setTotalPoints(total);
          } catch (scoreError) {
            console.error('Error calculating scores:', scoreError);
            // Don't set error here, just set scores to empty map
            setScores(new Map());
            setLocalTotalPoints(0);
            setTotalPoints(0);
          }
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error instanceof Error) {
          setError(`Failed to load data: ${error.message}`);
        } else {
          setError('Failed to load data. Please check the console for more details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, setTotalPoints, username]);

  const getCellClass = (actual: ActualResult, field: keyof ActualResult) => {
    const userSelection = userSelections.find(selection => selection.pick === actual.pick);
    if (!userSelection) return '';

    // Create a map of team to actual results for easier lookup
    const teamToResults = new Map<string, ActualResult[]>();
    actualResults.forEach(result => {
      if (!teamToResults.has(result.team.trim())) {
        teamToResults.set(result.team.trim(), []);
      }
      teamToResults.get(result.team.trim())?.push(result);
    });

    // Get all results for the user's selected team
    const teamResults = teamToResults.get(userSelection.team.trim()) || [];

    if (field === 'player') {
      const matchesPick = userSelection.player.trim() === actual.player.trim();
      const matchesTeam = teamResults.some(result => userSelection.player.trim() === result.player.trim());
      return matchesPick || matchesTeam ? 'match-cell' : 'mismatch-cell';
    }

    if (field === 'position') {
      const matchesPick = userSelection.position === actual.position;
      const matchesTeam = teamResults.some(result => userSelection.position === result.position);
      return matchesPick || matchesTeam ? 'match-cell' : 'mismatch-cell';
    }

    if (field === 'team') {
      const isMatch = userSelection.team.trim() === actual.team.trim();
      return isMatch ? 'match-cell' : 'mismatch-cell';
    }

    const isMatch = userSelection[field] === actual[field];
    return isMatch ? 'match-cell' : 'mismatch-cell';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Check if results are available (not all TBD)
  const hasResults = actualResults.some(result => result.player && result.player !== 'TBD' && result.player.trim() !== '');
  
  if (!hasResults) {
    return (
      <div className="results-not-available-container">
        <div className="results-not-available-message">
          <h3>Results Not Available Yet</h3>
          <p>The NBA Draft results will be available after the draft on June 26th, 2025 at 8:00 PM ET.</p>
          <p>Check back after the draft to see how your picks performed!</p>
        </div>
      </div>
    );
  }

  const correctSelections = userSelections.filter(selection => {
    const actualResult = actualResults.find(r => r.pick === selection.pick);
    if (!actualResult) return false;
    return selection.team.trim() === actualResult.team.trim() &&
           selection.player.trim() === actualResult.player.trim() &&
           selection.position.trim() === actualResult.position.trim() &&
           selection.trade === actualResult.trade;
  }).length;

  const percentageScore = ((localTotalPoints / (600 * 30)) * 100).toFixed(2);

  return (
    <div className="actual-result-container">
      <table className="actual-result-table">
        <tbody>
          <tr className="summary-row">
            <td className="table-cell summary-cell" colSpan={2}>Total Points Scored</td>
            <td className="table-cell summary-cell">{localTotalPoints}</td>
            <td className="table-cell summary-cell">Correct Selections</td>
            <td className="table-cell summary-cell">{correctSelections}</td>
            <td className="table-cell summary-cell">% Score</td>
            <td className="table-cell summary-cell">{percentageScore}%</td>
          </tr>
        </tbody>
      </table>

      <div className="actual-results-table-container">
        <table className="actual-result-table">
          <thead>
            <tr>
              <th className="header-cell">Pick</th>
              <th className="header-cell">Team</th>
              <th className="header-cell">Player</th>
              <th className="header-cell">Position</th>
              <th className="header-cell">Trade</th>
              <th className="header-cell">Points</th>
            </tr>
          </thead>
          <tbody>
            {actualResults.map((result) => (
              <tr key={result.pick}>
                <td className="table-cell">{result.pick}</td>
                <td className={`table-cell ${getCellClass(result, 'team')}`}>
                  {result.team}
                </td>
                <td className={`table-cell ${getCellClass(result, 'player')}`}>
                  {result.player}
                </td>
                <td className={`table-cell ${getCellClass(result, 'position')}`}>
                  {result.position}
                </td>
                <td className={`table-cell ${getCellClass(result, 'trade')}`}>
                  {result.trade ? 'Yes' : 'No'}
                </td>
                <td className={`table-cell points-cell ${scores.get(result.pick) === 600 ? 'perfect-score' : ''}`}>
                  {scores.get(result.pick) || 0}
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td className="table-cell total-label" colSpan={5}>
                Total Points Scored
              </td>
              <td className="table-cell points-cell">
                {localTotalPoints}
              </td>
            </tr>
            <tr className="total-row">
              <td className="table-cell total-label" colSpan={5}>
                Correct Selections
              </td>
              <td className="table-cell points-cell">
                {correctSelections}
              </td>
            </tr>
            <tr className="total-row">
              <td className="table-cell total-label" colSpan={5}>
                % Score
              </td>
              <td className="table-cell points-cell">
                {percentageScore}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActualResult; 