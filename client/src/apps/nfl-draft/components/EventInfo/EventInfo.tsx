import React from 'react';
import './EventInfo.css';
import { draftConfig } from '../../config/draftConfig';

interface EventInfoProps {
  lockTime: string;  // Changed from Date to string since we'll receive the formatted time
  isLocked: boolean;
  startTime: string;
}

const EventInfo: React.FC<EventInfoProps> = ({ lockTime, isLocked, startTime }) => {
  console.log('EventInfo received lockTime:', lockTime, 'isLocked:', isLocked, 'startTime:', startTime);
  
  return (
    <div className="event-info-container" data-testid="event-info-container">
      <h1 className="event-title">NFL Draft 2025</h1>
      
      <div className="event-details">
        <div className="event-detail-item">
          <span className="event-detail-label">Location:</span>
          <span className="event-detail-value">Green Bay, Wisconsin</span>
        </div>
        <div className="event-detail-item">
          <span className="event-detail-label">Date:</span>
          <span className="event-detail-value">{draftConfig.draftDate.split('-').reverse().join('/')}</span>
        </div>
        <div className="event-detail-item">
          <span className="event-detail-label">Start Time:</span>
          <span className="event-detail-value">{startTime}</span>
        </div>
        <div className="event-detail-item">
          <span className="event-detail-label">Time till Lock:</span>
          <span className="event-detail-value">
            {isLocked ? 'Locked' : lockTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventInfo; 