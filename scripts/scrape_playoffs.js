
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const LEAGUE_ID = 171; // Svenska Cupen
const PLAYOFF_PATH = path.join(process.cwd(), 'public/data/cup_playoffs.json');

async function scrapePlayoffs() {
    try {
        const response = await axios.get(`https://www.fotmob.com/api/leagues?id=${LEAGUE_ID}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const data = response.data;

        // 1. Get all group winners
        const groupWinners = [];
        if (data.table && data.table[0] && data.table[0].data && data.table[0].data.tables) {
            data.table[0].data.tables.forEach((group, index) => {
                const winner = group.table.all[0];
                groupWinners.push({
                    groupName: group.leagueName,
                    team: winner.shortName === 'Sirius' ? 'IK Sirius' : winner.shortName,
                    points: winner.pts,
                    played: winner.played,
                    isDefinite: winner.played === 3 // Group stage is 3 matches
                });
            });
        }

        // 2. Look for knockout matches in fixtures (if they exist)
        // If they don't exist, we will use a placeholder structure
        const knockoutMatches = data.fixtures?.allMatches?.filter(m =>
            typeof m.roundName === 'string' && (m.roundName.toLowerCase().includes('final') || m.roundName.toLowerCase().includes('play-off'))
        ) || [];

        const playoffData = {
            groupWinners,
            matches: knockoutMatches.map(m => ({
                id: m.id,
                round: m.roundName,
                home: m.home.shortName,
                away: m.away.shortName,
                score: m.scoreStr,
                date: m.status.utcTime
            })),
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(PLAYOFF_PATH, JSON.stringify(playoffData, null, 2));
        console.log('Playoff data saved to', PLAYOFF_PATH);

    } catch (e) {
        console.error('Error fetching playoffs:', e.message);
    }
}

scrapePlayoffs();
