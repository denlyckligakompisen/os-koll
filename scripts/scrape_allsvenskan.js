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
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        timezoneId: 'Europe/Stockholm'
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

        const yesterdayOnly = process.argv.includes('--yesterday-only') || process.env.GITHUB_ACTIONS === 'true';

        let yesterday, today;
        if (yesterdayOnly) {
            yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            today = new Date(now.getTime() - 24 * 60 * 60 * 1000); // End of yesterday
            console.log("Restricting details scraping to yesterday's matches only.");
        } else {
            yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            today = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Including tomorrow just to be safe if a match runs late into the night
            console.log("Scraping details for yesterday, today, and tomorrow's matches.");
        }
        yesterday.setHours(0,0,0,0);
        today.setHours(23,59,59,999);

        const mergedMatches = [];
        for (const nm of uniqueNewMatches) {
            // Find existing match by link (most reliable) or by home+away
            const existing = existingMatches.find(e => 
                (nm.link && e.link === nm.link) || 
                (e.home === nm.home && e.away === nm.away && e.date === nm.date)
            );
            
            // Preserve cached date if it exists (scraper date parsing from page is unreliable)
            const date = existing?.date || nm.date;

            let scorers = { home: [], away: [] };
            if (existing && existing.scorers) {
                scorers = existing.scorers;
            }

            let detailedStats = null;
            if (existing && existing.detailedStats) {
                detailedStats = existing.detailedStats;
            }

            const matchDate = parseDate(date, nm.time);
            const startTimestamp = Math.floor(matchDate.getTime() / 1000);
            const inWindow = matchDate >= yesterday && matchDate <= today;
            const hasDetails = existing && existing.status === 'finished' && existing.detailedStats !== null;

            if (inWindow && nm.link && !hasDetails) {
                console.log(`Fetching details for ${nm.home} - ${nm.away}...`);
                try {
                    await page.goto(nm.link, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    await page.waitForTimeout(2000);
                    
                    const extracted = await page.evaluate(() => {
                        const hScorers = [];
                        const aScorers = [];
                        
                        document.querySelectorAll('.match-events > li').forEach(li => {
                            const minEl = li.querySelector('.match-events__minute');
                            const nameEl = li.querySelector('span:not(.match-events__minute)');
                            
                            if (minEl && nameEl) {
                                const timeStr = minEl.innerText.trim().replace("'", "");
                                const time = parseInt(timeStr, 10);
                                const name = nameEl.innerText.trim();
                                
                                const svgHtml = li.querySelector('svg')?.outerHTML || '';
                                let incidentClass = 'goal';
                                
                                if (svgHtml.includes('#FFD600') || svgHtml.includes('#ffd600') || svgHtml.toLowerCase().includes('yellow')) {
                                    incidentClass = 'yellow-card';
                                } else if (svgHtml.includes('url(#paint') || svgHtml.includes('linearGradient')) {
                                    incidentClass = 'goal';
                                } else if (svgHtml.match(/fill="#(E[0-9A-F]|F[0-9A-F])[0-9A-F]{4}"/i) || svgHtml.toLowerCase().includes('red')) {
                                    incidentClass = 'red-card';
                                }

                                const event = {
                                    player: { name },
                                    time: isNaN(time) ? timeStr : time,
                                    incidentClass: incidentClass
                                };

                                if (li.className.includes('lg-start')) {
                                    hScorers.push(event);
                                } else {
                                    aScorers.push(event);
                                }
                            }
                        });

                        const info = [];
                        document.querySelectorAll('.match-hero__info > div').forEach(div => info.push(div.innerText.trim()));

                        const stats = [];
                        document.querySelectorAll('.data-container__row').forEach(row => {
                            const cols = row.querySelectorAll('div');
                            if(cols.length >= 3) {
                                stats.push({
                                    home: cols[0].innerText.trim(),
                                    label: cols[1].innerText.trim(),
                                    away: cols[2].innerText.trim()
                                });
                            }
                        });

                        const players = [];
                        document.querySelectorAll('.stats-table__row').forEach(row => {
                            const cols = row.querySelectorAll('div');
                            if(cols.length > 3) {
                                players.push(row.innerText.replace(/\n/g, ' | '));
                            }
                        });

                        return { 
                            scorers: { home: hScorers, away: aScorers },
                            detailedStats: { info, stats, players }
                        };
                    });
                    
                    scorers = extracted.scorers;
                    detailedStats = extracted.detailedStats;
                } catch(e) {
                    console.log(`Failed to fetch details for ${nm.home} - ${nm.away}: ${e.message}`);
                }
            }

            mergedMatches.push({
                ...nm,
                date,
                startTimestamp,
                scorers,
                detailedStats
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
