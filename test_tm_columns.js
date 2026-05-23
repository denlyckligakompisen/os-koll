import { chromium } from 'playwright';

async function main() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.transfermarkt.com/ik-sirius/kader/verein/7945/saison_id/2025/plus/1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const firstPlayerNat = await page.evaluate(() => {
        const row = document.querySelector('table.items > tbody > tr.odd');
        if (!row) return [];
        const allTds = row.querySelectorAll('td');
        if (allTds.length < 7) return [];
        
        const natTd = allTds[6];
        const flagImgs = Array.from(natTd.querySelectorAll('img')).map(img => ({
            url: img.src,
            country: img.title
        }));
        return flagImgs;
    });
    
    console.log(JSON.stringify(firstPlayerNat, null, 2));
    await browser.close();
}
main();
