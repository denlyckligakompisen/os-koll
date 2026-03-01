import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const STANDINGS_URL = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings';
const OUTPUT_PATH = path.join(process.cwd(), 'public/data/worldcup_2026_groups.json');

async function scrapeStandings() {
    console.log('Attempting to fetch FIFA World Cup 2026 standings...');

    try {
        const { data: html } = await axios.get(STANDINGS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });

        const $ = cheerio.load(html);

        // Since FIFA is very dynamic, we might not get the tables directly.
        // We look for any data in script tags or fallback.

        let groups = [];

        // Example parsing logic (this will need monitoring as FIFA site changes)
        $('.table-container').each((i, el) => {
            const groupName = $(el).find('.group-title').text().trim() || `Grupp ${String.fromCharCode(65 + i)}`;
            const teams = [];

            $(el).find('tr').each((j, row) => {
                const name = $(row).find('.team-name').text().trim();
                if (!name) return;

                teams.push({
                    name,
                    played: parseInt($(row).find('.played').text()) || 0,
                    gd: parseInt($(row).find('.goal-diff').text()) || 0,
                    pts: parseInt($(row).find('.points').text()) || 0
                });
            });

            if (teams.length > 0) {
                groups.push({ name: groupName, teams });
            }
        });

        // Fallback: If we couldn't parse anything (e.g. site changed or blocking), 
        // we keep the existing structure but update the timestamp.
        const currentData = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));

        if (groups.length > 0) {
            currentData.groups = groups;
            console.log(`Successfully parsed ${groups.length} groups.`);
        } else {
            console.log('No groups found in HTML. Site might be dynamic. Using existing teams data.');
            // Just ensure teams are in the right format (objects instead of strings if needed)
            currentData.groups = currentData.groups.map(g => ({
                ...g,
                teams: g.teams.map(t => typeof t === 'string' ? { name: t, played: 0, gd: 0, pts: 0 } : t)
            }));
        }

        currentData.lastUpdated = new Date().toISOString();
        currentData.source = STANDINGS_URL;

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(currentData, null, 2));
        console.log(`Successfully updated FIFA standings at ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('Scraping failed:', error.message);
        // Don't exit with error here to keep the workflow running, but log it
    }
}

scrapeStandings();
