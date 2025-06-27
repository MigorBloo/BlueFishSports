import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import './Welcome.css';

const Welcome: React.FC = () => {
  return (
    <div className="welcome-page">
      <NavigationBar />
      <div className="page-container">
        <div className="content-container">
          <div className="page-header welcome-header">
            Tennis 3&Done Trophy
          </div>
          <p className="welcome-text">
            Welcome to the inaugural Blue Fish 3&Done Trophy. Each participant will select three players per tournament (one from each player category). The three player categories based on the current ATP points rankings are:
            <ul>
              <li> Top 25 (Gold Category) </li>
              <li> 26-50 (Silver Category) </li>
              <li> 51-100 (Bronze Category) </li>
            </ul>

            Each player will earn the ranking points equivalent to his real life ranking points. The participant who earns the most points accumulated through all the tournaments at the end of the season wins the trophy.
            The catch is that a player can only be used once (if a player has been selected for a specific tournament he can not be used in any other tournament again). For an overview of the scoring/rules please visit the{' '}
            <RouterLink to="/tennis/scoring" className="scoring-link">
              Scoring page
            </RouterLink>.
          </p>
          <img
            src="/assets/images/games/tennis/Tennis.webp"
            alt="Tennis"
            className="welcome-image"
          />
          <p className="italic-text">
            Remember: The Ranking points earned per tournament differ so timing your player selections right is just as important as predicting whether a player will do well or not. 
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 