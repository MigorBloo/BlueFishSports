const ExcelJS = require('exceljs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.development') });

// Use environment variables for database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 5000,
    query_timeout: 10000
});

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../../../');

// Test database connection
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to the database');
        client.release();
        return true;
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
        return false;
    }
}

async function importProspects() {
    console.log('Starting prospects import...');
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(projectRoot, 'client/src/apps/nfl-draft/Data/CBSTop200Prospects.xlsx');
    console.log('Reading prospects from:', filePath);
    
    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new Error('No worksheet found in prospects file');
        }
        console.log('Found worksheet:', worksheet.name);
        
        const prospects = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 2) { // Skip first two rows (headers)
                const player = row.getCell(3).value?.toString().trim(); // Name is in column C
                const position = row.getCell(4).value?.toString().trim(); // Position is in column D
                const position_rank = parseInt(row.getCell(5).value) || null; // Position rank is in column E
                const school = row.getCell(6).value?.toString().trim(); // School is in column F
                const class_year = row.getCell(7).value?.toString().trim(); // Class is in column G
                const rank = rowNumber - 2; // Calculate rank based on row position
                
                if (player && position && school) {
                    prospects.push({
                        player,
                        position,
                        position_rank,
                        school,
                        class: class_year,
                        rank
                    });
                }
            }
        });

        console.log('Found', prospects.length, 'prospects to import');

        for (const prospect of prospects) {
            try {
                await pool.query(
                    'INSERT INTO prospects (player, position, position_rank, school, class, rank) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (player) DO UPDATE SET position = $2, position_rank = $3, school = $4, class = $5, rank = $6',
                    [prospect.player, prospect.position, prospect.position_rank, prospect.school, prospect.class, prospect.rank]
                );
                console.log('Imported prospect:', prospect.player, '(Rank:', prospect.rank, ')');
            } catch (err) {
                console.error('Error importing prospect:', prospect.player, err.message);
            }
        }
        console.log('Prospects import completed');
    } catch (err) {
        console.error('Error in importProspects:', err.message);
        throw err;
    }
}

async function importTeams() {
    console.log('Starting team import...');
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(projectRoot, 'client/src/apps/nfl-draft/Data/UserSelection.xlsx');
    console.log('Reading teams from:', filePath);
    
    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new Error('No worksheet found in teams file');
        }
        console.log('Found worksheet:', worksheet.name);
        
        const teams = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber >= 5) { // Start from row 5 where team names begin
                const team = row.getCell(4).value?.toString().trim();
                const pick = rowNumber - 4; // Calculate pick number based on row position
                
                if (team && team !== 'Logo_URLs') {
                    teams.push({
                        name: team,
                        original_pick_order: pick,
                        logo_url: null // We'll add logo URLs later
                    });
                }
            }
        });

        console.log('Found', teams.length, 'teams to import');

        for (const team of teams) {
            try {
                await pool.query(
                    'INSERT INTO teams (name, original_pick_order, logo_url) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET original_pick_order = EXCLUDED.original_pick_order, logo_url = EXCLUDED.logo_url',
                    [team.name, team.original_pick_order, team.logo_url]
                );
                console.log('Imported team:', team.name, 'with pick number:', team.original_pick_order);
            } catch (err) {
                console.error('Error importing team:', team.name, err.message);
            }
        }
        console.log('Teams import completed');
    } catch (err) {
        console.error('Error in importTeams:', err.message);
        throw err;
    }
}

async function importExpertPicks() {
    console.log('Starting expert picks import...');
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(projectRoot, 'client/src/apps/nfl-draft/Data/ExpertPicks.xlsx');
    console.log('Reading expert picks from:', filePath);
    
    try {
        await workbook.xlsx.readFile(filePath);
        console.log('Number of worksheets:', workbook.worksheets.length);
        
        for (const worksheet of workbook.worksheets) {
            const expertName = worksheet.name;
            // Get the column headers
            const headers = [];
            worksheet.getRow(1).eachCell((cell, colNumber) => {
                headers[colNumber] = cell.value;
            });

            for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
                const row = worksheet.getRow(rowNumber);
                const pick = {};
                row.eachCell((cell, colNumber) => {
                    pick[headers[colNumber]] = cell.value;
                });
                pick.expert_name = expertName;

                await pool.query(
                    `INSERT INTO expert_picks (
                        expert_name, player_name, position, school, team, round, pick_number
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        pick.expert_name,
                        pick.player_name,
                        pick.position,
                        pick.school,
                        pick.team,
                        pick.round,
                        pick.pick_number
                    ]
                );
            }
        }
        console.log('Expert picks import completed');
    } catch (err) {
        console.error('Error in importExpertPicks:', err.message);
        throw err;
    }
}

async function main() {
    try {
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('Failed to connect to database. Aborting import.');
            return;
        }

        const arg = process.argv[2];
        if (arg === 'prospects') {
            await importProspects();
        } else if (arg === 'teams') {
            await importTeams();
        } else if (arg === 'experts' || arg === 'expertpicks') {
            await importExpertPicks();
        } else {
            // Run all imports in sequence
            await importProspects();
            await importTeams();
            await importExpertPicks();
        }
        console.log('Import(s) completed successfully');
    } catch (err) {
        console.error('Error in main:', err.message);
    } finally {
        await pool.end();
    }
}

// Run the import
main(); 