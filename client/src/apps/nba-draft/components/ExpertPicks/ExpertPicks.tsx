import React, { useState, useEffect, useMemo } from 'react';
import NBADraftService from '../../services/NBADraftService';
import { ExpertPick } from '../../types';
import './ExpertPicks.css';

const ExpertPicks: React.FC = () => {
  const [expertPicks, setExpertPicks] = useState<ExpertPick[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpertPicks = async () => {
      try {
        setLoading(true);
        const data = await NBADraftService.getExpertPicks();
        setExpertPicks(data);
        setError(null);
      } catch (error) {
        setError('Failed to load expert picks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpertPicks();
  }, []);

  const uniqueExperts = useMemo(() => 
    Array.from(new Set(expertPicks.map(pick => pick.expert))).sort(),
    [expertPicks]
  );

  // Set the first expert as default if none is selected
  useEffect(() => {
    if (uniqueExperts.length > 0 && !selectedExpert) {
      setSelectedExpert(uniqueExperts[0]);
    }
  }, [uniqueExperts, selectedExpert]);

  const filteredPicks = useMemo(() => 
    expertPicks
      .filter(pick => pick.expert === selectedExpert)
      .sort((a, b) => a.pick - b.pick),
    [expertPicks, selectedExpert]
  );

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

  return (
    <div className="expert-picks-container">
      <div className="search-filters-container">
        <div className="expert-select">
          <label htmlFor="expert-select">Select Expert</label>
          <select
            id="expert-select"
            value={selectedExpert}
            onChange={(e) => setSelectedExpert(e.target.value)}
          >
            {uniqueExperts.map(expert => (
              <option key={expert} value={expert}>
                {expert.replace(/^Expert\s*-\s*/, '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="pick-column">Pick</th>
                <th className="team-column">Team</th>
                <th className="player-column">Player</th>
                <th className="position-column">Position</th>
              </tr>
            </thead>
            <tbody>
              {filteredPicks.map((pick) => (
                <tr key={pick.id}>
                  <td className="pick-column">{pick.pick}</td>
                  <td className="team-column">{pick.team}</td>
                  <td className="player-column">{pick.player}</td>
                  <td className="position-column">{pick.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpertPicks; 