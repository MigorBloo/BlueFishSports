import React, { useState, useEffect, useMemo } from 'react';
import nflDraftService from '../../services/nflDraftService';
import { Prospect } from '../../types';
import './Top200Prospects.css';

const Top200Prospects: React.FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProspects = async () => {
      try {
        setLoading(true);
        const data = await nflDraftService.getTop200Prospects();
        setProspects(data);
        setError(null);
      } catch (error) {
        setError('Failed to load prospects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProspects();
  }, []);

  const uniquePositions = useMemo(() => 
    Array.from(new Set(prospects?.map(prospect => prospect?.position) ?? [])).sort(),
    [prospects]
  );

  const filteredProspects = useMemo(() => 
    prospects?.filter(prospect => {
      const matchesSearch = prospect?.player?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchesPosition = filterPosition ? prospect?.position === filterPosition : true;
      return matchesSearch && matchesPosition;
    }) ?? [],
    [prospects, searchTerm, filterPosition]
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
    <div className="top200-prospects-container">
      <div className="search-filters-container">
        <div className="search-field">
          <label htmlFor="search-input">Search by Name</label>
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name"
          />
        </div>
        
        <div className="filter-field">
          <label htmlFor="position-filter">Filter by Position</label>
          <select
            id="position-filter"
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
          >
            <option value="">All Positions</option>
            {uniquePositions.map(position => (
              <option key={position} value={position}>
                {position}
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
                <th className="rank-column">Rank</th>
                <th className="player-column">Player</th>
                <th className="position-column">Position</th>
                <th className="school-column">School</th>
                <th className="class-column">Class</th>
              </tr>
            </thead>
            <tbody>
              {filteredProspects.map((prospect) => (
                <tr key={prospect.id}>
                  <td className="rank-column">{prospect.rank}</td>
                  <td className="player-column">{prospect.player}</td>
                  <td className="position-column">{prospect.position}</td>
                  <td className="school-column">{prospect.school}</td>
                  <td className="class-column">{prospect.class}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Top200Prospects; 