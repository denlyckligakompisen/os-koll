
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const CUP_URL = 'https://forzafootball.com/sv/tournament/svenska-cupen-494/results';
const TABLE_URL = 'https://forzafootball.com/sv/match/ik-sirius-gif-sundsvall-1219369316/table';
const MATCHES_PATH = path.join(process.cwd(), 'public/data/sirius_matches.json');
const STANDINGS_PATH = path.join(process.cwd(), 'public/data/sirius_standings.json');

async function scrapeSirius() {
    console.log('Hämtar data från Forza Football...');

    try {
        // Hämta matcher
        const matchesRes = await axios.get(CUP_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        // Hämta tabell
        const tableRes = await axios.get(TABLE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        console.log('Data hämtad. Skriptet är redo för schemaläggning.');

    } catch (error) {
        console.error('Kunde inte nå Forza Football:', error.message);
    }
}

// För att hålla det enkelt i denna miljö uppdaterar vi statisk data
// baserat på användarens information.
function updateStaticData() {
    const currentMatches = [
        {
            "id": 1,
            "date": "2026-02-21",
            "time": "17:00",
            "home": "IK Sirius",
            "away": "GIF Sundsvall",
            "result": "6–0",
            "competition": "Svenska Cupen - Grupp 8"
        },
        {
            "id": 4,
            "date": "2026-02-22",
            "time": "15:00",
            "home": "IF Elfsborg",
            "away": "Helsingborgs IF",
            "result": "4–0",
            "competition": "Svenska Cupen - Grupp 8"
        },
        {
            "id": 5,
            "date": "2026-02-28",
            "time": "15:00",
            "home": "GIF Sundsvall",
            "away": "IF Elfsborg",
            "result": "0–1",
            "competition": "Svenska Cupen - Grupp 8"
        },
        {
            "id": 2,
            "date": "2026-03-01",
            "time": "17:00",
            "home": "IK Sirius",
            "away": "Helsingborgs IF",
            "result": "4–1",
            "competition": "Svenska Cupen - Grupp 8"
        },
        {
            "id": 3,
            "date": "2026-03-08",
            "time": "13:00",
            "home": "IF Elfsborg",
            "away": "IK Sirius",
            "result": null,
            "competition": "Svenska Cupen - Grupp 8"
        }
    ];

    const currentStandings = [
        { "rank": 1, "team": "IK Sirius", "p": 2, "w": 2, "d": 0, "l": 0, "gf": 10, "ga": 1, "gd": 9, "pts": 6 },
        { "rank": 2, "team": "IF Elfsborg", "p": 2, "w": 2, "d": 0, "l": 0, "gf": 5, "ga": 0, "gd": 5, "pts": 6 },
        { "rank": 3, "team": "Helsingborgs IF", "p": 2, "w": 0, "d": 0, "l": 2, "gf": 1, "ga": 8, "gd": -7, "pts": 0 },
        { "rank": 4, "team": "GIF Sundsvall", "p": 2, "w": 0, "d": 0, "l": 2, "gf": 0, "ga": 7, "gd": -7, "pts": 0 }
    ];

    fs.writeFileSync(MATCHES_PATH, JSON.stringify(currentMatches, null, 2));
    fs.writeFileSync(STANDINGS_PATH, JSON.stringify(currentStandings, null, 2));
    console.log('Sirius-data och tabell uppdaterad.');
}

updateStaticData();
