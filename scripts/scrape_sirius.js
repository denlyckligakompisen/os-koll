
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const LEAGUE_ID = 171; // Svenska Cupen
const MATCHES_PATH = path.join(process.cwd(), 'public/data/sirius_matches.json');
const STANDINGS_PATH = path.join(process.cwd(), 'public/data/sirius_standings.json');
const PLAYOFF_PATH = path.join(process.cwd(), 'public/data/cup_playoffs.json');

const CACHE_DURATION = 30 * 60 * 1000; // 30 minuter

async function scrapeSirius() {
    const force = process.argv.includes('--force');
    const now = new Date().getTime();

    // Kolla om vi är i ett match-fönster (från start till 1h efter slut, ca 3h totalt)
    let isMatchWindow = false;
    if (fs.existsSync(MATCHES_PATH)) {
        const matches = JSON.parse(fs.readFileSync(MATCHES_PATH, 'utf8'));
        isMatchWindow = matches.some(m => {
            const matchTime = new Date(`${m.date}T${m.time}`).getTime();
            // Fönster: Från matchstart till 3 timmar efter start (90min match + paus + 60min buffer)
            return now >= matchTime && now <= (matchTime + 3 * 60 * 60 * 1000);
        });
    }

    // Kolla om vi behöver uppdatera
    if (!force && fs.existsSync(STANDINGS_PATH)) {
        const stats = fs.statSync(STANDINGS_PATH);
        const lastUpdate = new Date(stats.mtime).getTime();

        // Om vi INTE är i ett matchfönster, uppdatera inte (om det inte gått mer än 24h för att få nya scheman)
        if (!isMatchWindow) {
            const highCacheDuration = 24 * 60 * 60 * 1000;
            if (now - lastUpdate < highCacheDuration) {
                console.log('Inte i matchfönster och datan är färsk nog (24h). Hoppar över.');
                return;
            }
        }

        // I matchfönster använder vi 30 min cache
        if (now - lastUpdate < CACHE_DURATION) {
            console.log('Datan är mindre än 30 minuter gammal. Hoppar över.');
            return;
        }
    }

    console.log('Hämtar data från FotMob (Svenska Cupen)...');

    try {
        const response = await axios.get(`https://www.fotmob.com/api/leagues?id=${LEAGUE_ID}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const data = response.data;

        // Find Sirius group
        let siriusGroup = null;
        if (data.table && data.table[0] && data.table[0].data && data.table[0].data.tables) {
            siriusGroup = data.table[0].data.tables.find(t =>
                t.table.all.some(team => team.name === 'Sirius' || team.shortName === 'Sirius')
            );
        }

        if (siriusGroup) {
            const standings = siriusGroup.table.all.map(team => ({
                id: team.id,
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

            fs.writeFileSync(STANDINGS_PATH, JSON.stringify(standings, null, 2));
            console.log(`Tabell för ${siriusGroup.leagueName} sparad.`);
        }

        // Extract Sirius matches
        if (data.fixtures && data.fixtures.allMatches) {
            const siriusMatches = data.fixtures.allMatches
                .filter(m => (m.home.name === 'Sirius' || m.away.name === 'Sirius' || m.home.shortName === 'Sirius' || m.away.shortName === 'Sirius'))
                .map(m => {
                    const dateObj = new Date(m.status.utcTime);
                    const date = dateObj.toISOString().split('T')[0];
                    const time = dateObj.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

                    let result = null;
                    if (m.status.finished) {
                        const score = m.scoreStr || m.status.scoreStr;
                        result = score ? score.replace(/ - /g, '–') : null;
                    }

                    return {
                        id: m.id,
                        date,
                        time,
                        home: m.home.name === 'Sirius' ? 'IK Sirius' : m.home.name,
                        away: m.away.name === 'Sirius' ? 'IK Sirius' : m.away.name,
                        result,
                        competition: `Svenska Cupen - ${siriusGroup ? siriusGroup.leagueName : 'Gruppspel'}`
                    };
                });

            fs.writeFileSync(MATCHES_PATH, JSON.stringify(siriusMatches, null, 2));
            console.log('Sirius-matcher i cupen sparade.');
        }

        // --- PLAYOFF EXTRACTION ---
        const groupWinners = [];
        if (data.table && data.table[0] && data.table[0].data && data.table[0].data.tables) {
            data.table[0].data.tables.forEach((group) => {
                const winner = group.table.all[0];
                const isDefinite = winner.played === 3; // Simplified: 3 matches is end of group stage

                // If not definite, find other teams that can still win
                const contenders = [];
                if (!isDefinite) {
                    group.table.all.slice(1).forEach(team => {
                        const maxPts = team.pts + (3 - team.played) * 3;
                        if (maxPts >= winner.pts) {
                            contenders.push(team.shortName === 'Sirius' ? 'IK Sirius' : team.shortName);
                        }
                    });
                }

                groupWinners.push({
                    groupName: group.leagueName,
                    team: winner.shortName === 'Sirius' ? 'IK Sirius' : winner.shortName,
                    pts: winner.pts,
                    p: winner.played,
                    gd: winner.goalConDiff || 0,
                    isDefinite: isDefinite,
                    contenders: contenders
                });
            });
        }

        // Look for knockout matches
        const knockoutMatches = data.fixtures?.allMatches?.filter(m =>
            m.roundName && (typeof m.roundName === 'string') &&
            (m.roundName.toLowerCase().includes('final') || m.roundName.toLowerCase().includes('play-off'))
        ) || [];

        const playoffData = {
            groupWinners,
            matches: knockoutMatches.map(m => ({
                id: m.id,
                round: m.roundName,
                home: m.home.name === 'Sirius' ? 'IK Sirius' : m.home.name,
                away: m.away.name === 'Sirius' ? 'IK Sirius' : m.away.name,
                result: (m.scoreStr || m.status.scoreStr) ? (m.scoreStr || m.status.scoreStr).replace(/ - /g, '–') : null,
                date: m.status.utcTime
            })),
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(PLAYOFF_PATH, JSON.stringify(playoffData, null, 2));
        console.log('Slutspels-data sparad.');

    } catch (error) {
        console.error('Kunde inte hämta data från FotMob:', error.message);
    }
}

scrapeSirius();
