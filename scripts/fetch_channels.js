import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const MATCHES_FILE = path.join(process.cwd(), 'public', 'data', 'worldcup_2026_matches.json');

async function scrapeChannels() {
    console.log('Starting scraper for TV channels...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    let svtMatches = [];
    let tv4Matches = [];

    try {
        console.log('Scraping SVT...');
        await page.goto('https://www.svtplay.se/kategori/fotbolls-vm?tab=schedule', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        svtMatches = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a, h1, h2, h3, h4, span, p, div[class*="title"]')).map(el => {
                return {
                    text: el.innerText ? el.innerText.trim() : '',
                    href: el.href || ''
                };
            }).filter(item => item.text && item.text.includes('-'));
        });
        
        console.log('Scraping TV4...');
        await page.goto('https://www.tv4play.se/kategorier/fifa-fotbolls-vm-2026', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        tv4Matches = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a, h1, h2, h3, h4, span, p')).map(el => {
                return {
                    text: el.innerText ? el.innerText.trim() : '',
                    href: el.href || ''
                };
            }).filter(item => item.text && item.text.includes('-'));
        });
        
        // Load matches
        if (fs.existsSync(MATCHES_FILE)) {
            const data = JSON.parse(fs.readFileSync(MATCHES_FILE, 'utf8'));
            let updated = false;

            for (const match of data.matches) {
                if (match.broadcast) continue; // Already has a broadcast channel
                
                const normalize = (name) => {
                    let n = name.toLowerCase();
                    if (n.includes('bosnien')) return 'bosnien';
                    if (n.includes('kongo')) return 'kongo';
                    return n;
                };
                
                const homeLower = normalize(match.home);
                const awayLower = normalize(match.away);

                // Check SVT
                const svtLink = svtMatches.find(l => l.text.toLowerCase().includes(homeLower) && l.text.toLowerCase().includes(awayLower));
                if (svtLink) {
                    match.broadcast = 'SVT';
                    if (svtLink.href && svtLink.href.startsWith('http')) match.link = svtLink.href;
                    updated = true;
                    console.log(`Found SVT channel for ${match.home} - ${match.away}`);
                    continue;
                }

                // Check TV4
                const tv4Link = tv4Matches.find(l => l.text.toLowerCase().includes(homeLower) && l.text.toLowerCase().includes(awayLower));
                if (tv4Link) {
                    match.broadcast = 'TV4';
                    if (tv4Link.href && tv4Link.href.startsWith('http')) match.link = tv4Link.href;
                    updated = true;
                    console.log(`Found TV4 channel for ${match.home} - ${match.away}`);
                }
            }

            if (updated) {
                fs.writeFileSync(MATCHES_FILE, JSON.stringify(data, null, 2));
                console.log('Updated matches JSON with new channels.');
            } else {
                console.log('No new channels found.');
            }
        }
        
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

scrapeChannels();
