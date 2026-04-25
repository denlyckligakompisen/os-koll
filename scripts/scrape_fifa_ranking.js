import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const RANKING_URL = 'https://inside.fifa.com/fifa-world-ranking/men';
const OUTPUT_FILE = path.join(process.cwd(), 'public/data/fifa_ranking.json');

const TEAM_TRANSLATIONS = {
    'Germany': 'Tyskland',
    'Argentina': 'Argentina',
    'France': 'Frankrike',
    'Belgium': 'Belgien',
    'Brazil': 'Brasilien',
    'Netherlands': 'Nederländerna',
    'Portugal': 'Portugal',
    'Spain': 'Spanien',
    'Italy': 'Italien',
    'Croatia': 'Kroatien',
    'USA': 'USA',
    'United States': 'USA',
    'Mexico': 'Mexiko',
    'Sweden': 'Sverige',
    'Norway': 'Norge',
    'Denmark': 'Danmark',
    'England': 'England',
    'Switzerland': 'Schweiz',
    'Morocco': 'Marocko',
    'Colombia': 'Colombia',
    'Uruguay': 'Uruguay',
    'Japan': 'Japan',
    'Senegal': 'Senegal',
    'South Korea': 'Sydkorea',
    'Australia': 'Australien',
    'Ukraine': 'Ukraina',
    'Bosnia and Herzegovina': 'Bosnien och Hercegovina',
    'Bosnia': 'Bosnien och Hercegovina',
    'Saudi Arabia': 'Saudiarabien',
    'Egypt': 'Egypten',
    'Tunisia': 'Tunisien',
    'Algeria': 'Algeriet',
    'Austria': 'Österrike',
    'Turkey': 'Turkiet',
    'Türkiye': 'Turkiet',
    'Czech Republic': 'Tjeckien',
    'Czechia': 'Tjeckien',
    'Poland': 'Polen',
    'Scotland': 'Skottland',
    'Wales': 'Wales',
    'Ecuador': 'Ecuador',
    'Cape Verde': 'Kap Verde',
    'Ivory Coast': 'Elfenbenskusten',
    'Iran': 'Iran',
    'Qatar': 'Qatar',
    'Uzbekistan': 'Uzbekistan',
    'Iraq': 'Irak',
    'UAE': 'Förenade Arabemiraten',
    'United Arab Emirates': 'Förenade Arabemiraten',
    'Jordan': 'Jordanien',
    'Panama': 'Panama',
    'South Africa': 'Sydafrika',
    'Jamaica': 'Jamaika',
    'Haiti': 'Haiti',
    'Curaçao': 'Curaçao',
    'Curacao': 'Curaçao'
};

const translateTeam = (name) => {
    if (!name) return name;
    const trimmed = name.trim();
    return TEAM_TRANSLATIONS[trimmed] || trimmed;
};

async function scrapeRanking() {
    console.log(`Scraping FIFA World Ranking from ${RANKING_URL}...`);
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // Use domcontentloaded as FIFA's page can be heavy on network and trigger timeouts
        await page.goto(RANKING_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Wait for the table to appear and then a bit more for data to populate
        await page.waitForSelector('table', { timeout: 30000 });
        await page.waitForTimeout(3000);

        // Click "Show more" button a few times to get more teams (top 100-200)
        console.log('Loading more teams...');
        for (let i = 0; i < 5; i++) {
            try {
                // Find button that contains "Show more" or "Visa fler"
                const button = await page.locator('button:has-text("Show more"), button:has-text("Visa fler")').first();
                if (await button.isVisible()) {
                    await button.scrollIntoViewIfNeeded();
                    await button.click();
                    console.log(`Clicked "Show more" (${i+1})...`);
                    await page.waitForTimeout(2000);
                } else {
                    break;
                }
            } catch (e) {
                break;
            }
        }
        
        const rankings = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.map(row => {
                const tds = row.querySelectorAll('td');
                if (tds.length < 6) return null;
                
                // Rank is often in the first cell, might have \n for change
                const rankText = tds[0]?.innerText.trim();
                const rank = rankText.split('\n')[0];
                
                // Team name is in the second cell
                const team = tds[1]?.innerText.trim();
                
                // Points is in the 6th cell (index 5)
                const points = tds[5]?.innerText.trim();
                
                return { rank, team, points };
            }).filter(r => r && r.team);
        });
        
        const translatedRankings = rankings.map(r => ({
            ...r,
            team: translateTeam(r.team)
        }));
        
        const outputData = {
            rankings: translatedRankings,
            lastUpdated: new Date().toISOString(),
            source: RANKING_URL
        };
        
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
        
        console.log(`Successfully scraped ${translatedRankings.length} teams and saved to ${OUTPUT_FILE}`);
        
    } catch (error) {
        console.error('Error scraping ranking:', error.message);
    } finally {
        await browser.close();
    }
}

scrapeRanking();
