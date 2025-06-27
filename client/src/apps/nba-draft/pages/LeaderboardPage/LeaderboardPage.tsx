import React from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import Leaderboard from '../../components/Leaderboard/Leaderboard';
import { TotalPointsProvider } from '../../contexts/TotalPointsContext';
import './LeaderboardPage.css';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="leaderboard-page">
      <NavigationBar />
      <div className="page-container">
        <h1 className="page-header">
          Leaderboard
        </h1>
        <TotalPointsProvider>
          <Leaderboard />
        </TotalPointsProvider>
      </div>
    </div>
  );
};

export default LeaderboardPage; 