import { UserSelection, ActualResult } from '../types';

export const calculateAllScores = (
  userSelections: UserSelection[],
  actualResults: ActualResult[]
): Map<number, number> => {
  const scores = new Map<number, number>();

  // Create a map of team to actual results for easier lookup
  const teamToResults = new Map<string, ActualResult[]>();
  actualResults.forEach(result => {
    const teamName = result.team?.trim() || '';
    if (!teamToResults.has(teamName)) {
      teamToResults.set(teamName, []);
    }
    teamToResults.get(teamName)?.push(result);
  });

  userSelections.forEach(selection => {
    const actualResult = actualResults.find(r => r.pick === selection.pick);
    if (!actualResult) return;

    let points = 0;

    // Team points (100)
    const selectionTeam = selection.team?.trim() || '';
    const actualTeam = actualResult.team?.trim() || '';
    if (selectionTeam === actualTeam) {
      points += 100;
    }

    // Player points (200)
    let playerPoints = 0;
    const selectionPlayer = selection.player?.trim() || '';
    const actualPlayer = actualResult.player?.trim() || '';
    
    // Check if player matches pick
    if (selectionPlayer === actualPlayer) {
      playerPoints += 100;
    }
    // Check if player matches any of the team's picks
    const teamResults = teamToResults.get(selectionTeam) || [];
    if (teamResults.some(result => selectionPlayer === (result.player?.trim() || ''))) {
      playerPoints += 100;
    }
    points += playerPoints;

    // Position points (100)
    let positionPoints = 0;
    const selectionPosition = selection.position?.trim() || '';
    const actualPosition = actualResult.position?.trim() || '';
    
    // Check if position matches pick
    if (selectionPosition === actualPosition) {
      positionPoints += 50;
    }
    // Check if position matches any of the team's picks
    if (teamResults.some(result => selectionPosition === (result.position?.trim() || ''))) {
      positionPoints += 50;
    }
    points += positionPoints;

    // Trade points (100)
    if (selection.trade === actualResult.trade) {
      points += 100;
    }

    // Bonus points (100) - if all selections are correct
    if (selectionTeam === actualTeam &&
        selectionPlayer === actualPlayer &&
        selectionPosition === actualPosition &&
        selection.trade === actualResult.trade) {
      points += 100;
    }

    scores.set(selection.pick, points);
  });

  return scores;
}; 