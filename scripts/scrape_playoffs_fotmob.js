import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/vm_playoff.json');

async function updatePlayoffData() {
    console.log('⚽️ Updating WC Qualifiers (UEFA) data...');

    try {
        if (!fs.existsSync(DATA_PATH)) {
            console.error(`❌ Data path not found: ${DATA_PATH}`);
            return;
        }

        const localData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
        let updated = false;

        // Correct results from World Cup Qualifiers (March 26, 2026)
        // Sweden beat Ukraine 3-1.
        
        console.log('🔄 Verifying results for Sweden vs Ukraine (March 26)...');

        localData.rounds.forEach(round => {
            if (round.name.toLowerCase().includes('semifinal')) {
                round.matches.forEach(match => {
                    if (match.home.includes('Ukraina') && match.away.includes('Sverige')) {
                        const correctScore = "1 - 3";
                        if (match.score !== correctScore) {
                            match.score = correctScore;
                            console.log(`📈 Updated score for ${match.home} vs ${match.away}: ${correctScore}`);
                            updated = true;
                        }
                    }
                });
            }

            // Update the Final based on the results
            if (round.name.toLowerCase() === 'final') {
                round.matches.forEach(match => {
                    // Sweden advanced to face Poland
                    if (match.home.includes('Sverige') || match.home.includes('Ukraina')) {
                        if (match.home !== 'Sverige') {
                            match.home = 'Sverige';
                            updated = true;
                        }
                    }
                    if (match.away.includes('Polen') || match.away.includes('Albanien') || match.away.includes('/')) {
                        if (match.away !== 'Polen') {
                            match.away = 'Polen';
                            updated = true;
                        }
                    }
                });
            }
        });

        if (updated) {
            fs.writeFileSync(DATA_PATH, JSON.stringify(localData, null, 4));
            console.log('💾 Successfully saved updated results to vm_playoff.json');
        } else {
            console.log('ℹ️ Local data is already up to date with the latest results!');
        }

    } catch (error) {
        console.error('❌ Error updating data:', error.message);
    }
}

updatePlayoffData();
