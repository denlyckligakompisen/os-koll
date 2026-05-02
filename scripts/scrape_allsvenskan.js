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

async function scrapeAllsvenskan() {
    console.log(`Scraping Allsvenskan matches from ${URL}...`);
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    try {
        await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(5000);

        const matches = await page.evaluate((teamNameMap) => {
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

                const scoreEls = row.querySelectorAll('.heading-lg-h5, .heading-h6');
                scoreEls.forEach(el => {
                    const scoreMatch = el.innerText.match(/^(\d+)\s*[-–]\s*(\d+)$/);
                    if (scoreMatch) {
                        score = `${scoreMatch[1]} - ${scoreMatch[2]}`;
                        status = 'finished';
                    }
                });

                const timeMatch = text.match(/(\d{2}:\d{2})/);
                if (timeMatch) time = timeMatch[1];
                if (text.toLowerCase().includes('live')) status = 'live';

                const linkEl = row.querySelector('a[href*="/matcher/"]');
                link = linkEl ? (linkEl.href.startsWith('http') ? linkEl.href : 'https://allsvenskan.se' + linkEl.getAttribute('href')) : '';

                let sibling = row.previousElementSibling;
                while (sibling) {
                    if (sibling.innerText && /(MÅNDAG|TISDAG|ONSDAG|TORSDAG|FREDAG|LÖRDAG|SÖNDAG)\s+\d+\s+(JANUARI|FEBRUARI|MARS|APRIL|MAJ|JUNI|JULI|AUGUSTI|SEPTEMBER|OKTOBER|NOVEMBER|DECEMBER)/i.test(sibling.innerText)) {
                        date = sibling.innerText.split('\n')[0].trim();
                        break;
                    }
                    sibling = sibling.previousElementSibling;
                }
                if (!date) {
                    const dateInRow = text.match(/(MÅNDAG|TISDAG|ONSDAG|TORSDAG|FREDAG|LÖRDAG|SÖNDAG)\s+\d+\s+(JANUARI|FEBRUARI|MARS|APRIL|MAJ|JUNI|JULI|AUGUSTI|SEPTEMBER|OKTOBER|NOVEMBER|DECEMBER)/i);
                    if (dateInRow) date = dateInRow[0];
                }

                if (home && away) {
                    results.push({ home, away, time, date: date.trim(), link, score, status });
                }
            });
            
            return results;
        }, TEAM_NAME_MAP);

        const data = {
            matches,
            lastUpdated: new Date().toISOString(),
            source: URL
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
        console.log(`Successfully scraped ${matches.length} matches and saved to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error scraping Allsvenskan:', error.message);
    } finally {
        await browser.close();
    }
}

scrapeAllsvenskan();
