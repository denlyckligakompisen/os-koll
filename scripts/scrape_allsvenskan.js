
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const LEAGUE_ID = 67; // Allsvenskan
const TABLE_PATH = path.join(process.cwd(), 'public/data/allsvenskan_standings.json');
const MATCHES_PATH = path.join(process.cwd(), 'public/data/allsvenskan_matches.json');

const CACHE_DURATION = 60 * 60 * 1000; // 1 timme i millisekunder

async function scrapeAllsvenskan() {
    const force = process.argv.includes('--force');

    // Kolla om vi behöver uppdatera
    if (!force && fs.existsSync(TABLE_PATH)) {
        const stats = fs.statSync(TABLE_PATH);
        const now = new Date().getTime();
        const lastUpdate = new Date(stats.mtime).getTime();

        if (now - lastUpdate < CACHE_DURATION) {
            console.log('Datan är mindre än en timme gammal. Hoppar över API-anrop.');
            console.log('Använd --force för att tvinga fram en uppdatering.');
            return;
        }
    }

    console.log('Hämtar data från FotMob (Allsvenskan)...');

    try {
        const response = await axios.get(`https://www.fotmob.com/api/leagues?id=${LEAGUE_ID}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const data = response.data;

        // Standings
        if (data.table && data.table[0] && data.table[0].data && data.table[0].data.table) {
            const tableData = data.table[0].data.table.all;
            const standings = tableData.map(team => ({
                rank: team.idx,
                team: team.name === 'Sirius' ? 'IK Sirius' : team.name,
                p: team.played,
                w: team.wins,
                d: team.draws,
                l: team.losses,
                gf: parseInt(team.scoresStr.split('-')[0]),
                ga: parseInt(team.scoresStr.split('-')[1]),
                gd: team.goalConDiff,
                pts: team.pts
            }));

            fs.writeFileSync(TABLE_PATH, JSON.stringify(standings, null, 2));
            console.log('Allsvenskan-tabell sparad.');
        }

        // Matches
        if (data.fixtures && data.fixtures.allMatches) {
            // Find Sirius matches
            const siriusMatches = data.fixtures.allMatches
                .filter(m => (m.home.name === 'Sirius' || m.away.name === 'Sirius' || m.home.shortName === 'Sirius' || m.away.shortName === 'Sirius'))
                .map(m => {
                    const dateObj = new Date(m.status.utcTime);
                    const date = dateObj.toISOString().split('T')[0];
                    const time = dateObj.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

                    let result = null;
                    if (m.status.finished) {
                        result = m.scoreStr.replace(/ - /g, '–');
                    }

                    return {
                        id: m.id,
                        date,
                        time,
                        home: m.home.name === 'Sirius' ? 'IK Sirius' : m.home.name,
                        away: m.away.name === 'Sirius' ? 'IK Sirius' : m.away.name,
                        result,
                        competition: `Allsvenskan - Omgång ${m.round}`
                    };
                });

            fs.writeFileSync(MATCHES_PATH, JSON.stringify(siriusMatches, null, 2));
            console.log('Sirius Allsvenskan-matcher sparade.');
        }

    } catch (error) {
        console.error('Kunde inte hämta data från FotMob:', error.message);
    }
}

scrapeAllsvenskan();
