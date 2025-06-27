import React from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import './Scoring.css';

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
            <h2 className="section-title">Summary</h2>
            <ul className="section-content">
              <p>Each participant will select three players per tournament (one from each player category-see categories below). Each participant will earn the ranking points their selected players collect in a given tournament. The catch is that once a player has been selected for a given tournament, he can't be used again. The participant that has collected the most points at the end of the season wins the game.</p>
            </ul>

            <h2 className="section-title">Player Categories</h2>
            <ul className="bullet-list">
              <li>Gold Category: Top 20 </li>
              <li>Silver Category: 21-40 </li>
              <li>Bronze Category: 41 and below</li>
            </ul>

            <h2 className="section-title">Scoring</h2>
            <ul className="bullet-list">
              <li>As described above, the 3 players selected each week will earn ranking points. The 3 categories will be treated equally (no player from a given category will be entitled to extra points). The points scored will be updated each week and the participant with the most points scored at the end of the season wins.</li>
              <li> In the unlikely case that two or more players are tied at the end of the season, the first tiebraker will be wins, followed by number of finals, semi finals,etc. </li>
            </ul>

            <h2 className="section-title">Tournaments</h2>
            <ul className="section-content">
              <li>There will be a total of 8 tournaments (see full tournament schedule including breakdown of ranking points for each tournament in the tournament page). </li>
            </ul>

            <h2 className="section-title">Player Rankings</h2>
            <ul className="section-content">
              <li>The player pool for each category will be set before the beginning of the season (as per the Official ATP Rankings) and will not be reset during the season in order to keep the game fair and the player pool consistent.</li>
            </ul>

            <p className="summary-text">
             In case you have any further questions or suggestions on how the game including the scoring can be improved, please contact me on X, Discord or via Email. No changes will be made during this season but could be made for the 2026 season.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scoring; 