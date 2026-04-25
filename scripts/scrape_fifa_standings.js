import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { translateTeam } from './constants.js';

const STANDINGS_URL = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings';
const OUTPUT_PATH = path.join(process.cwd(), 'public/data/worldcup_2026_groups.json');

async function scrapeStandings() {
    console.log(`Starting crawl of FIFA World Cup 2026 standings from ${STANDINGS_URL}...`);
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(STANDINGS_URL, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(5000); 

        const groups = await page.evaluate(() => {
            const results = [];
            // Target the standings tables/containers
            document.querySelectorAll('[class*="TableContainer"], .table-container, [class*="StandingsGroup"]').forEach((el, i) => {
                const groupName = el.querySelector('[class*="GroupTitle"], .group-title, [class*="TableTitle"]')?.innerText || `Grupp ${String.fromCharCode(65 + i)}`;
                const teams = [];
                el.querySelectorAll('tr').forEach(row => {
                    const nameEl = row.querySelector('[class*="TeamName"], .team-name');
                    if (!nameEl) return;
                    
                    const name = nameEl.innerText;
                    teams.push({
                        name: name.trim(),
                        played: parseInt(row.querySelector('[class*="Played"], .played, td:nth-child(2)')?.innerText) || 0,
                        gd: parseInt(row.querySelector('[class*="GoalDiff"], .goal-diff, td:nth-child(8)')?.innerText) || 0,
                        pts: parseInt(row.querySelector('[class*="Points"], .points, td:last-child')?.innerText) || 0
                    });
                });
                if (teams.length > 0) results.push({ name: groupName, teams });
            });
            return results;
        });

        await browser.close();

        const translatedGroups = groups.map(g => ({
            name: g.name.replace('Group', 'Grupp'),
            teams: g.teams.map(t => ({
                ...t,
                name: translateTeam(t.name)
            }))
        }));

        if (translatedGroups.length > 0) {
            const currentData = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
            currentData.groups = translatedGroups;
            currentData.lastUpdated = new Date().toISOString();
            currentData.source = STANDINGS_URL;
            fs.writeFileSync(OUTPUT_PATH, JSON.stringify(currentData, null, 2));
            console.log(`Successfully updated FIFA standings for ${translatedGroups.length} groups.`);
        } else {
            console.log('No groups found in page. Site might be using different selectors.');
        }

    } catch (error) {
        console.error('Scraping failed:', error.message);
        try { await browser.close(); } catch(e) {}
    }
}

scrapeStandings();
