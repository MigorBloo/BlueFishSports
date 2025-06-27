import React, { useState, useEffect } from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import './YourPicks.css';
import tournamentData from '../../Data/tournaments.json';
import currentTournament from '../../Data/currentTournament.json';
import rankings from '../../Data/rankings.json';
import tennisConfig from '../../config/tennisConfig';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

console.log('Imported data:', {
  tournamentData,
  currentTournament,
  rankings
});

console.log('Player keys:', Object.keys(currentTournament[0]));

function getNextTournament(tournaments: any[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to midnight
  
  // Parse and sort tournaments by date
  const sorted = tournaments
    .map((t: any) => {
      const [day, month, year] = t["Date"].split('.');
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      parsedDate.setHours(0, 0, 0, 0); // Set time to midnight
      return {
        ...t,
        parsedDate
      };
    })
    .filter((t: any) => !isNaN(t.parsedDate.getTime()))
    .sort((a: any, b: any) => a.parsedDate.getTime() - b.parsedDate.getTime());

  // Find the current tournament (one that started today or earlier)
  const currentTournament = sorted.find((t: any) => {
    const endOfDay = new Date(t.parsedDate);
    endOfDay.setHours(23, 59, 59, 999);
    return today <= endOfDay;
  });

  // If we have a current tournament, return it
  if (currentTournament) {
    return currentTournament;
  }

  // Otherwise, find the next upcoming tournament
  return sorted.find((t: any) => t.parsedDate > today) || sorted[0];
}

const EventInfo = ({ tournament }: { tournament: any }) => {
  if (!tournament) return null;
  const { Tournament, Date: dateStr, Designation, Surface, Winner } = tournament;
  const getBorderClass = (surface: string) => {
    switch (surface) {
      case 'Clay':
        return 'row-clay';
      case 'Grass':
        return 'row-grass';
      case 'Hard':
        return 'row-hard';
      default:
        return '';
    }
  };

  // Use tennisConfig.startTime for Start Time
  const startTime = tennisConfig.startTime ? `${tennisConfig.startTime} CET` : '--:--';

  // Calculate Time till Lock
  let timeTillLock = '--';
  let timeTillLockClass = '';
  if (dateStr && tennisConfig.startTime) {
    // Date is in format 'dd.mm' or 'dd.mm.yyyy'
    const [day, month, year] = dateStr.split('.');
    const now = new Date();
    // Use current year if not provided
    const eventYear = year ? parseInt(year) : now.getFullYear();
    // Parse start time (HH:mm)
    const [hours, minutes] = tennisConfig.startTime.split(':').map(Number);
    // Create CET date (Central European Time is UTC+1 or UTC+2 with DST)
    // We'll use UTC+2 for summer (May is summer time in Europe)
    const eventDate = new Date(Date.UTC(eventYear, parseInt(month) - 1, parseInt(day), hours - 2, minutes));
    // Get difference in ms
    const diffMs = eventDate.getTime() - now.getTime();
    if (diffMs > 0) {
      const diffMins = Math.floor(diffMs / 60000);
      const days = Math.floor(diffMins / (60 * 24));
      const hoursLeft = Math.floor((diffMins % (60 * 24)) / 60);
      const mins = diffMins % 60;
      if (diffMins > 24 * 60) {
        // More than 24 hours: green, show days and hours
        timeTillLock = `${days}d ${hoursLeft}h`;
        timeTillLockClass = 'time-till-lock-green';
      } else {
        // Less than 24 hours: red, show hours and minutes
        timeTillLock = `${hoursLeft}h ${mins}m`;
        timeTillLockClass = 'time-till-lock-red';
      }
    } else {
      timeTillLock = 'Locked';
      timeTillLockClass = '';
    }
  }

  return (
    <div className={`event-info ${getBorderClass(Surface)}`} style={{ width: '100%', minWidth: '0' }}>
      <div className="event-info-details">
        <div className="event-info-row event-info-row-tournament">
          <div className="event-info-item tournament" style={{ flex: 1 }}>
            {Tournament}
          </div>
        </div>
        <div className="event-info-row event-info-row-middle">
          <div className="event-info-item"><strong>Surface</strong>{Surface}</div>
          <div className="event-info-item"><strong>Designation</strong>{Designation}</div>
          <div className="event-info-item"><strong>Points Winner</strong>{Winner}</div>
        </div>
        <div className="event-info-row event-info-row-bottom">
          <div className="event-info-item"><strong>Date</strong>{dateStr}</div>
          <div className="event-info-item"><strong>Start Time</strong>{startTime}</div>
          <div className={`event-info-item ${timeTillLockClass}`}><strong>Time till Lock</strong>{timeTillLock}</div>
        </div>
      </div>
    </div>
  );
};

const Selections = () => {
  const { user } = useAuth();
  const getPlayerName = (playerObj: any) =>
    (playerObj?.Name ||
     playerObj?.["Name "] ||
     playerObj?.["Name "] ||
     playerObj?.Player ||
     '').trim();

  const rankingMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    rankings.forEach((r: any) => {
      if (r.Player) {
        const playerName = r.Player.trim().toLowerCase();
        map[playerName] = r;
      }
    });
    return map;
  }, []);

  // Move gold, silver, bronze arrays into useMemo
  const { gold, silver, bronze, isFieldEmpty } = React.useMemo(() => {
    const gold: any[] = [];
    const silver: any[] = [];
    const bronze: any[] = [];

    console.log('Current tournament data:', currentTournament);
    currentTournament.forEach((p: any) => {
      // Robustly find the player name key
      const nameKey = Object.keys(p).find(k => k.trim().startsWith("Name"));
      const playerName = nameKey ? p[nameKey]?.trim().toLowerCase() : undefined;
      console.log('Processing player:', playerName);
      if (playerName) {
        const ranking = rankingMap[playerName];
        console.log('Found ranking:', ranking);
        if (ranking) {
          if (ranking.Bucket === 'Gold') {
            gold.push({ ...p, ...ranking });
            console.log('Added to gold:', playerName);
          }
          else if (ranking.Bucket === 'Silver') {
            silver.push({ ...p, ...ranking });
            console.log('Added to silver:', playerName);
          }
          else if (ranking.Bucket === 'Bronze') {
            bronze.push({ ...p, ...ranking });
            console.log('Added to bronze:', playerName);
          }
        } else {
          console.log('No ranking found for:', playerName);
        }
      }
    });

    console.log('Final arrays:', { gold, silver, bronze });
    return { 
      gold, 
      silver, 
      bronze,
      isFieldEmpty: currentTournament.length === 0 
    };
  }, [rankingMap]);

  // Dropdown state for each category
  const [selectedGold, setSelectedGold] = React.useState<any>(null);
  const [selectedSilver, setSelectedSilver] = React.useState<any>(null);
  const [selectedBronze, setSelectedBronze] = React.useState<any>(null);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  // Confirmed state for each category
  const [confirmedGold, setConfirmedGold] = React.useState<any>(null);
  const [confirmedSilver, setConfirmedSilver] = React.useState<any>(null);
  const [confirmedBronze, setConfirmedBronze] = React.useState<any>(null);

  // Search state for each category
  const [searchGold, setSearchGold] = React.useState('');
  const [searchSilver, setSearchSilver] = React.useState('');
  const [searchBronze, setSearchBronze] = React.useState('');

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Get next tournament
  const nextTournament = getNextTournament(tournamentData);

  // Check if tournament is locked
  React.useEffect(() => {
    if (nextTournament.Date && tennisConfig.startTime) {
      const [day, month, year] = nextTournament.Date.split('.');
      const now = new Date();
      const eventYear = year ? parseInt(year) : now.getFullYear();
      const [hours, minutes] = tennisConfig.startTime.split(':').map(Number);
      const eventDate = new Date(Date.UTC(eventYear, parseInt(month) - 1, parseInt(day), hours - 2, minutes));
      setIsLocked(now >= eventDate);
    }
  }, [nextTournament.Date, tennisConfig.startTime]);

  // Add usedPlayers state
  const [usedPlayers, setUsedPlayers] = useState<Set<string>>(new Set());

  // Fetch existing selections when component mounts
  React.useEffect(() => {
    const fetchSelections = async () => {
      if (!user) return;

      try {
        const response = await api.get(`/api/tennis/selections/${user.id}`);
        const selections = response.data;

        // Find all picks from tournaments before the current one
        const prevPicks = new Set<string>();
        selections.forEach((s: any) => {
          if (s.tournament !== nextTournament.Tournament) {
            [s.gold_selection, s.silver_selection, s.bronze_selection].forEach((pick) => {
              if (pick) prevPicks.add(pick.trim().toLowerCase());
            });
          }
        });
        setUsedPlayers(prevPicks);

        // Find the selection for the current tournament
        const currentSelection = selections.find((s: any) => s.tournament === nextTournament.Tournament);
        
        if (currentSelection) {
          // Find the player objects from the rankings
          const goldPlayer = gold.find(p => p.Name === currentSelection.gold_selection);
          const silverPlayer = silver.find(p => p.Name === currentSelection.silver_selection);
          const bronzePlayer = bronze.find(p => p.Name === currentSelection.bronze_selection);

          if (goldPlayer) {
            setSelectedGold(goldPlayer);
            setConfirmedGold(goldPlayer);
            setSearchGold(goldPlayer.Name);
          }
          if (silverPlayer) {
            setSelectedSilver(silverPlayer);
            setConfirmedSilver(silverPlayer);
            setSearchSilver(silverPlayer.Name);
          }
          if (bronzePlayer) {
            setSelectedBronze(bronzePlayer);
            setConfirmedBronze(bronzePlayer);
            setSearchBronze(bronzePlayer.Name);
          }
        }
      } catch (err) {
        console.error('Error fetching selections:', err);
      }
    };

    fetchSelections();
  }, [user, nextTournament.Tournament, gold, silver, bronze]);

  const saveSelections = async (bucket: string) => {
    if (!user) {
      setError('You must be logged in to save selections');
      return;
    }

    if (isLocked) {
      setError('Tournament is locked. No more selections can be made.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Always send all three picks, using the most up-to-date value for the current bucket
    const goldName = bucket === 'Gold'
      ? getPlayerName(selectedGold)
      : getPlayerName(confirmedGold);
    const silverName = bucket === 'Silver'
      ? getPlayerName(selectedSilver)
      : getPlayerName(confirmedSilver);
    const bronzeName = bucket === 'Bronze'
      ? getPlayerName(selectedBronze)
      : getPlayerName(confirmedBronze);

    try {
      await api.post('/api/tennis/selections', {
        user_id: user.id,
        tournament: nextTournament.Tournament,
        gold_selection: goldName,
        silver_selection: silverName,
        bronze_selection: bronzeName,
      });

      // Update confirmed states
      if (bucket === 'Gold') setConfirmedGold(selectedGold);
      if (bucket === 'Silver') setConfirmedSilver(selectedSilver);
      if (bucket === 'Bronze') setConfirmedBronze(selectedBronze);

      // Show success message
      setSuccessMessage(`${bucket} selection saved successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      if (err.response?.data?.error === 'Tournament is locked') {
        setIsLocked(true);
        setError('Tournament is locked. No more selections can be made.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save selections');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderDropdown = (
    players: any[],
    bucket: string,
    selected: any,
    setSelected: any,
    confirmed: any,
    setConfirmed: any,
    search: string,
    setSearch: (v: string) => void
  ) => {
    // Filter players by search
    const filteredPlayers = players.filter((player) =>
      (player.Name || player["Name "] || player["Name "] || player.Player)?.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div className={`selection-category-container ${bucket.toLowerCase()}${confirmed === selected && confirmed ? ' confirmed' : ''}${isLocked ? ' locked' : ''}`}> 
        <div className="selection-row">
          <div className={`custom-dropdown-container ${bucket.toLowerCase()}`}> 
            <label className="dropdown-label">{bucket}</label>
            <div className="custom-dropdown">
              <input
                type="text"
                className="dropdown-search"
                placeholder={isLocked ? "Tournament is locked" : "Search or select a player..."}
                value={search}
                onChange={e => {
                  if (!isLocked) {
                    setSearch(e.target.value);
                    setOpenDropdown(bucket);
                  }
                }}
                onFocus={() => {
                  if (!isLocked) {
                    setOpenDropdown(bucket);
                  }
                }}
                style={{ 
                  width: '90%', 
                  padding: '8px 12px', 
                  borderRadius: 4, 
                  border: '1px solid #bbb', 
                  fontSize: '1rem',
                  backgroundColor: isLocked ? '#f5f5f5' : 'white',
                  cursor: isLocked ? 'not-allowed' : 'text'
                }}
                disabled={isLocked}
              />
              {openDropdown === bucket && !isLocked && (
                <div className="dropdown-options">
                  {filteredPlayers.map((player, idx) => {
                    const playerName = (player.Name || player["Name "] || player["Name "] || player.Player)?.trim().toLowerCase();
                    const isUsed = usedPlayers.has(playerName);
                    return (
                      <div
                        className={`dropdown-option${isUsed ? ' used-player' : ''}`}
                        key={player.Name || player["Name "] || player.Player || idx}
                        onClick={() => {
                          if (isUsed) {
                            setError('Player has already been used');
                            setTimeout(() => setError(null), 2000);
                            return;
                          }
                          setSelected(player);
                          setSearch(player.Name || player["Name "] || player.Player);
                          setOpenDropdown(null);
                        }}
                        style={isUsed ? { color: '#aaa', cursor: 'not-allowed', background: '#f5f5f5' } : {}}
                      >
                        {player["Seeding Rank"] || player["Seeding Ranking"] || player.Rank} - {player.Name || player["Name "] || player.Player}
                      </div>
                    );
                  })}
                  {filteredPlayers.length === 0 && (
                    <div className="dropdown-option" style={{ color: '#888', cursor: 'default' }}>
                      No players found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="confirm-reject-row">
            <button
              className="confirm-btn"
              title="Confirm"
              onClick={() => saveSelections(bucket)}
              disabled={!selected || isLoading || isLocked}
            >
              &#10003;
            </button>
            <button
              className="reject-btn"
              title="Reject"
              onClick={() => {
                if (!isLocked) {
                  setSelected(null);
                  setSearch('');
                  setConfirmed(null);
                }
              }}
              disabled={(!selected && !confirmed) || isLocked}
            >
              &#10005;
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="selections-component">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {isLocked && <div className="locked-message">Tournament is locked. No more selections can be made.</div>}
      {isFieldEmpty && <div className="field-not-set-message">Tournament Field is not set yet</div>}
      
      {!isFieldEmpty && (
        <>
          {renderDropdown(
            gold,
            'Gold',
            selectedGold,
            setSelectedGold,
            confirmedGold,
            setConfirmedGold,
            searchGold,
            setSearchGold
          )}
          
          {renderDropdown(
            silver,
            'Silver',
            selectedSilver,
            setSelectedSilver,
            confirmedSilver,
            setConfirmedSilver,
            searchSilver,
            setSearchSilver
          )}
          
          {renderDropdown(
            bronze,
            'Bronze',
            selectedBronze,
            setSelectedBronze,
            confirmedBronze,
            setConfirmedBronze,
            searchBronze,
            setSearchBronze
          )}
        </>
      )}
    </div>
  );
};

const YourPicks = () => {
  const nextTournament = getNextTournament(tournamentData);
  const navigate = useNavigate();

  return (
    <div className="yourpicks-page">
      <NavigationBar />
      <div className="page-container">
        <div className="content-container">
          <div className="tournament-row">
            <div className="event-info-wrapper">
              <h2 className="event-info-subheading">This Week's Tournament</h2>
              <EventInfo tournament={nextTournament} />
            </div>
            <div className="selections-column">
              <h2 className="event-info-subheading">Your Picks</h2>
              <Selections />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourPicks; 