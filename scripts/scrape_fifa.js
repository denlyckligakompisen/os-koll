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
    'Ukraine': 'Ukraina',
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
    // Handle names like "New Caledonia / Jamaica / DR Congo"
    const parts = name.split('/');
    if (parts.length > 1) {
        return parts.map(p => translateTeam(p.trim())).join('/');
    }
    const trimmed = name.trim();
    // Also handle names with (TBA) or similar
    const cleanName = trimmed.replace(/\s\([A-Z]+\)$/, '');
    return TEAM_TRANSLATIONS[cleanName] || TEAM_TRANSLATIONS[trimmed] || trimmed;
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
                // Look for date-grouped sections or individual match cards
                const daySections = document.querySelectorAll('[class*="MatchDateSection"], [class*="MatchGroup"], .match-list-date');
                
                if (daySections.length > 0) {
                    daySections.forEach(section => {
                        const dateText = section.querySelector('[class*="DateHeader"], .date-header')?.innerText || "";
                        const matchItems = section.querySelectorAll('[class*="MatchItem"], .match-card');
                        
                        matchItems.forEach(item => {
                            const teamNames = Array.from(item.querySelectorAll('[class*="TeamName"], .team-name')).map(el => el.innerText.trim());
                            const time = item.querySelector('[class*="MatchTime"], .match-time')?.innerText || "TBA";
                            const groupText = item.querySelector('[class*="GroupName"], .group-name')?.innerText || "";
                            
                            if (teamNames.length >= 2) {
                                results.push({
                                    home: teamNames[0],
                                    away: teamNames[1],
                                    time: time.match(/\d{2}:\d{2}/)?.[0] || time,
                                    date: dateText.trim(),
                                    group: groupText.trim()
                                });
                            }
                        });
                    });
                } else {
                    // Fallback to searching all match cards directly
                    document.querySelectorAll('[class*="MatchItem"], .match-card, [class*="FpMatchCard"]').forEach(item => {
                        const teamNames = Array.from(item.querySelectorAll('[class*="TeamName"], .team-name')).map(el => el.innerText.trim());
                        const time = item.innerText.match(/\d{2}:\d{2}/)?.[0] || "TBA";
                        
                        if (teamNames.length >= 2) {
                            results.push({
                                home: teamNames[0],
                                away: teamNames[1],
                                time,
                                date: "",
                                group: ""
                            });
                        }
                    });
                }
                return results;
            });

            if (extracted.length > 0) {
                matches = extracted.map(m => ({
                    ...m,
                    date: m.date?.toLowerCase()
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
                        .replace('december', 'december'),
                    home: translateTeam(m.home),
                    away: translateTeam(m.away),
                    group: m.group ? (m.group.includes('Group') ? m.group.replace('Group', 'Grupp') : m.group) : ""
                }));
                console.log(`Successfully scraped ${matches.length} matches!`);
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
