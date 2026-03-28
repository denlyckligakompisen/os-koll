import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const STANDINGS_URL = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings';
const OUTPUT_PATH = path.join(process.cwd(), 'public/data/worldcup_2026_groups.json');

async function scrapeStandings() {
    console.log(`Starting crawl of FIFA World Cup 2026 standings from ${STANDINGS_URL}...`);
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(STANDINGS_URL, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(5000); 

        // Extract directly from the page
        const groups = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('[class*="TableContainer"], .table-container').forEach((el, i) => {
                const groupName = el.querySelector('[class*="GroupTitle"], .group-title')?.innerText || `Grupp ${String.fromCharCode(65 + i)}`;
                const teams = [];
                el.querySelectorAll('tr').forEach(row => {
                    const name = row.querySelector('[class*="TeamName"], .team-name')?.innerText;
                    if (!name) return;
                    
                    teams.push({
                        name: name.trim(),
                        played: parseInt(row.querySelector('[class*="Played"], .played')?.innerText) || 0,
                        gd: parseInt(row.querySelector('[class*="GoalDiff"], .goal-diff')?.innerText) || 0,
                        pts: parseInt(row.querySelector('[class*="Points"], .points')?.innerText) || 0
                    });
                });
                if (teams.length > 0) results.push({ name: groupName, teams });
            });
            return results;
        });

        await browser.close();

        const currentData = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));

        if (groups.length > 0) {
            currentData.groups = groups;
            console.log(`Successfully parsed ${groups.length} groups.`);
        } else {
            console.log('No groups found in page. Site might be using different selectors. Using existing teams data.');
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
        try { await browser.close(); } catch(e) {}
    }
}

scrapeStandings();
