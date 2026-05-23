/**
 * Scrape Allsvenskan player squads from Transfermarkt.
 * 
 * Uses Playwright to:
 * 1. Discover correct team verein IDs from the Allsvenskan league page
 * 2. Navigate to each team's kader (squad) page and extract player details
 *
 * Usage: node scripts/scrape_squads.js
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const SEASON_ID = '2025'; // 2025/26 season
const LEAGUE_URL = `https://www.transfermarkt.com/allsvenskan/startseite/wettbewerb/SE1`;
const OUTPUT_FILE = path.join(process.cwd(), 'public/data/allsvenskan_squads.json');

// Fallback map for matching TM names to our display names
const TM_NAME_TO_DISPLAY = {
    'AIK Fotboll': 'AIK',
    'AIK': 'AIK',
    'BK HA cken': 'BK HA cken',
    'BK Häcken': 'BK Häcken',
    'Degerfors IF': 'Degerfors IF',
    'DjurgArdens IF': 'Djurgårdens IF',
    'Djurgårdens IF': 'Djurgårdens IF',
    'GAIS': 'GAIS',
    'Halmstads BK': 'Halmstads BK',
    'Hammarby IF': 'Hammarby IF',
    'IF Brommapojkarna': 'IF Brommapojkarna',
    'IF Elfsborg': 'IF Elfsborg',
    'IFK GA teborg': 'IFK Göteborg',
    'IFK Göteborg': 'IFK Göteborg',
    'IK Sirius': 'IK Sirius',
    'Kalmar FF': 'Kalmar FF',
    'MalmA  FF': 'Malmö FF',
    'Malmö FF': 'Malmö FF',
    'MjA llby AIF': 'Mjällby AIF',
    'Mjällby AIF': 'Mjällby AIF',
    'VA sterAs SK FK': 'Västerås SK',
    'Västerås SK': 'Västerås SK',
    'A-rgryte IS': 'Örgryte IS',
    'Örgryte IS': 'Örgryte IS',
};

function cleanTeamName(tmName) {
    let cleaned = tmName.replace(/Fotboll/g, '').trim();
    return TM_NAME_TO_DISPLAY[cleaned] || TM_NAME_TO_DISPLAY[tmName] || tmName;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('🤖 Scraping Allsvenskan player squads from Transfermarkt...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        locale: 'en-US',
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9',
        }
    });
    const page = await context.newPage();

    console.log('📡 Fetching league-wide overview page...');
    console.log(`   ${LEAGUE_URL}\n`);
    
    await page.goto(LEAGUE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);

    // Extract team links
    const teams = await page.evaluate(() => {
        const teamLinks = [];
        const rows = document.querySelectorAll('#yw1 table.items > tbody > tr');
        
        for (const row of rows) {
            const linkEl = row.querySelector('td.hauptlink a');
            if (linkEl) {
                teamLinks.push({
                    name: linkEl.textContent.trim(),
                    url: linkEl.href
                });
            }
        }
        return teamLinks;
    });

    console.log(`✅ Found ${teams.length} teams.`);

    const allSquads = {};

    for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const teamName = cleanTeamName(team.name);
        console.log(`\n▶️ [${i+1}/${teams.length}] Processing ${teamName}...`);
        
        // Transform the startseite URL to the kader URL
        // From: https://www.transfermarkt.com/malmo-ff/startseite/verein/496/saison_id/2025
        // To:   https://www.transfermarkt.com/malmo-ff/kader/verein/496/saison_id/2025/plus/1
        const squadUrl = team.url.replace('/startseite/', '/kader/') + '/plus/1';
        
        await page.goto(squadUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(2000); // Wait for table to render

        const players = await page.evaluate(() => {
            const rows = document.querySelectorAll('table.items > tbody > tr.odd, table.items > tbody > tr.even');
            const squad = [];
            for (const row of rows) {
                const nameEl = row.querySelector('.inline-table td.hauptlink a');
                if (!nameEl) continue;
                
                const positionEl = row.querySelector('.inline-table tr:nth-child(2) td');
                const numEl = row.querySelector('.rn_nummer');
                const ageEl = row.querySelectorAll('td.zentriert')[1];
                const valEl = row.querySelector('.rechts.hauptlink');
                
                const imgEl = row.querySelector('.inline-table td[rowspan="2"] img');
                
                const allTds = row.querySelectorAll('td');
                const joined = allTds.length > 9 ? allTds[9].textContent.trim() : '';
                const contract = allTds.length > 11 ? allTds[11].textContent.trim() : '';
                
                let nationalities = [];
                if (allTds.length > 6) {
                    const natImgs = allTds[6].querySelectorAll('img');
                    for (const img of natImgs) {
                        if (img.src && img.title) {
                            nationalities.push({ url: img.src, country: img.title });
                        }
                    }
                }

                squad.push({
                    name: nameEl.textContent.trim(),
                    position: positionEl ? positionEl.textContent.trim() : 'Unknown',
                    number: numEl && numEl.textContent.trim() !== '-' ? numEl.textContent.trim() : null,
                    age: ageEl ? ageEl.textContent.trim() : '',
                    value: valEl ? valEl.textContent.trim() : '-',
                    joined: joined,
                    contract: contract,
                    nationalities: nationalities,
                    image: imgEl ? imgEl.src : null
                });
            }
            return squad;
        });

        allSquads[teamName] = players;
        console.log(`   Scraped ${players.length} players.`);
        await sleep(1000); // Politeness delay
    }

    const outputData = {
        lastUpdated: new Date().toISOString(),
        source: 'transfermarkt.com',
        season: '2025/26',
        teams: allSquads
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
    console.log(`\n✅ Saved squads for ${Object.keys(allSquads).length} teams to ${OUTPUT_FILE}`);

    await browser.close();
}

main().catch(console.error);
