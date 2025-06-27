import { UserSelection, ActualResult } from '../types';

export const calculateAllScores = (
  userSelections: UserSelection[],
  actualResults: ActualResult[]
): Map<number, number> => {
  const scores = new Map<number, number>();

  // Create a map of team to actual results for easier lookup
  const teamToResults = new Map<string, ActualResult[]>();
  actualResults.forEach(result => {
    if (!teamToResults.has(result.team.trim())) {
      teamToResults.set(result.team.trim(), []);
    }
    teamToResults.get(result.team.trim())?.push(result);
  });

  userSelections.forEach(selection => {
    const actualResult = actualResults.find(r => r.pick === selection.pick);
    if (!actualResult) return;

    let points = 0;

    // Team points (100)
    if (selection.team.trim() === actualResult.team.trim()) {
      points += 100;
    }

    // Player points (200)
    let playerPoints = 0;
    // Check if player matches pick
    if (selection.player.trim() === actualResult.player.trim()) {
      playerPoints += 100;
    }
    // Check if player matches any of the team's picks
    const teamResults = teamToResults.get(selection.team.trim()) || [];
    if (teamResults.some(result => selection.player.trim() === result.player.trim())) {
      playerPoints += 100;
    }
    points += playerPoints;

    // Position points (100)
    let positionPoints = 0;
    // Check if position matches pick
    if (selection.position.trim() === actualResult.position.trim()) {
      positionPoints += 50;
    }
    // Check if position matches any of the team's picks
    if (teamResults.some(result => selection.position.trim() === result.position.trim())) {
      positionPoints += 50;
    }
    points += positionPoints;

    // Trade points (100)
    if (selection.trade === actualResult.trade) {
      points += 100;
    }

    // Bonus points (100) - if all selections are correct
    if (selection.team.trim() === actualResult.team.trim() &&
        selection.player.trim() === actualResult.player.trim() &&
        selection.position.trim() === actualResult.position.trim() &&
        selection.trade === actualResult.trade) {
      points += 100;
    }

    scores.set(selection.pick, points);
  });

  return scores;
}; 