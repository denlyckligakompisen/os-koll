import { chromium } from 'playwright';

async function inspect() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://allsvenskan.se/statistik/tabell');
    await page.waitForTimeout(3000);
    
    const cells = await page.evaluate(() => {
        const row = document.querySelector('tr:not(.standings-table--header)');
        if (!row) return ['No row found'];
        return Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
    });
    
    console.log(cells);
    await browser.close();
}
inspect();
