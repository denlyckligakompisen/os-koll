import { chromium } from 'playwright';
import fs from 'fs';

async function testScrape() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://allsvenskan.se/matcher', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const rows = await page.evaluate(() => {
        const results = [];
        const rows = document.querySelectorAll('.data-container__row');
        rows.forEach((row, i) => {
            if (i < 10) {
                results.push({
                    text: row.innerText,
                    html: row.innerHTML
                });
            }
        });
        return results;
    });

    fs.writeFileSync('c:/dev/os-koll/scratch/inspect_output.json', JSON.stringify(rows, null, 2));
    await browser.close();
}

testScrape();
