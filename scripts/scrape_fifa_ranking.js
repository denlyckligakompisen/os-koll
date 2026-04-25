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
        await page.goto(RANKING_URL, { waitUntil: 'load', timeout: 60000 });
        await page.waitForSelector('table', { timeout: 30000 });

        // 1. Extract Update Dates
        const updateDates = await page.evaluate(() => {
            const content = document.body.innerText;
            const lastMatch = content.match(/Last official update[:\s]+([^|\n]+)/i);
            const nextMatch = content.match(/Next official update[:\s]+([^|\n]+)/i);
            return {
                lastUpdate: lastMatch ? lastMatch[1].trim() : null,
                nextUpdate: nextMatch ? nextMatch[1].trim() : null
            };
        });
        console.log(`📅 Dates found - Last: ${updateDates.lastUpdate}, Next: ${updateDates.nextUpdate}`);

        // 2. Click "Show full rankings" if present (this often unlocks the full list)
        const showFullClicked = await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button, a')).find(el => 
                el.innerText.includes('Show full rankings') || el.innerText.includes('Visa hela rankingen')
            );
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        });
        if (showFullClicked) {
            console.log('🔓 Clicked "Show full rankings", waiting for load...');
            await page.waitForTimeout(3000);
        }

        // 3. Click "Show more" button until all teams are loaded
        console.log('Loading all 211 teams...');
        let clickCount = 0;
        const maxClicks = 25; 
        
        while (clickCount < maxClicks) {
            try {
                const clicked = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const showMoreBtn = buttons.find(b => 
                        (b.innerText.includes('Show more') || b.innerText.includes('Visa fler')) &&
                        b.className.includes('multiselect-filter-module_showMoreButton')
                    );
                    
                    if (showMoreBtn) {
                        showMoreBtn.scrollIntoView({ block: 'center' });
                        showMoreBtn.click();
                        return true;
                    }
                    return false;
                });
                
                if (clicked) {
                    clickCount++;
                    // Wait for new rows to load
                    await page.waitForTimeout(2000);
                    const currentRowCount = await page.evaluate(() => document.querySelectorAll('table tbody tr').length);
                    console.log(`Clicked "Show more" (${clickCount}). Current rows: ${currentRowCount}`);
                    
                    if (currentRowCount >= 211) {
                        console.log('Reached 211+ teams!');
                        break;
                    }
                } else {
                    console.log('No more "Show more" button visible.');
                    break;
                }
            } catch (e) {
                console.log('Stopped clicking:', e.message);
                break;
            }
        }
        
        const rankings = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.map(row => {
                const tds = row.querySelectorAll('td');
                if (tds.length < 6) return null;
                
                const rankText = tds[0]?.innerText.trim();
                const rank = rankText.split('\n')[0];
                const team = tds[1]?.innerText.trim();
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
            lastUpdate: updateDates.lastUpdate,
            nextUpdate: updateDates.nextUpdate,
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
