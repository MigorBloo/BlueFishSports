import React from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import './PlayerPool.css';

type PlayerRow = {
  rank: number;
  player: string;
  country: string;
  points: string;
};

const goldCategory: PlayerRow[] = [
  { rank: 1, player: 'Jannik Sinner', country: 'ITA', points: '9,730' },
  { rank: 2, player: 'Alexander Zverev', country: 'GER', points: '8,085' },
  { rank: 3, player: 'Carlos Alcaraz', country: 'ESP', points: '7,850' },
  { rank: 4, player: 'Taylor Fritz', country: 'USA', points: '4,815' },
  { rank: 5, player: 'Jack Draper', country: 'GBR', points: '4,440' },
  { rank: 6, player: 'Novak Djokovic', country: 'SER', points: '4,130' },
  { rank: 7, player: 'Casper Ruud', country: 'NOR', points: '3,715' },
  { rank: 8, player: 'Alex de Minaur', country: 'AUS', points: '3,635' },
  { rank: 9, player: 'Lorenzo Musetti', country: 'ITA', points: '3,550' },
  { rank: 10, player: 'Holger Rune', country: 'DEN', points: '3,440' },
  { rank: 11, player: 'Daniil Medvedev', country: '---', points: '3,290' },
  { rank: 12, player: 'Tommy Paul', country: 'USA', points: '3,210' },
  { rank: 13, player: 'Ben Shelton', country: 'USA', points: '3,020' },
  { rank: 14, player: 'Arthur Fils', country: 'FRA', points: '2,920' },
  { rank: 15, player: 'Grigor Dimitrov', country: 'BUL', points: '2,685' },
  { rank: 16, player: 'Frances Tiafoe', country: 'USA', points: '2,640' },
  { rank: 17, player: 'Andrey Rublev', country: '---', points: '2,580' },
  { rank: 18, player: 'Francisco Cerundolo', country: 'ARG', points: '2,425' },
  { rank: 19, player: 'Stefanos Tsitsipas', country: 'GRE', points: '2,420' },
  { rank: 20, player: 'Tomas Machac', country: 'CZE', points: '2,215' },
  { rank: 21, player: 'Jakub Mensik', country: 'CZE', points: '2,182' },
  { rank: 22, player: 'Ugo Humbert', country: 'FRA', points: '2,145' },
  { rank: 23, player: 'Sebastian Korda', country: 'USA', points: '2,020' },
  { rank: 24, player: 'Karen Khachanov', country: '---', points: '1,910' },
  { rank: 25, player: 'Alexei Popyrin', country: 'AUS', points: '1,860' },
];

const silverCategory: PlayerRow[] = [
  { rank: 26, player: 'Alejandro Davidovich Fokina', country: 'ESP', points: '1,745' },
  { rank: 27, player: 'Felix Auger-Aliassime', country: 'CAN', points: '1,735' },
  { rank: 28, player: 'Denis Shapovalov', country: 'CAN', points: '1,726' },
  { rank: 29, player: 'Brandon Nakashima', country: 'USA', points: '1,675' },
  { rank: 30, player: 'Matteo Berrettini', country: 'ITA', points: '1,670' },
  { rank: 31, player: 'Hubert Hurkacz', country: 'POL', points: '1,665' },
  { rank: 32, player: 'Alex Michelsen', country: 'USA', points: '1,570' },
  { rank: 33, player: 'Sebastian Baez', country: 'ARG', points: '1,540' },
  { rank: 34, player: 'Flavio Cobolli', country: 'ITA', points: '1,520' },
  { rank: 35, player: 'Tallon Griekspoor', country: 'NED', points: '1,505' },
  { rank: 36, player: 'Giovanni Mpetshi Perricard', country: 'FRA', points: '1,464' },
  { rank: 37, player: 'Matteo Arnaldi', country: 'ITA', points: '1,410' },
  { rank: 38, player: 'Jiri Lehecka', country: 'CZE', points: '1,405' },
  { rank: 39, player: 'Alexandre Muller', country: 'FRA', points: '1,403' },
  { rank: 40, player: 'Nuno Borges', country: 'POR', points: '1,360' },
  { rank: 41, player: 'Jordan Thompson', country: 'AUS', points: '1,355' },
  { rank: 42, player: 'Alejandro Tabilo', country: 'CHL', points: '1,340' },
  { rank: 43, player: 'Gael Monfils', country: 'FRA', points: '1,275' },
  { rank: 44, player: 'Lorenzo Sonego', country: 'ITA', points: '1,245' },
  { rank: 45, player: 'Marcos Giron', country: 'USA', points: '1,245' },
  { rank: 46, player: 'Luciano Darderi', country: 'ITA', points: '1,204' },
  { rank: 47, player: 'Miomir Kecmanovic', country: 'SER', points: '1,186' },
  { rank: 48, player: 'David Goffin', country: 'BEL', points: '1,131' },
  { rank: 49, player: 'Pedro Martinez', country: 'ESP', points: '115' },
  { rank: 50, player: 'Zizou Bergs', country: 'BEL', points: '1,081' },
];

const bronzeCategory: PlayerRow[] = [
  { rank: 51, player: 'Tomas Martin Etcheverry', country: 'ARG', points: '1,015' },
  { rank: 52, player: 'Quentin Halys', country: 'FRA', points: '1,015' },
  { rank: 53, player: 'Nicolas Jarry', country: 'CHL', points: '1,010' },
  { rank: 54, player: 'Gabriel Diallo', country: 'CAN', points: '995' },
  { rank: 55, player: 'Zhizhen Zhang', country: 'CHN', points: '985' },
  { rank: 56, player: 'Roberto Bautista Agut', country: 'ESP', points: '969' },
  { rank: 57, player: 'Jacob Fearnley', country: 'GBR', points: '953' },
  { rank: 58, player: 'Benjamin Bonzi', country: 'FRA', points: '951' },
  { rank: 59, player: 'Roberto Carballes Baena', country: 'ESP', points: '946' },
  { rank: 60, player: 'Camilo Ugo Carabelli', country: 'ARG', points: '944' },
  { rank: 61, player: 'Fabian Marozsan', country: 'HUN', points: '935' },
  { rank: 62, player: 'Kei Nishikori', country: 'JPY', points: '928' },
  { rank: 63, player: 'Francisco Comesana', country: 'ARG', points: '906' },
  { rank: 64, player: 'Laslo Djere', country: 'SER', points: '902' },
  { rank: 65, player: 'Joao Fonseca', country: 'BRA', points: '897' },
  { rank: 66, player: 'Jaume Munar', country: 'ESP', points: '892' },
  { rank: 67, player: 'Juncheng Shang', country: 'CHN', points: '892' },
  { rank: 68, player: 'Mattia Bellucci', country: 'ITA', points: '891' },
  { rank: 69, player: 'Damir Dzumhur', country: 'BOS', points: '881' },
  { rank: 70, player: 'Learner Tien', country: 'USA', points: '878' },
  { rank: 71, player: 'Daniel Altmaier', country: 'GER', points: '872' },
  { rank: 72, player: 'Hamad Medjedovic', country: 'SER', points: '871' },
  { rank: 73, player: 'Bu Yunchaokete', country: 'CHN', points: '857' },
  { rank: 74, player: 'Yoshihito Nishioka', country: 'JPN', points: '833' },
  { rank: 75, player: 'Arthur Rinderknech', country: 'FRA', points: '826' },
  { rank: 76, player: 'Alexander Bublik', country: 'KAZ', points: '820' },
  { rank: 77, player: 'Roman Safiullin', country: '', points: '816' },
  { rank: 78, player: 'Hugo Gaston', country: 'FRA', points: '793' },
  { rank: 79, player: 'Aleksandar Vukic', country: 'AUS', points: '792' },
  { rank: 80, player: 'Aleksandar Kovacevic', country: 'USA', points: '785' },
  { rank: 81, player: 'Christopher O\'Connell', country: 'AUS', points: '765' },
  { rank: 82, player: 'Rinky Hijikata', country: 'AUS', points: '761' },
  { rank: 83, player: 'Corentin Moutet', country: 'FRA', points: '752' },
  { rank: 84, player: 'Borna Coric', country: 'CRO', points: '744' },
  { rank: 85, player: 'Botic van de Zandschulp', country: 'NED', points: '733' },
  { rank: 86, player: 'Raphael Collignon', country: 'BEL', points: '726' },
  { rank: 87, player: 'Jan-Lennard Struff', country: 'GER', points: '720' },
  { rank: 88, player: 'Adam Walton', country: 'AUS', points: '718' },
  { rank: 89, player: 'Kamil Majchrzak', country: 'POL', points: '689' },
  { rank: 90, player: 'James Duckworth', country: 'AUS', points: '673' },
  { rank: 91, player: 'Cameron Norrie', country: 'GBR', points: '667' },
  { rank: 92, player: 'Vit Kopriva', country: 'CZE', points: '655' },
  { rank: 93, player: 'Jesper de Jong', country: 'NED', points: '640' },
  { rank: 94, player: 'Reilly Opelka', country: 'USA', points: '634' },
  { rank: 95, player: 'Luca Nardi', country: 'ITA', points: '632' },
  { rank: 96, player: 'Mackenzie McDonald', country: 'USA', points: '627' },
  { rank: 97, player: 'Alexander Shevchenko', country: 'UKR', points: '605' },
  { rank: 98, player: 'Pablo Carreno Busta', country: 'ESP', points: '601' },
  { rank: 99, player: 'Mariano Navone', country: 'ITA', points: '600' },
  { rank: 100, player: 'Nishesh Basavareddy', country: 'USA', points: '594' },
];

const renderTable = (data: PlayerRow[]) => (
  <div className="playerpool-table-container">
    <table className="playerpool-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Country</th>
          <th>Official Points</th>
        </tr>
      </thead>
      <tbody className="playerpool-table-body-scroll">
        {data.map((row: PlayerRow) => (
          <tr key={row.rank}>
            <td>{row.rank}</td>
            <td>{row.player}</td>
            <td>{row.country}</td>
            <td>{row.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PlayerPool = () => (
  <div className="playerpool-page">
    <NavigationBar />
    <h1 className="playerpool-header">Player Pool</h1>
    <div className="playerpool-flex-row">
      <div className="playerpool-table-section gold-category">
        <h2 className="playerpool-category-header">Gold Category (1-25)</h2>
        {renderTable(goldCategory)}
      </div>
      <div className="playerpool-table-section silver-category">
        <h2 className="playerpool-category-header">Silver Category (26-50)</h2>
        {renderTable(silverCategory)}
      </div>
      <div className="playerpool-table-section bronze-category">
        <h2 className="playerpool-category-header">Bronze Category (51-100)</h2>
        {renderTable(bronzeCategory)}
      </div>
    </div>
  </div>
);

export default PlayerPool;
