import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const FIFA_URL = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=&wtw-filter=ALL';
const TV4_LIST_URL = 'https://www.tv4play.se/lista/1EGE533EMNsEsyaAulLPNT';
const TV4_DEFAULT_LINK = 'https://www.tv4play.se/kategorier/fifa-fotbolls-vm-2026';

const MATCHES_OUTPUT = path.join(process.cwd(), 'public/data/worldcup_2026_matches.json');
const GROUPS_OUTPUT = path.join(process.cwd(), 'public/data/worldcup_2026_groups.json');
const KNOCKOUT_OUTPUT = path.join(process.cwd(), 'public/data/worldcup_2026_knockout.json');

const TEAM_TRANSLATIONS = {
    'Germany': 'Tyskland',
    'Ivory Coast': 'Elfenbenskusten',
    'Ivory Coast (CIV)': 'Elfenbenskusten',
    'Netherlands': 'Nederländerna',
    'Iceland': 'Island',
    'Tunisia': 'Tunisien',
    'Spain': 'Spanien',
    'Egypt': 'Egypten',
    'Saudi Arabia': 'Saudiarabien',
    'United Arab Emirates': 'Förenade Arabemiraten',
    'New Zealand': 'Nya Zeeland',
    'France': 'Frankrike',
    'Algeria': 'Algeriet',
    'Austria': 'Österrike',
    'Croatia': 'Kroatien',
    'Mexico': 'Mexiko',
    'South Korea': 'Sydkorea',
    'Switzerland': 'Schweiz',
    'Canada': 'Kanada',
    'Brazil': 'Brasilien',
    'Morocco': 'Marocko',
    'Cape Verde': 'Kap Verde',
    'United States': 'USA',
    'United States (USA)': 'USA',
    'Italy': 'Italien',
    'Sweden': 'Sverige',
    'Norway': 'Norge',
    'Belgium': 'Belgien',
    'Turkey': 'Turkiet',
    'Türkiye': 'Turkiet',
    'Czech Republic': 'Tjeckien',
    'Czechia': 'Tjeckien',
    'Slovakia': 'Slovakien',
    'Russia': 'Ryssland',
    'Georgia': 'Georgien',
    'Greece': 'Grekland',
    'Denmark': 'Danmark',
    'North Macedonia': 'Nordmakedonien',
    'Northern Ireland': 'Nordirland',
    'Republic of Ireland': 'Irland',
    'Ireland': 'Irland',
    'Wales': 'Wales',
    'Poland': 'Polen',
    'Scotland': 'Skottland',
    'Hungary': 'Ungern',
    'Romania': 'Rumänien',
    'Bosnia and Herzegovina': 'Bosnien och Hercegovina',
    'Bosnia': 'Bosnien och Hercegovina',
    'Serbia': 'Serbien',
    'Portugal': 'Portugal',
    'Slovenia': 'Slovenien',
    'South Africa': 'Sydafrika',
    'Japan': 'Japan',
    'Ecuador': 'Ecuador',
    'Senegal': 'Senegal',
    'Uzbekistan': 'Uzbekistan',
    'Colombia': 'Colombia',
    'Argentina': 'Argentina',
    'Uruguay': 'Uruguay',
    'Iran': 'Iran',
    'New Caledonia': 'Nya Kaledonien',
    'Jamaica': 'Jamaika',
    'Jamaika': 'Jamaika',
    'DR Congo': 'Demokratiska republiken Kongo',
    'Bolivia': 'Bolivia',
    'Suriname': 'Suriname',
    'Iraq': 'Irak',
    'Paraguay': 'Paraguay',
    'Haiti': 'Haiti',
    'Australia': 'Australien',
    'Jordan': 'Jordanien',
    'Curaçao': 'Curaçao',
    'Curacao': 'Curaçao',
    'Ghana': 'Ghana',
    'Panama': 'Panama'
};

const translateTeam = (name) => {
    if (!name) return name;
    const parts = name.split('/');
    if (parts.length > 1) {
        return parts.map(p => translateTeam(p.trim())).join('/');
    }
    const trimmed = name.trim();
    const cleanName = trimmed.replace(/\s\([A-Z]+\)$/, '');
    return TEAM_TRANSLATIONS[cleanName] || TEAM_TRANSLATIONS[trimmed] || trimmed;
};

async function scrapeTv4Links(page) {
    console.log(`Scraping TV4 Play links from ${TV4_LIST_URL}...`);
    try {
        await page.goto(TV4_LIST_URL, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(3000);
        
        return await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href*="/program/"]'))
                .map(a => ({
                    text: a.innerText.trim(),
                    href: a.href.startsWith('http') ? a.href : 'https://www.tv4play.se' + a.getAttribute('href')
                }))
                .filter(l => l.text.length > 5);
        });
    } catch (e) {
        console.error('Failed to scrape TV4 links:', e.message);
        return [];
    }
}

async function scrapeMatches() {
    let matches = [];
    const existingData = fs.existsSync(MATCHES_OUTPUT) ? JSON.parse(fs.readFileSync(MATCHES_OUTPUT, 'utf8')) : { matches: [] };

    // Calculate start and end timestamp for yesterday, today, and tomorrow
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = Math.floor(new Date(todayStart.getTime() - 24 * 60 * 60 * 1000).getTime() / 1000);
    const tomorrowEnd = Math.floor(new Date(todayStart.getTime() + 2 * 24 * 60 * 60 * 1000).getTime() / 1000);

    const hasCache = existingData.matches.length > 0 && !process.argv.includes('--all');
    if (hasCache) {
        const matchesInWindow = existingData.matches.filter(m => 
            m.startTimestamp && m.startTimestamp >= yesterdayStart && m.startTimestamp < tomorrowEnd
        );
        if (matchesInWindow.length === 0) {
            console.log('⚽ FIFA World Cup 2026 Scraper');
            console.log('   Loaded existing matches from cache.');
            console.log('   Optimization active: No matches scheduled for yesterday, today, or tomorrow.');
            console.log('   Exiting early to save resources and API hits. Use --all to force full sync.');
            return;
        }
        console.log(`   Optimization active: Found ${matchesInWindow.length} match(es) in the 3-day window. Proceeding to update...`);
    }

    console.log(`Starting crawl of FIFA World Cup 2026 schedule from ${FIFA_URL}...`);

    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();
        
        try {
            // 1. Scrape TV4 Links
            const tv4Links = await scrapeTv4Links(page);
            console.log(`Found ${tv4Links.length} potential TV4 links.`);

            // 2. Scrape FIFA Matches
            await page.goto(FIFA_URL, { waitUntil: 'networkidle', timeout: 60000 });
            await page.waitForTimeout(5000);
            
            const extracted = await page.evaluate(() => {
                const results = [];
                const daySections = document.querySelectorAll('[class*="MatchDateSection"], [class*="MatchGroup"], .match-list-date');
                
                if (daySections.length > 0) {
                    daySections.forEach(section => {
                        const dateText = section.querySelector('[class*="DateHeader"], .date-header')?.innerText || "";
                        const matchItems = section.querySelectorAll('[class*="MatchItem"], .match-card');
                        
                        matchItems.forEach(item => {
                            const teamNames = Array.from(item.querySelectorAll('[class*="TeamName"], .team-name')).map(el => el.innerText.trim());
                            const time = item.querySelector('[class*="MatchTime"], .match-time')?.innerText || "TBA";
                            const groupText = item.querySelector('[class*="GroupName"], .group-name')?.innerText || "";
                            
                            // Try to extract score
                            const scoreEl = item.querySelector('[class*="Score"], .score, .match-score');
                            let score = "";
                            let status = "upcoming";
                            if (scoreEl && scoreEl.innerText.includes('-')) {
                                score = scoreEl.innerText.trim();
                                status = "finished"; // Assume finished if score exists for now
                            }

                            if (teamNames.length >= 2) {
                                results.push({
                                    home: teamNames[0],
                                    away: teamNames[1],
                                    time: time.match(/\d{2}:\d{2}/)?.[0] || time,
                                    score: score,
                                    status: status,
                                    date: dateText.trim(),
                                    group: groupText.trim()
                                });
                            }
                        });
                    });
                } else {
                    document.querySelectorAll('[class*="MatchItem"], .match-card, [class*="FpMatchCard"]').forEach(item => {
                        const teamNames = Array.from(item.querySelectorAll('[class*="TeamName"], .team-name')).map(el => el.innerText.trim());
                        const time = item.innerText.match(/\d{2}:\d{2}/)?.[0] || "TBA";
                        
                        const scoreEl = item.querySelector('[class*="Score"], .score, .match-score');
                        let score = "";
                        let status = "upcoming";
                        if (scoreEl && scoreEl.innerText.includes('-')) {
                            score = scoreEl.innerText.trim();
                            status = "finished";
                        }

                        if (teamNames.length >= 2) {
                            results.push({
                                home: teamNames[0],
                                away: teamNames[1],
                                time,
                                score: score,
                                status: status,
                                date: "",
                                group: ""
                            });
                        }
                    });
                }
                return results;
            });

            if (extracted.length > 0) {
                matches = extracted.map(m => {
                    const home = translateTeam(m.home);
                    const away = translateTeam(m.away);
                    const date = m.date?.toLowerCase()
                        .replace('june', 'juni')
                        .replace('july', 'juli')
                        .replace('august', 'augusti')
                        .replace('january', 'januari')
                        .replace('february', 'februari')
                        .replace('march', 'mars')
                        .replace('april', 'april')
                        .replace('may', 'maj')
                        .replace('september', 'september')
                        .replace('october', 'oktober')
                        .replace('november', 'november')
                        .replace('december', 'december');

                    // Find existing match to preserve broadcaster and venue
                    const existingMatch = existingData.matches.find(em => 
                        em.home === home && em.away === away && em.date === date
                    );

                    const broadcast = existingMatch?.broadcast || "";
                    const venue = existingMatch?.venue || "";
                    let link = existingMatch?.link || "";

                    // If TV4, try to find direct link or use default
                    if (broadcast.includes('TV4')) {
                        const directLink = tv4Links.find(tl => {
                            const t = tl.text.toLowerCase();
                            const h = home.toLowerCase();
                            const a = away.toLowerCase();
                            return t.includes(h) && t.includes(a);
                        });
                        link = directLink ? directLink.href : TV4_DEFAULT_LINK;
                    }

                    return {
                        date,
                        time: m.time,
                        home,
                        away,
                        venue,
                        broadcast,
                        group: m.group ? (m.group.includes('Group') ? m.group.replace('Group', 'Grupp') : m.group) : "",
                        link
                    };
                });
                console.log(`Successfully scraped and merged ${matches.length} matches!`);
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

            fs.writeFileSync(MATCHES_OUTPUT, JSON.stringify(data, null, 2));
            console.log(`Updated ${MATCHES_OUTPUT}`);

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
