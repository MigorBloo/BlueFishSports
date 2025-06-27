import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tennis',
    password: 'postgres',
    port: 5432,
});

async function updateResults() {
    try {
        // Read the JSON file
        const jsonPath = path.join(__dirname, '../../data/WeeklyResultTennis.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        // Get tournament name and date from the first result
        const tournamentName = jsonData[0].Tournament;
        const tournamentDate = jsonData[0].Date;

        // Import the results
        await pool.query('SELECT import_weekly_results($1, $2)', [tournamentName, tournamentDate]);

        // Update the results table
        await pool.query('SELECT update_tournament_results($1)', [tournamentName]);

        console.log(`Successfully updated results for ${tournamentName}`);
    } catch (error) {
        console.error('Error updating results:', error);
    } finally {
        await pool.end();
    }
}

updateResults(); 