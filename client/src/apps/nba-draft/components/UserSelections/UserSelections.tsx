import React, { useState, useEffect } from 'react';
import NBADraftService from '../../services/NBADraftService';
import { UserSelection, Prospect } from '../../types';
import { useAuth } from '../../../../contexts/AuthContext';
import './UserSelections.css';

export interface Team {
  id: string;
  team: string;
  original_pick_order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UserSelectionsProps {
  lockTime: string;
  isLocked: boolean;
}

const UserSelections: React.FC<UserSelectionsProps> = ({ lockTime, isLocked }) => {
  console.log('UserSelections - Received props:', { lockTime, isLocked });
  const { user } = useAuth();
  const [userSelections, setUserSelections] = useState<UserSelection[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add effect to update selection lock states
  useEffect(() => {
    if (userSelections.length > 0) {
      console.log('Updating selection lock states to match isLocked:', isLocked);
      setUserSelections(prev => prev.map(selection => ({
        ...selection,
        is_locked: isLocked
      })));
    }
  }, [isLocked, userSelections.length]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) {
        setError('Please log in to view your selections');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching initial data for user:', user.id);
        
        const [prospectsData, selectionsData, teamsData] = await Promise.all([
          NBADraftService.getTop200Prospects(),
          NBADraftService.getUserSelections(user.id),
          NBADraftService.getTeams()
        ]);

        console.log('Initial selections data:', selectionsData.map(s => ({
          pick: s.pick,
          team: s.team,
          is_locked: s.is_locked,
          confirmed: s.confirmed
        })));

        setProspects(prospectsData);
        setTeams(teamsData);

        if (selectionsData.length === 0) {
          console.log('No existing selections, creating initial selections');
          
          // Create initial selections for all teams in correct order
          const createPromises = teamsData.map((team) => {
            console.log(`Creating selection for ${team.team} with original_pick_order: ${team.original_pick_order}`);
            return NBADraftService.createUserSelection({
              userId: user.id,
              pick: team.original_pick_order,
              team: team.team,
              player: '',
              position: '',
              trade: false,
              confirmed: false,
              is_locked: isLocked,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });

          const createdSelections = await Promise.all(createPromises);
          console.log('Created selections:', createdSelections.map(s => ({
            pick: s.pick,
            team: s.team,
            is_locked: s.is_locked,
            confirmed: s.confirmed
          })));
          setUserSelections(createdSelections);
        } else {
          console.log('Existing selections found, maintaining pick order');
          // Sort selections by pick number to maintain order
          const sortedSelections = selectionsData.sort((a, b) => a.pick - b.pick);
          console.log('Sorted selections:', sortedSelections.map(s => ({
            pick: s.pick,
            team: s.team,
            is_locked: s.is_locked,
            confirmed: s.confirmed
          })));
          setUserSelections(sortedSelections);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user, isLocked]);

  // Add effect to log selection changes
  useEffect(() => {
    console.log('UserSelections state updated:', {
      isLocked,
      selections: userSelections.map(s => ({
        pick: s.pick,
        team: s.team,
        is_locked: s.is_locked,
        confirmed: s.confirmed
      }))
    });
  }, [userSelections, isLocked]);

  const handlePlayerChange = async (pick: number, newPlayer: Prospect | null) => {
    console.log('handlePlayerChange - isLocked:', isLocked);
    const selection = userSelections.find(s => s.pick === pick);
    if (!selection || isLocked) {
      console.log('handlePlayerChange - Blocked by lock:', { isLocked });
      return;
    }

    try {
      const updatedSelection = await NBADraftService.updateUserSelection({
        id: selection.id,
        userId: selection.userId,
        pick: selection.pick,
        team: selection.team,
        player: newPlayer?.player || '',
        position: newPlayer?.position || '',
        trade: selection.trade,
        confirmed: false,
        is_locked: selection.is_locked,
        createdAt: selection.createdAt,
        updatedAt: new Date().toISOString()
      });

      setUserSelections(prev => prev.map(s => 
        s.pick === pick ? updatedSelection : s
      ));
      setError(null);
    } catch (error) {
      console.error('Error updating player:', error);
      setError('Failed to update player. Please try again.');
    }
  };

  const handleTeamChange = async (pick: number, newTeam: string) => {
    const selection = userSelections.find(s => s.pick === pick);
    if (!selection || isLocked || !selection.trade) {
      setError('You must enable trade mode to change teams');
      return;
    }

    try {
      const updatedSelection = await NBADraftService.updateUserSelection({
        id: selection.id,
        userId: selection.userId,
        pick: selection.pick,
        team: newTeam,
        player: selection.player,
        position: selection.position,
        trade: true,
        confirmed: false,
        is_locked: selection.is_locked,
        createdAt: selection.createdAt,
        updatedAt: new Date().toISOString()
      });

      setUserSelections(prev => prev.map(s => 
        s.pick === pick ? updatedSelection : s
      ));
      setError(null);
    } catch (error) {
      console.error('Error updating team:', error);
      setError('Failed to update team. Please try again.');
    }
  };

  const handleTradeToggle = async (pick: number) => {
    const selection = userSelections.find(s => s.pick === pick);
    if (!selection || isLocked) return;

    try {
      const updatedSelection = await NBADraftService.updateUserSelection({
        id: selection.id,
        userId: selection.userId,
        pick: selection.pick,
        team: selection.team,
        player: selection.player,
        position: selection.position,
        trade: !selection.trade,
        confirmed: false,
        is_locked: selection.is_locked,
        createdAt: selection.createdAt,
        updatedAt: new Date().toISOString()
      });

      setUserSelections(prev => prev.map(s => 
        s.pick === pick ? updatedSelection : s
      ));
      setError(null);
    } catch (error) {
      console.error('Error toggling trade:', error);
      setError('Failed to toggle trade mode. Please try again.');
    }
  };

  const handleConfirmSelection = async (pick: number) => {
    const selection = userSelections.find(s => s.pick === pick);
    if (!selection || isLocked) return;

    try {
      const updatedSelection = await NBADraftService.updateUserSelection({
        id: selection.id,
        userId: selection.userId,
        pick: selection.pick,
        team: selection.team,
        player: selection.player,
        position: selection.position,
        trade: selection.trade,
        confirmed: true,
        is_locked: selection.is_locked,
        createdAt: selection.createdAt,
        updatedAt: new Date().toISOString()
      });

      setUserSelections(prev => prev.map(s => 
        s.pick === pick ? updatedSelection : s
      ));
      setError(null);
    } catch (error) {
      console.error('Error confirming selection:', error);
      setError('Failed to confirm selection. Please try again.');
    }
  };

  const getAvailablePlayers = (pick: number) => {
    const selection = userSelections.find(s => s.pick === pick);
    if (!selection) return [];

    // Filter out players that have been selected in earlier picks
    return prospects.filter(prospect => {
      const isSelected = userSelections.some(s => 
        s.pick < pick && s.player === prospect.player
      );
      return !isSelected;
    });
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  return (
    <div className="user-selections-container">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Pick</th>
              <th>Team</th>
              <th>Player</th>
              <th>Position</th>
              <th>Trade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {userSelections.map((selection) => (
              <tr key={selection.pick}>
                <td>{selection.pick}</td>
                <td>
                  {selection.trade ? (
                    <select
                      value={selection.team}
                      onChange={(e) => handleTeamChange(selection.pick, e.target.value)}
                      disabled={isLocked}
                    >
                      {teams.map((team) => (
                        <option key={team.id} value={team.team}>
                          {team.team}
                        </option>
                      ))}
                    </select>
                  ) : (
                    selection.team
                  )}
                </td>
                <td>
                  <select
                    value={selection.player}
                    onChange={(e) => {
                      const prospect = prospects.find(p => p.player === e.target.value);
                      handlePlayerChange(selection.pick, prospect || null);
                    }}
                    disabled={isLocked}
                  >
                    <option value="">Select Player</option>
                    {getAvailablePlayers(selection.pick).map((prospect) => (
                      <option key={prospect.player} value={prospect.player}>
                        {prospect.player} - {prospect.position} - {prospect.school}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{selection.position}</td>
                <td>
                  <label className="trade-toggle">
                    <input
                      type="checkbox"
                      checked={selection.trade}
                      onChange={() => handleTradeToggle(selection.pick)}
                      disabled={isLocked}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </td>
                <td>
                  {(!selection.confirmed && !isLocked) ? (
                    <button
                      className="confirm-button"
                      onClick={() => handleConfirmSelection(selection.pick)}
                      disabled={isLocked}
                    >
                      Confirm
                    </button>
                  ) : (
                    <span className="status-badge">Confirmed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserSelections; 