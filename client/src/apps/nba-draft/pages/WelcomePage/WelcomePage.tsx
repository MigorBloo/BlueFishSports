import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import './WelcomePage.css';

const Welcome: React.FC = () => {
  return (
    <div className="welcome-page">
      <NavigationBar />
      <div className="page-container">
        <div className="content-container">
          <div className="page-header">
            NBA Mock Draft Game
          </div>
          <p className="welcome-text">
            Welcome to the BlueFish NBA MockDraft Game. Each participant will perform a Mock Draft of Round 1(30 Picks in total). Four selections will be scored for each pick; the correct Team, correct Player, correct Position (which will automatically be populated based on the player selected) and finally if you correctly predicted whether a Trade has happened or not. The player who has the highest accumulated score over all 30 picks/rounds wins. For a full breakdown of the scoring system please visit the{' '}
            <RouterLink to="/nba-draft/scoring" className="scoring-link">
              Scoring page
            </RouterLink>.
          </p>
          <img
            src="/assets/images/games/nba-draft/NBADraft.webp"
            alt="NBA Draft"
            className="welcome-image"
          />
          <p className="italic-text">
            Remember: The key to winning is not for you to make the most rational decision for a team but rather anticipate what a team will do.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 