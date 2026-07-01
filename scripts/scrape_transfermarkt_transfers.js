/**
 * Scrape Allsvenskan team transfers from Transfermarkt.
 * 
 * Uses Playwright to:
 * 1. Discover correct team verein IDs from the Allsvenskan league page
 * 2. Navigate each team's transfers page and extract arrivals/departures
 *
 * Usage: node scripts/scrape_transfermarkt_transfers.js
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { fetchAndSaveExchangeRate } from './lib/fetchExchangeRate.js';

const SEASON_ID = '2025'; // 2025/26 season
const LEAGUE_URL = `https://www.transfermarkt.com/allsvenskan/transfers/wettbewerb/SE1/plus/0?saison_id=${SEASON_ID}&s_w=&leihe=1&intern=0`;

// Fallback map for matching TM names to our display names
const TM_NAME_TO_DISPLAY = {
    'AIK Fotboll': 'AIK',
    'AIK': 'AIK',
    'BK Häcken': 'BK Häcken',
    'Degerfors IF': 'Degerfors IF',
    'Djurgårdens IF': 'Djurgårdens IF',
    'GAIS': 'GAIS',
    'Halmstads BK': 'Halmstads BK',
    'Hammarby IF': 'Hammarby IF',
    'IF Brommapojkarna': 'IF Brommapojkarna',
    'IF Elfsborg': 'IF Elfsborg',
    'IFK Göteborg': 'IFK Göteborg',
    'IK Sirius': 'IK Sirius',
    'Kalmar FF': 'Kalmar FF',
    'Malmö FF': 'Malmö FF',
    'Mjällby AIF': 'Mjällby AIF',
    'Västerås SK FK': 'Västerås SK',
    'Västerås SK': 'Västerås SK',
    'Örgryte IS': 'Örgryte IS',
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('🔄 Scraping Allsvenskan transfers from Transfermarkt...\n');

    await fetchAndSaveExchangeRate();

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        locale: 'en-US',
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9',
        }
    });
    const page = await context.newPage();

    // Step 1: Scrape all transfers from the league-wide transfers page
    console.log('📋 Fetching league-wide transfers page...');
    console.log(`   ${LEAGUE_URL}\n`);
    
    await page.goto(LEAGUE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);

    const allTransfers = await page.evaluate((nameMap) => {
        const result = {};

        // The league transfers page has all teams' transfers in sections
        // Each team section has a header with the club name and two tables (IN / OUT)
        const boxes = document.querySelectorAll('.box');

        for (const box of boxes) {
            // Check for team header
            const teamHeader = box.querySelector('.table-header img[alt]');
            const teamNameEl = box.querySelector('.table-header a[href*="verein"]') 
                || box.querySelector('.content-box-headline a');
            
            let teamName = teamHeader?.alt?.trim() || teamNameEl?.textContent?.trim() || '';
            if (!teamName) continue;

            // Map to our display name
            const displayName = nameMap[teamName] || teamName;

            if (!result[displayName]) {
                result[displayName] = { arrivals: [], departures: [] };
            }

            // Find all transfer tables in this box
            const tables = box.querySelectorAll('table.items');
            
            for (const table of tables) {
                // Determine direction from the header above the table
                let direction = null;
                const prevEl = table.previousElementSibling;
                const headerAbove = prevEl?.textContent?.toLowerCase() || '';
                const boxHeaderText = box.querySelector('.content-box-headline')?.textContent?.toLowerCase() || '';
                
                if (headerAbove.includes('in') || headerAbove.includes('arrivals') || headerAbove.includes('zugänge')) {
                    direction = 'arrivals';
                } else if (headerAbove.includes('out') || headerAbove.includes('departures') || headerAbove.includes('abgänge')) {
                    direction = 'departures';
                }

                // If we can't determine from sibling, check the box headline
                if (!direction) {
                    if (boxHeaderText.includes('in:') || boxHeaderText.includes('arrivals')) {
                        direction = 'arrivals';
                    } else if (boxHeaderText.includes('out:') || boxHeaderText.includes('departures')) {
                        direction = 'departures';
                    }
                }

                if (!direction) continue;

                const rows = table.querySelectorAll('tbody > tr');
                for (const row of rows) {
                    // Player name
                    const playerEl = row.querySelector('td.hauptlink a') || row.querySelector('.hauptlink a');
                    const playerName = playerEl?.textContent?.trim() || '';
                    if (!playerName) continue;

                    // Position 
                    const posEl = row.querySelector('.inline-table tr:last-child td');
                    const position = posEl?.textContent?.trim() || '';

                    // Age
                    const cells = row.querySelectorAll('td.zentriert');
                    let age = '';
                    for (const c of cells) {
                        const txt = c.textContent.trim();
                        if (/^\d{1,2}$/.test(txt) && parseInt(txt) > 14 && parseInt(txt) < 50) {
                            age = txt;
                            break;
                        }
                    }

                    // From/To club — find the second team link (not the current team)
                    const teamLinks = row.querySelectorAll('td.vereinswappen_tooltip a img[alt], td a.vereinprofil_tooltip img[alt]');
                    let otherClub = '';
                    for (const img of teamLinks) {
                        const alt = img.alt?.trim();
                        if (alt && alt !== teamName && alt !== displayName) {
                            otherClub = alt;
                        }
                    }
                    // Fallback: check for text in the last cells
                    if (!otherClub) {
                        const allLinks = row.querySelectorAll('a[href*="verein"]');
                        for (const link of allLinks) {
                            const text = link.textContent?.trim();
                            if (text && text !== teamName && text !== displayName && text.length > 1) {
                                otherClub = text;
                            }
                        }
                    }

                    // Fee
                    const feeCell = row.querySelector('td.rechts a') || row.querySelector('td:last-child a');
                    let fee = feeCell?.textContent?.trim() || '';
                    if (!fee) {
                        // Try last td
                        const lastTd = row.querySelector('td:last-child');
                        fee = lastTd?.textContent?.trim() || '';
                    }
                    // Clean: keep only if it looks like a fee
                    if (fee && !fee.includes('€') && !fee.includes('k') && !fee.includes('m') &&
                        !fee.toLowerCase().includes('loan') && !fee.toLowerCase().includes('free') &&
                        !fee.includes('Loan') && !fee.includes('Free') && !fee.includes('End') && !fee.includes('?')) {
                        // Check for "free transfer" pattern  
                        if (!fee.toLowerCase().includes('transfer')) {
                            fee = '-';
                        }
                    }

                    const entry = {
                        player: playerName,
                        age,
                        position,
                        fee: fee || '-',
                    };

                    if (direction === 'arrivals') {
                        entry.from = otherClub;
                        result[displayName].arrivals.push(entry);
                    } else {
                        entry.to = otherClub;
                        result[displayName].departures.push(entry);
                    }
                }
            }
        }

        return result;
    }, TM_NAME_TO_DISPLAY);

    // Log results
    let totalIn = 0, totalOut = 0;
    for (const [team, data] of Object.entries(allTransfers)) {
        const inCount = data.arrivals.length;
        const outCount = data.departures.length;
        totalIn += inCount;
        totalOut += outCount;
        if (inCount > 0 || outCount > 0) {
            console.log(`  ✓ ${team}: ${inCount} in, ${outCount} ut`);
        }
    }

    // If the league page didn't work well, try individual team pages
    if (totalIn === 0 && totalOut === 0) {
        console.log('\n⚠️  League page returned no data. Trying individual team pages...\n');
        
        // Navigate to the Allsvenskan page to discover team URLs
        await page.goto('https://www.transfermarkt.com/allsvenskan/startseite/wettbewerb/SE1', {
            waitUntil: 'domcontentloaded', timeout: 30000
        });
        await page.waitForTimeout(2000);

        // Extract team links
        const teamLinks = await page.evaluate(() => {
            const links = [];
            const rows = document.querySelectorAll('table.items tbody tr td a[href*="/verein/"]');
            const seen = new Set();
            for (const a of rows) {
                const href = a.getAttribute('href');
                const match = href?.match(/\/([^/]+)\/startseite\/verein\/(\d+)/);
                if (match && !seen.has(match[2])) {
                    seen.add(match[2]);
                    const name = a.querySelector('img')?.alt?.trim() || a.textContent?.trim() || '';
                    if (name) {
                        links.push({ slug: match[1], id: match[2], name });
                    }
                }
            }
            return links;
        });

        console.log(`Found ${teamLinks.length} teams\n`);

        for (let i = 0; i < teamLinks.length; i++) {
            const { slug, id, name } = teamLinks[i];
            const displayName = TM_NAME_TO_DISPLAY[name] || name;
            const url = `https://www.transfermarkt.com/${slug}/transfers/verein/${id}/saison_id/${SEASON_ID}`;
            console.log(`[${i + 1}/${teamLinks.length}] ${displayName}: ${url}`);

            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForTimeout(2000);

                const transfers = await page.evaluate(() => {
                    const result = { arrivals: [], departures: [] };
                    const boxes = document.querySelectorAll('.box');

                    for (const box of boxes) {
                        const header = box.querySelector('.content-box-headline, .table-header, h2');
                        const headerText = (header?.textContent || '').trim().toLowerCase();

                        let type = null;
                        if (headerText.includes('arrivals') || headerText.includes('zugänge') || headerText.includes('in:')) {
                            type = 'arrivals';
                        } else if (headerText.includes('departures') || headerText.includes('abgänge') || headerText.includes('out:')) {
                            type = 'departures';
                        }
                        if (!type) continue;

                        const rows = box.querySelectorAll('table.items tbody tr');
                        for (const row of rows) {
                            const playerEl = row.querySelector('td.hauptlink a, .hauptlink a');
                            const playerName = playerEl?.textContent?.trim() || '';
                            if (!playerName) continue;

                            const posEl = row.querySelector('.inline-table tr:last-child td');
                            const position = posEl?.textContent?.trim() || '';

                            const cells = row.querySelectorAll('td.zentriert');
                            let age = '';
                            for (const c of cells) {
                                const txt = c.textContent.trim();
                                if (/^\d{1,2}$/.test(txt) && parseInt(txt) > 14 && parseInt(txt) < 50) {
                                    age = txt;
                                    break;
                                }
                            }

                            // Find other club
                            let otherClub = '';
                            const imgs = row.querySelectorAll('img[alt]');
                            for (const img of imgs) {
                                const alt = img.alt?.trim();
                                if (alt && alt.length > 1 && !alt.includes('flag') && !img.src.includes('flagge')) {
                                    otherClub = alt;
                                }
                            }

                            const feeCell = row.querySelector('td.rechts a') || row.querySelector('td:last-child');
                            let fee = feeCell?.textContent?.trim() || '-';

                            const entry = { player: playerName, age, position, fee };
                            if (type === 'arrivals') {
                                entry.from = otherClub;
                                result.arrivals.push(entry);
                            } else {
                                entry.to = otherClub;
                                result.departures.push(entry);
                            }
                        }
                    }
                    return result;
                });

                allTransfers[displayName] = transfers;
                console.log(`     ✓ ${transfers.arrivals.length} in, ${transfers.departures.length} ut`);
            } catch (e) {
                console.error(`     ✗ ${e.message}`);
                allTransfers[displayName] = { arrivals: [], departures: [] };
            }

            if (i < teamLinks.length - 1) {
                await sleep(2000 + Math.random() * 2000);
            }
        }

        totalIn = 0; totalOut = 0;
        for (const data of Object.values(allTransfers)) {
            totalIn += data.arrivals.length;
            totalOut += data.departures.length;
        }
    }

    await browser.close();

    const output = {
        lastUpdated: new Date().toISOString(),
        source: 'transfermarkt.com',
        season: '2025/26',
        teams: allTransfers,
    };

    const outputPath = path.join(process.cwd(), 'public/data/allsvenskan_transfers.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`\n✅ Done! Saved to ${outputPath}`);
    console.log(`   ${Object.keys(allTransfers).length} lag, ${totalIn} nyförvärv, ${totalOut} försäljningar`);
}

main().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
