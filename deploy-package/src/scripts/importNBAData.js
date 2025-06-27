const ExcelJS = require('exceljs');
const path = require('path');
const pool = require('../config/NBADatabase');

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

async function importNBAProspects() {
    console.log('Starting NBA prospects import...');
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(projectRoot, 'client/src/apps/nba-draft/Data/CBSTop70Prospects.xlsx');
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
            if (rowNumber > 1) { // Changed from rowNumber > 2 to rowNumber > 1 to include first player
                const player = row.getCell(2).value?.toString().trim(); // Column B = PLAYER
                const position = row.getCell(3).value?.toString().trim(); // Column C = POS
                const position_rank = parseInt(row.getCell(4).value) || null; // Column D = POS RANK
                const school = row.getCell(5).value?.toString().trim(); // Column E = SCHOOL
                const class_year = row.getCell(6).value?.toString().trim(); // Column F = CLASS
                const rank = parseInt(row.getCell(1).value) || (rowNumber - 1); // Adjusted rank calculation
                
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
                    'INSERT INTO nba_prospects (player, position, position_rank, school, class, rank) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (player) DO UPDATE SET position = $2, position_rank = $3, school = $4, class = $5, rank = $6',
                    [prospect.player, prospect.position, prospect.position_rank, prospect.school, prospect.class, prospect.rank]
                );
                console.log('Imported prospect:', prospect.player, '(Rank:', prospect.rank, ')');
            } catch (err) {
                console.error('Error importing prospect:', prospect.player, err.message);
            }
        }
        console.log('NBA Prospects import completed');
    } catch (err) {
        console.error('Error in importNBAProspects:', err.message);
        throw err;
    }
}

async function importNBATeams() {
    console.log('Starting NBA team import...');
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(projectRoot, 'client/src/apps/nba-draft/Data/NBAUserSelection.xlsx');
    console.log('Reading teams from:', filePath);
    
    try {
        // First, clear the table
        await pool.query('TRUNCATE TABLE nba_teams');
        console.log('Cleared nba_teams table');

        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new Error('No worksheet found in teams file');
        }
        console.log('Found worksheet:', worksheet.name);
        
        const teams = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber >= 5 && rowNumber <= 34) { // Read from row 5 to 34
                const team = row.getCell(4).value?.toString().trim(); // Column D = Team
                const pick = rowNumber - 4; // Calculate pick based on row position
                
                if (team && team !== 'Logo_URLs') {
                    teams.push({
                        team,
                        original_pick_order: pick,
                        logo_url: null // We'll add logo URLs later
                    });
                }
            }
        });

        console.log('\nFound', teams.length, 'teams to import');
        console.log('Teams in order:');
        teams.forEach(t => console.log(`Pick ${t.original_pick_order}: ${t.team}`));

        for (const team of teams) {
            try {
                await pool.query(
                    'INSERT INTO nba_teams (team, original_pick_order, logo_url) VALUES ($1, $2, $3)',
                    [team.team, team.original_pick_order, team.logo_url]
                );
                console.log('Imported team:', team.team, 'with pick number:', team.original_pick_order);
            } catch (err) {
                console.error('Error importing team:', team.team, err.message);
            }
        }
        console.log('NBA Teams import completed');
    } catch (err) {
        console.error('Error in importNBATeams:', err.message);
        throw err;
    }
}

async function importNBAExpertPicks() {
    console.log('Starting NBA expert picks import...');
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(projectRoot, 'client/src/apps/nba-draft/Data/NBAExpertPicks.xlsx');
    console.log('Reading expert picks from:', filePath);
    
    try {
        await workbook.xlsx.readFile(filePath);
        console.log('Number of worksheets:', workbook.worksheets.length);
        
        // First, clear the existing expert picks
        await pool.query('TRUNCATE TABLE nba_expert_picks');
        console.log('Cleared nba_expert_picks table');

        for (const worksheet of workbook.worksheets) {
            const expertName = worksheet.name;
            console.log(`\nProcessing expert: ${expertName}`);
            
            const picks = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber >= 3) { // Start from row 3 where data begins
                    const pickCell = row.getCell(1); // Column A = Pick number
                    const team = row.getCell(3).value?.toString().trim(); // Column C = Team
                    const player = row.getCell(4).value?.toString().trim(); // Column D = Player
                    const position = row.getCell(5).value?.toString().trim(); // Column E = Position
                    const trade = row.getCell(6).value || false; // Column F = Trade
                    
                    // Get pick number from either direct value or formula result
                    let pickNumber;
                    if (pickCell.value && typeof pickCell.value === 'object' && 'result' in pickCell.value) {
                        pickNumber = pickCell.value.result;
                    } else {
                        pickNumber = parseInt(pickCell.value);
                    }
                    
                    if (team && player && !isNaN(pickNumber)) {
                        picks.push({
                            expert: expertName,
                            team,
                            player,
                            position,
                            trade,
                            pick: pickNumber
                        });
                    }
                }
            });

            console.log(`Found ${picks.length} picks for ${expertName}`);
            console.log('Picks in order:');
            picks.forEach(p => console.log(`Pick ${p.pick}: ${p.player} (${p.team})`));

            for (const pick of picks) {
                try {
                    await pool.query(
                        'INSERT INTO nba_expert_picks (expert, team, player, position, trade, pick) VALUES ($1, $2, $3, $4, $5, $6)',
                        [pick.expert, pick.team, pick.player, pick.position, pick.trade, pick.pick]
                    );
                    console.log(`Imported pick ${pick.pick} for ${pick.expert}: ${pick.player} (${pick.team})`);
                } catch (err) {
                    console.error('Error importing pick:', pick, err.message);
                }
            }
        }
        console.log('NBA Expert Picks import completed');
    } catch (err) {
        console.error('Error in importNBAExpertPicks:', err.message);
        throw err;
    }
}

async function importNBAActualResults() {
    console.log('Starting NBA actual results import...');
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(projectRoot, 'client/src/apps/nba-draft/Data/NBAActualResult.xlsx');
    console.log('Reading actual results from:', filePath);
    
    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new Error('No worksheet found in actual results file');
        }
        console.log('Found worksheet:', worksheet.name);
        console.log('Total rows in worksheet:', worksheet.rowCount);
        
        // First, clear the existing actual results
        await pool.query('TRUNCATE TABLE nba_actual_results');
        console.log('Cleared nba_actual_results table');
        
        const results = [];

        worksheet.eachRow((row, rowNumber) => {
            console.log(`Processing row ${rowNumber}:`);
            if (rowNumber > 1) { // Skip header row
                const pickCell = row.getCell(1);
                const teamCell = row.getCell(2);
                const playerCell = row.getCell(3);
                const positionCell = row.getCell(4);
                const tradeCell = row.getCell(5);
                
                const pick = parseInt(pickCell.value);
                const team = teamCell.value?.toString().trim();
                const player = playerCell.value?.toString().trim();
                const position = positionCell.value?.toString().trim();
                const trade = tradeCell.value?.toString().toLowerCase() === 'yes';
                
                console.log(`  Row ${rowNumber} data: Pick=${pick}, Team="${team}", Player="${player}", Position="${position}", Trade=${trade}`);
                
                if (pick && team) {
                    results.push({
                        pick,
                        team,
                        player: player || null,
                        position: position || null,
                        trade: trade || false,
                        points_scored: 0 // Default points to 0
                    });
                    console.log(`  ✓ Added to results: Pick ${pick}: ${player || 'TBD'} (${team})`);
                } else {
                    console.log(`  ✗ Skipped row ${rowNumber}: pick=${pick}, team="${team}"`);
                }
            } else {
                console.log(`  Skipping header row ${rowNumber}`);
            }
        });

        console.log('Found', results.length, 'results to import');
        console.log('Results in order:');
        results.forEach(r => console.log(`Pick ${r.pick}: ${r.player || 'TBD'} (${r.team})`));

        for (const result of results) {
            try {
                await pool.query(
                    `INSERT INTO nba_actual_results (pick, team, player, position, trade, points_scored)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        result.pick,
                        result.team,
                        result.player,
                        result.position,
                        result.trade,
                        result.points_scored
                    ]
                );
                console.log(`Imported pick ${result.pick}: ${result.player || 'TBD'} (${result.team})`);
            } catch (err) {
                console.error('Error importing result:', result, err.message);
            }
        }
        console.log('NBA Actual Results import completed');
    } catch (err) {
        console.error('Error in importNBAActualResults:', err.message);
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
            await importNBAProspects();
        } else if (arg === 'teams') {
            await importNBATeams();
        } else if (arg === 'experts' || arg === 'expertpicks') {
            await importNBAExpertPicks();
        } else if (arg === 'actual' || arg === 'actualresults') {
            await importNBAActualResults();
        } else {
            // Run all imports in sequence
            await importNBAProspects();
            await importNBATeams();
            await importNBAExpertPicks();
            await importNBAActualResults();
        }
        console.log('NBA Import(s) completed successfully');
    } catch (err) {
        console.error('Error in main:', err.message);
    } finally {
        await pool.end();
    }
}

// Run the import
main();
