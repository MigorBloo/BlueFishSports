import React, { useState, useEffect, useCallback } from 'react';
import UserSelections from '../../components/UserSelections/UserSelections';
import EventInfo from '../../components/EventInfo/EventInfo';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import { draftConfig } from '../../config/draftConfig';
import { useAuth } from '../../../../contexts/AuthContext';
import nflDraftService from '../../services/nflDraftService';
import { UserSelection } from '../../types';
import './UserSelectionsPage.css';

const UserSelectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [lockTime, setLockTime] = useState<Date | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [timeTillLock, setTimeTillLock] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');

  const lockAllSelections = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get all user selections
      const selections = await nflDraftService.getUserSelections(user.id);
      
      // Update each selection to be locked
      await Promise.all(selections.map((selection: UserSelection) => 
        nflDraftService.updateUserSelection({
          ...selection,
          is_locked: true
        })
      ));
      
      console.log('All selections have been locked');
    } catch (error) {
      console.error('Error locking selections:', error);
    }
  }, [user]);

  const updateTimes = useCallback(() => {
    const now = new Date();
    const lockDate = draftConfig.getLockTime();
    
    console.log('Current time:', now.toISOString());
    console.log('Lock time:', lockDate.toISOString());
    
    // Convert both times to ET using the proper timezone string
    const nowInET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const lockDateInET = new Date(lockDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    console.log('Current time in ET:', nowInET.toISOString());
    console.log('Lock time in ET:', lockDateInET.toISOString());
    
    setLockTime(lockDate);
    setStartTime(draftConfig.formatTime(lockDate));
    
    // Check if we've just passed the lock time
    const wasUnlocked = !isLocked;
    const isCurrentlyLocked = nowInET.getTime() >= lockDateInET.getTime();
    
    console.log('Previous lock state:', isLocked);
    console.log('New lock state:', isCurrentlyLocked);
    console.log('Time difference (ms):', lockDateInET.getTime() - nowInET.getTime());
    
    if (wasUnlocked && isCurrentlyLocked) {
      console.log('Locking all selections');
      // If we just passed the lock time, lock all selections
      lockAllSelections();
    }
    
    setIsLocked(isCurrentlyLocked);
    
    const diff = lockDateInET.getTime() - nowInET.getTime();
    if (diff > 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeTillLock(`${hours}h ${minutes}m`);
    } else {
      setTimeTillLock('Locked');
    }
  }, [isLocked, lockAllSelections]);

  useEffect(() => {
    // Initial update
    updateTimes();

    // Update every 30 seconds
    const interval = setInterval(updateTimes, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [updateTimes]);

  return (
    <div className="user-selections-page">
      <NavigationBar />
      <div className="page-container">
        <div className="content-container">
          <EventInfo lockTime={timeTillLock} isLocked={isLocked} startTime={startTime} />
          <UserSelections lockTime={lockTime} isLocked={isLocked} />
        </div>
      </div>
    </div>
  );
};

export default UserSelectionsPage; 