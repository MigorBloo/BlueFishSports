import React, { useState, useMemo } from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import './Tournament.css';
import tournamentData from '../../Data/tournaments.json'; // Adjust the path as needed

const Tournament: React.FC = () => {
  // State for filters
  const [designationFilter, setDesignationFilter] = useState<string>('All');
  const [surfaceFilter, setSurfaceFilter] = useState<string>('All');
  
  // State for sorting
  const [sortBy, setSortBy] = useState<string>('Date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique values for filters
  const designations = useMemo(() => {
    const unique = new Set(tournamentData.map(t => t.Designation));
    return ['All', ...Array.from(unique)];
  }, []);

  const surfaces = useMemo(() => {
    const unique = new Set(tournamentData.map(t => t.Surface));
    return ['All', ...Array.from(unique)];
  }, []);

  // Filter and sort tournaments
  const filteredAndSortedTournaments = useMemo(() => {
    let filtered = tournamentData;

    // Apply filters
    if (designationFilter !== 'All') {
      filtered = filtered.filter(t => t.Designation === designationFilter);
    }
    if (surfaceFilter !== 'All') {
      filtered = filtered.filter(t => t.Surface === surfaceFilter);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'Date') {
        const [dayA, monthA, yearA] = a.Date.split('.');
        const [dayB, monthB, yearB] = b.Date.split('.');
        const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
        return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      } else if (sortBy === 'Winner') {
        // First compare by Winner as numbers
        const winnerA = Number(a.Winner);
        const winnerB = Number(b.Winner);
        const winnerComparison = sortDirection === 'asc' 
          ? winnerA - winnerB
          : winnerB - winnerA;
        
        // If Winner values are the same, sort by Date (earliest to latest)
        if (winnerComparison === 0) {
          const [dayA, monthA, yearA] = a.Date.split('.');
          const [dayB, monthB, yearB] = b.Date.split('.');
          const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
          const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
          return dateA.getTime() - dateB.getTime(); // Sort by earliest date first
        }
        
        return winnerComparison;
      }
      return 0;
    });
  }, [designationFilter, surfaceFilter, sortBy, sortDirection]);

  return (
    <div className="tournament-page">
      <NavigationBar />
      <div className="page-container">
        <div className="content-container">
          <h1 className="page-header">Tournaments</h1>
          
          {/* Filter and Sort Section */}
          <div className="filter-sort-container">
            <div className="filter-section">
              <h3>Filter by:</h3>
              <div className="filter-controls">
                <div className="filter-group">
                  <label>Designation:</label>
                  <select 
                    value={designationFilter}
                    onChange={(e) => setDesignationFilter(e.target.value)}
                  >
                    {designations.map(designation => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Surface:</label>
                  <select 
                    value={surfaceFilter}
                    onChange={(e) => setSurfaceFilter(e.target.value)}
                  >
                    {surfaces.map(surface => (
                      <option key={surface} value={surface}>
                        {surface}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="sort-section">
              <h3>Sort by:</h3>
              <div className="sort-controls">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Date">Date</option>
                  <option value="Winner">Winner</option>
                </select>
                <button 
                  className="sort-direction-btn"
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          <div className="tournament-table-container">
            <table className="tournament-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tournament</th>
                  <th>Designation</th>
                  <th>Surface</th>
                  <th>Winner</th>
                  <th>Runner Up</th>
                  <th>Semi-Finals</th>
                  <th>Quarterfinals</th>
                  <th>Round of 16</th>
                  <th>Round of 32</th>
                  <th>Round of 64</th>
                  <th>Round of 128</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTournaments.map((row: any, idx: number) => {
                  let rowClass = '';
                  switch (row["Surface"]) {
                    case "Clay":
                      rowClass = 'row-clay';
                      break;
                    case "Grass":
                      rowClass = 'row-grass';
                      break;
                    case "Hard":
                      rowClass = 'row-hard';
                      break;
                    default:
                      rowClass = '';
                  }
                  return (
                    <tr key={idx} className={rowClass}>
                      <td className="bold">{row["Date"]}</td>
                      <td className="bold">{row["Tournament"]}</td>
                      <td className="bold">{row["Designation"]}</td>
                      <td>{row["Surface"]}</td>
                      <td>{row["Winner"]}</td>
                      <td>{row["Runner Up"]}</td>
                      <td>{row["Semi-Finals"]}</td>
                      <td>{row["Quarterfinals"]}</td>
                      <td>{row["Round of 16"]}</td>
                      <td>{row["Round of 32"]}</td>
                      <td>{row["Round of 64"]}</td>
                      <td>{row["Round of 128"]}</td>
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

export default Tournament; 