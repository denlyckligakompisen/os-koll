import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const FIFA_URL = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=&wtw-filter=ALL';
const MATCHES_OUTPUT = path.join(process.cwd(), 'public/data/worldcup_2026_matches.json');
const GROUPS_OUTPUT = path.join(process.cwd(), 'public/data/worldcup_2026_groups.json');
const KNOCKOUT_OUTPUT = path.join(process.cwd(), 'public/data/worldcup_2026_knockout.json');

const TEAM_TRANSLATIONS = {
    'Germany': 'Tyskland',
    'Ivory Coast': 'Elfenbenskusten',
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
    'Italy': 'Italien',
    'Sweden': 'Sverige',
    'Norway': 'Norge',
    'Belgium': 'Belgien',
    'Turkey': 'Turkiet',
    'Türkiye': 'Turkiet',
    'Czech Republic': 'Tjeckien',
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
    'Ukraine': 'Ukraina',
    'Serbia': 'Serbien',
    'Portugal': 'Portugal',
    'Slovenia': 'Slovenien',
    'South Africa': 'Sydafrika',
    'Japan': 'Japan',
    'Ecuador': 'Ecuador',
    'Senegal': 'Senegal',
    'Saudi Arabia': 'Saudiarabien',
    'Uzbekistan': 'Uzbekistan',
    'Colombia': 'Colombia',
    'Argentina': 'Argentina',
    'Uruguay': 'Uruguay',
    'Iran': 'Iran'
};

const translateTeam = (name) => {
    if (!name) return name;
    return TEAM_TRANSLATIONS[name.trim()] || name.trim();
};

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
                // More aggressive selection for FIFA site layouts
                const matchElements = document.querySelectorAll('[data-testid*="match"], [class*="MatchCard"], [class*="match-card"], .fp-match-card-content');
                
                matchElements.forEach(item => {
                    const home = item.querySelector('[class*="home-team"] [class*="TeamName"], [class*="HomeTeam"], [data-testid*="home-team"]')?.innerText;
                    const away = item.querySelector('[class*="away-team"] [class*="TeamName"], [class*="AwayTeam"], [data-testid*="away-team"]')?.innerText;
                    const time = item.querySelector('[class*="MatchTime"], [class*="time"], [data-testid*="time"]')?.innerText || "TBA";
                    const date = item.closest('[class*="DateHeader"], .fp-match-date')?.innerText || 
                                 item.querySelector('[class*="MatchDate"], [class*="date"]')?.innerText;
                    
                    if (home && away) {
                        results.push({ 
                            home: home.trim(), 
                            away: away.trim(), 
                            time: time.trim(), 
                            date: date?.trim() 
                        });
                    }
                });
                return results;
            });

            if (extracted.length > 0) {
                matches = extracted.map(m => ({
                    ...m,
                    date: m.date?.toLowerCase()
                        .replace('june', 'juni')
                        .replace('july', 'juli')
                        .replace('january', 'januari')
                        .replace('february', 'februari')
                        .replace('march', 'mars')
                        .replace('april', 'april')
                        .replace('may', 'maj'),
                    home: translateTeam(m.home),
                    away: translateTeam(m.away)
                }));
                console.log(`Successfully scraped ${matches.length} matches from official FIFA source!`);
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
