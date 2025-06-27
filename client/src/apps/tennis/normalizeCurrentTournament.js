const fs = require('fs');
const path = require('path');

// Path to your currentTournament.json
const inputPath = path.join(__dirname, 'Data/currentTournament.json');
const outputPath = inputPath; // Overwrite the same file

function normalizePlayerName(name) {
  if (!name) return '';
  // Remove all invisible unicode spaces and trim
  return name.replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, '').trim();
}

function normalizePlayers(players) {
  return players.map(player => {
    // Find the key that starts with "Name"
    const nameKey = Object.keys(player).find(k => k.trim().startsWith('Name'));
    const normalizedName = normalizePlayerName(player[nameKey]);
    // Copy all properties, but set "Name" to the normalized value
    return {
      ...player,
      Name: normalizedName
    };
  });
}

function main() {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const normalized = normalizePlayers(data);
  fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2), 'utf8');
  console.log('Normalization complete!');
}

main();