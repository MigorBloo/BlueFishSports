import React from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import './ScoringPage.css';

const Scoring: React.FC = () => {
  return (
    <div className="scoring-page">
      <NavigationBar />
      <div className="page-container">
        <div className="content-container">
          <h1 className="page-header">
            Scoring System
          </h1>

          <div className="scoring-content">
            <h2 className="section-title">Team Selection (100 points)</h2>
            <ul className="section-content">
              <li>100 points if you correctly match a team's draft position. The teams are prepopulated based on their current draft positions but these can be changed by clicking on the Trade toggle button.</li>
            </ul>

            <h2 className="section-title">Player Selection (200 points)</h2>
            <ul className="bullet-list">
              <li>100 points for predicting the draft position at which a player will go (even if the team is incorrect)</li>
              <li>100 points for predicting the team that will select the player (even if the draft position is incorrect)</li>
            </ul>

            <h2 className="section-title">Position Selection (100 points) - these will be autopopulated once a player is selected</h2>
            <ul className="bullet-list">
              <li>50 points for correctly matching the player's position with the draft position(even if the player and the team are incorrect)</li>
              <li>50 points for correctly matching the player's position with the team (even if the player and the draft position are incorrect)</li>
            </ul>

            <h2 className="section-title">Trade Status Prediction (100 points)</h2>
            <ul className="section-content">
            <li>100 points if you correctly predict whether a trade will happen or not (even if the team selected as the trade partner is incorrect).</li>
            </ul>

            <h2 className="section-title">Perfect Match Bonus (100 points)</h2>
            <ul className="section-content">
            <li> Score an additional 100 points if you correctly predict all elements of a pick (team, player, position, and trade status).</li>
            </ul>

            <p className="summary-text">
              The maximum score per pick is 600 points (100 + 200 + 100 + 100 + 100) and the minimum score is 0 points. Your total score will be the sum of points earned across all 32 picks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scoring; 