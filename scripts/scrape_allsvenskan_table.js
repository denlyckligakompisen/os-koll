import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TEAM_NAME_MAP = {
    'BP': 'IF Brommapojkarna',
    'Hammarby': 'Hammarby IF',
    'Djurgården': 'Djurgårdens IF'
};

async function scrapeTable() {
    console.log('Scraping Allsvenskan table...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://allsvenskan.se/statistik/tabell', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const tableData = await page.evaluate((teamNameMap) => {
            const rows = document.querySelectorAll('tr:not(.standings-table--header)');
            const data = [];
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 10) {
                    let teamName = cells[1].innerText.split('\n')[0].trim();
                    
                    // Map to official name if exists
                    if (teamNameMap[teamName]) {
                        teamName = teamNameMap[teamName];
                    }

                    data.push({
                        rank: cells[0].innerText.trim(),
                        team: teamName,
                        played: cells[3].innerText.trim(),
                        won: cells[4].innerText.trim(),
                        drawn: cells[5].innerText.trim(),
                        lost: cells[6].innerText.trim(),
                        goals: `${cells[7].innerText.trim()}-${cells[8].innerText.trim()}`,
                        gd: cells[9].innerText.trim(),
                        points: cells[10].innerText.trim()
                    });
                }
            });
            return data;
        }, TEAM_NAME_MAP);

        if (tableData.length === 0) {
            throw new Error('No table data found. Selectors might have changed.');
        }

        const outputPath = path.join(process.cwd(), 'public/data/allsvenskan_table.json');
        fs.writeFileSync(outputPath, JSON.stringify({
            table: tableData,
            lastUpdated: new Date().toISOString()
        }, null, 2));
        
        console.log(`Successfully scraped ${tableData.length} teams and saved to ${outputPath}`);

    } catch (error) {
        console.error('Error scraping table:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

scrapeTable();
