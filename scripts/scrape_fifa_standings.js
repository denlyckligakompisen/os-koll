import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const STANDINGS_URL = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings';
const OUTPUT_PATH = path.join(process.cwd(), 'public/data/worldcup_2026_groups.json');

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
        }, TEAM_TRANSLATIONS); // Pass translations to evaluation context

        await browser.close();

        // Second pass: apply translations (since passing whole map to evaluate might be tricky/slow)
        const translatedGroups = groups.map(g => ({
            ...g,
            teams: g.teams.map(t => ({
                ...t,
                name: translateTeam(t.name)
            }))
        }));

        const currentData = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));

        if (translatedGroups.length > 0) {
            currentData.groups = translatedGroups;
            console.log(`Successfully parsed ${translatedGroups.length} groups.`);
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
