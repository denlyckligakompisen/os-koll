import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function scrapeMaraton() {
    console.log('Scraping Allsvenskan maratontabell...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://www.svenskfotboll.se/serier-cuper/elitfotboll/historik-herr/maratontabell/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const tableData = await page.evaluate(() => {
            const table = document.querySelector('table');
            const rows = Array.from(table.querySelectorAll('tr'));
            
            return rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length >= 5) {
                    return {
                        rank: cells[0].innerText.trim(),
                        team: cells[1].innerText.trim(),
                        seasons: cells[2].innerText.trim(),
                        played: cells[3].innerText.trim(),
                        points: cells[4].innerText.trim()
                    };
                }
                return null;
            }).filter(Boolean);
        });

        const outputPath = path.join(process.cwd(), 'public/data/allsvenskan_maraton.json');
        fs.writeFileSync(outputPath, JSON.stringify({
            table: tableData,
            lastUpdated: new Date().toISOString()
        }, null, 2));
        
        console.log(`Successfully scraped ${tableData.length} teams for maratontabell`);

    } catch (error) {
        console.error('Error scraping maratontabell:', error.message);
    } finally {
        await browser.close();
    }
}

scrapeMaraton();
