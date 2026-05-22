import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const URL = 'https://allsvenskan.se/matcher';
const OUTPUT_FILE = path.join(process.cwd(), 'public/data/allsvenskan_matches.json');

const TEAM_NAME_MAP = {
    'Hammarby': 'Hammarby IF',
    'Djurgården': 'Djurgårdens IF',
    'BP': 'IF Brommapojkarna'
};

const monthMap = { 'JANUARI': 0, 'FEBRUARI': 1, 'MARS': 2, 'APRIL': 3, 'MAJ': 4, 'JUNI': 5, 'JULI': 6, 'AUGUSTI': 7, 'SEPTEMBER': 8, 'OKTOBER': 9, 'NOVEMBER': 10, 'DECEMBER': 11 };

function parseDate(dateStr, timeStr) {
    const parts = dateStr.split(' ');
    if (parts.length < 3) return new Date();
    const day = parseInt(parts[1], 10);
    const month = monthMap[parts[2].toUpperCase()] || 0;
    const now = new Date();
    const year = now.getFullYear();
    const [hours, mins] = timeStr === 'TBA' || !timeStr ? [0,0] : timeStr.split(':').map(Number);
    return new Date(year, month, day, hours || 0, mins || 0);
}

async function scrapeAllsvenskan() {
    console.log(`Scraping Allsvenskan matches from ${URL}...`);
    
    // Load cache
    let existingMatches = [];
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            existingMatches = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8')).matches || [];
            console.log(`Loaded ${existingMatches.length} existing matches from cache.`);
        } catch(e) {
            console.error('Failed to parse existing cache.');
        }
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    try {
        await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(5000);

        const newMatches = await page.evaluate((teamNameMap) => {
            const results = [];
            const rows = document.querySelectorAll('.data-container__row');
            
            rows.forEach(row => {
                const text = row.innerText || '';
                const teamEl = row.querySelector('.heading-lg-h5, .heading-h6, [class*="heading"]');
                
                let home = '', away = '', time = 'TBA', date = '', link = '', score = '', status = 'upcoming';

                if (teamEl) {
                    const parts = teamEl.innerText.split(/ [-–] /);
                    if (parts.length >= 2) {
                        home = parts[0].trim();
                        away = parts[1].trim();
                    }
                }

                if (!home || !away) {
                    const teamMatch = text.match(/([A-ZÅÄÖ][^-\n–]+)\s+[-–]\s+([A-ZÅÄÖ][^-\n–\d]+)/);
                    if (teamMatch) {
                        home = teamMatch[1].trim();
                        away = teamMatch[2].trim();
                    }
                }

                const clean = (name) => {
                    let cleaned = name.replace(/^(MÅNDAG|TISDAG|ONSDAG|TORSDAG|FREDAG|LÖRDAG|SÖNDAG).*?\d+\s+[A-ZÅÄÖ]+\s+/i, '')
                               .replace(/^[A-ZÅÄÖ\s]{5,}\s+(?=[A-ZÅÄÖ][a-zåäö])/g, '')
                               .trim();
                    
                    if (teamNameMap[cleaned]) return teamNameMap[cleaned];
                    return cleaned;
                };
                home = clean(home);
                away = clean(away);

                const scoreBadges = row.querySelectorAll('.score-result.badge');
                if (scoreBadges.length >= 2) {
                    score = `${scoreBadges[0].innerText.trim()} - ${scoreBadges[1].innerText.trim()}`;
                }

                if (text.includes('SUMMERING')) {
                    status = 'finished';
                } else if (text.toLowerCase().includes('live')) {
                    status = 'live';
                }

                const timeMatch = text.match(/(\d{2}:\d{2})/);
                if (timeMatch) time = timeMatch[1];

                const aEl = row.querySelector('a');
                if (aEl) {
                    link = aEl.href;
                }

                const dateInRow = text.match(/(MÅNDAG|TISDAG|ONSDAG|TORSDAG|FREDAG|LÖRDAG|SÖNDAG)\s+\d+\s+(JANUARI|FEBRUARI|MARS|APRIL|MAJ|JUNI|JULI|AUGUSTI|SEPTEMBER|OKTOBER|NOVEMBER|DECEMBER)/i);
                if (dateInRow) {
                    teamNameMap.__currentDate = dateInRow[0].toUpperCase();
                }
                date = teamNameMap.__currentDate || '';

                if (home && away) {
                    results.push({ home, away, time, date: date.trim(), link, score, status });
                }
            });
            
            return results;
        }, TEAM_NAME_MAP);

        // Merge and process details
        const now = new Date();

        // Deduplicate newMatches (allsvenskan.se sometimes lists matches twice in top carousels)
        const uniqueNewMatches = [];
        const seen = new Set();
        for (const m of newMatches) {
            const key = `${m.home}-${m.away}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueNewMatches.push(m);
            }
        }

        const mergedMatches = [];
        for (const nm of uniqueNewMatches) {
            // Find existing
            const existing = existingMatches.find(e => e.home === nm.home && e.away === nm.away && e.date === nm.date);

            const matchDate = parseDate(nm.date, nm.time);
            const startTimestamp = Math.floor(matchDate.getTime() / 1000);

            mergedMatches.push({
                ...nm,
                startTimestamp
            });
        }

        const data = {
            matches: mergedMatches,
            lastUpdated: new Date().toISOString(),
            source: URL
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
        console.log(`Successfully scraped ${mergedMatches.length} matches and saved to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error scraping Allsvenskan:', error.message);
    } finally {
        await browser.close();
    }
}

scrapeAllsvenskan();
