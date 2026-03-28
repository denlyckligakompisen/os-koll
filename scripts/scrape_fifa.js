import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const FIFA_URL = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=&wtw-filter=ALL';
const MATCHES_OUTPUT = path.join(process.cwd(), 'public/data/worldcup_2026_matches.json');
const GROUPS_OUTPUT = path.join(process.cwd(), 'public/data/worldcup_2026_groups.json');
const KNOCKOUT_OUTPUT = path.join(process.cwd(), 'public/data/worldcup_2026_knockout.json');

async function scrapeMatches() {
    console.log(`Starting crawl of FIFA World Cup 2026 schedule from ${FIFA_URL}...`);

    let matches = [];

    try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        try {
            await page.goto(FIFA_URL, { waitUntil: 'networkidle', timeout: 60000 });
            await page.waitForTimeout(5000);
            
            const extracted = await page.evaluate(() => {
                const results = [];
                const items = document.querySelectorAll('[class*="match-card"], [class*="MatchItem"]');
                items.forEach(item => {
                    const home = item.querySelector('[class*="home-team"] [class*="TeamName"]')?.innerText || 
                                 item.querySelector('[class*="HomeTeam"]')?.innerText;
                    const away = item.querySelector('[class*="away-team"] [class*="TeamName"]')?.innerText || 
                                 item.querySelector('[class*="AwayTeam"]')?.innerText;
                    const time = item.querySelector('[class*="MatchTime"]')?.innerText || "TBA";
                    const date = item.closest('[class*="DateHeader"]')?.innerText || 
                                 item.querySelector('[class*="MatchDate"]')?.innerText;
                    if (home && away) results.push({ home, away, time, date });
                });
                return results;
            });

            if (extracted.length > 0) {
                matches = extracted.map(m => ({
                    ...m,
                    date: m.date?.toLowerCase().replace('june', 'juni').replace('july', 'juli'),
                    home: m.home.trim(),
                    away: m.away.trim()
                }));
                console.log(`Successfully scraped ${matches.length} matches from FIFA.com!`);
            }
        } catch (e) {
            console.log('Playwright crawl failed or timed out:', e.message);
        } finally {
            await browser.close();
        }

        if (matches.length > 0) {
            const data = {
                matches: matches,
                lastUpdated: new Date().toISOString(),
                source: FIFA_URL
            };

            // Write all matches
            fs.writeFileSync(MATCHES_OUTPUT, JSON.stringify(data, null, 2));
            console.log(`Updated ${MATCHES_OUTPUT}`);

            // Update timestamps for current data files
            [GROUPS_OUTPUT, KNOCKOUT_OUTPUT].forEach(filePath => {
                if (fs.existsSync(filePath)) {
                    const current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    current.lastUpdated = new Date().toISOString();
                    current.source = FIFA_URL;
                    fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
                    console.log(`Timestamp updated for ${path.basename(filePath)}`);
                }
            });
        } else {
            console.log('No matches parsed from FIFA.com. Keeping existing files.');
        }

    } catch (error) {
        console.error('Scraping error:', error.message);
    }
}

scrapeMatches();
