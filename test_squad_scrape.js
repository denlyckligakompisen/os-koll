import { chromium } from 'playwright';

async function main() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.transfermarkt.com/ik-sirius/kader/verein/7945/saison_id/2025/plus/1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const players = await page.evaluate(() => {
        const rows = document.querySelectorAll('table.items > tbody > tr.odd, table.items > tbody > tr.even');
        const squad = [];
        for (const row of rows) {
            const nameEl = row.querySelector('.inline-table td.hauptlink a');
            if (!nameEl) continue;
            
            const positionEl = row.querySelector('.inline-table tr:nth-child(2) td');
            const numEl = row.querySelector('.rn_nummer');
            const ageEl = row.querySelectorAll('td.zentriert')[1]; // typically the 2nd centered td is age/dob
            const valEl = row.querySelector('.rechts.hauptlink');

            squad.push({
                name: nameEl.textContent.trim(),
                position: positionEl ? positionEl.textContent.trim() : '',
                number: numEl ? numEl.textContent.trim() : '',
                age: ageEl ? ageEl.textContent.trim() : '',
                value: valEl ? valEl.textContent.trim() : ''
            });
        }
        return squad;
    });
    
    console.log(JSON.stringify(players, null, 2));
    await browser.close();
}
main();
